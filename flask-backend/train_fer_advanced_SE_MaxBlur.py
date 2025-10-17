# -*- coding: utf-8 -*-
"""
FER2013 Advanced Training Script with SE Blocks & MaxBlurPool2D
================================================================
This script trains a facial emotion recognition model on FER2013 dataset with:
- MaxBlurPool2D: Anti-aliased downsampling (replaces standard MaxPooling)
- Squeeze-and-Excitation (SE) blocks: Channel attention mechanism
- Official FER2013 splits: Training / PublicTest / PrivateTest
- Class imbalance handling with RandomOverSampler
- Data augmentation for better generalization

Model Architecture:
- 5 convolutional blocks with double conv layers
- SE attention after each block
- MaxBlurPool2D for anti-aliased downsampling
- Dense head with dropout for regularization
- Input: 64x64 grayscale images
- Output: 7 emotion classes

Usage:
1. For Google Colab: Upload FER2013 CSV to Google Drive
2. For local: Place fer2013.csv in flask-backend directory
3. Run: python train_fer_advanced_SE_MaxBlur.py

Author: EmotionAid Team
Date: 2025
"""

# ===== Mount Google Drive (Colab) =====
try:
    from google.colab import drive  # type: ignore
    drive.mount('/content/drive')
    IN_COLAB = True
except Exception:
    print("Not running in Google Colab or drive.mount not available. Using local paths.")
    IN_COLAB = False

# ===== Imports =====
import os, random, sys, subprocess
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns

# Ensure imbalanced-learn (for RandomOverSampler) is available
try:
    from imblearn.over_sampling import RandomOverSampler
except ImportError:
    print("Installing imbalanced-learn...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "imbalanced-learn"])
    from imblearn.over_sampling import RandomOverSampler

import tensorflow as tf
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (Dense, Conv2D, BatchNormalization, Dropout,
                                     Flatten)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras import layers

print(f"TensorFlow Version: {tf.__version__}")
print(f"GPU Available: {len(tf.config.list_physical_devices('GPU')) > 0}")

# ===== Reproducibility (best-effort) =====
SEED = 42
os.environ["PYTHONHASHSEED"] = str(SEED)
os.environ["TF_DETERMINISTIC_OPS"] = "1"
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)

# ===== Configuration =====
if IN_COLAB:
    DATA_PATH = "/content/drive/MyDrive/fer2013.csv"
    SAVE_MODEL_PATH = "/content/drive/MyDrive/fer_model_SE_MaxBlur.h5"
else:
    # Local paths - adjust as needed
    DATA_PATH = os.path.join(os.path.dirname(__file__), "fer2013.csv")
    SAVE_MODEL_PATH = os.path.join(os.path.dirname(__file__), "fer_model_SE_MaxBlur.h5")

INPUT_SIZE = (64, 64)  # Model expects 64x64x1
BATCH_SIZE = 64
EPOCHS = 100
LEARNING_RATE = 1e-3
NUM_CLASSES = 7
LABELS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

print("\n" + "="*70)
print("FER2013 ADVANCED TRAINING - SE BLOCKS & MAXBLURPOOL2D")
print("="*70)
print(f"Data Path: {DATA_PATH}")
print(f"Save Model Path: {SAVE_MODEL_PATH}")
print(f"Input Size: {INPUT_SIZE}")
print(f"Batch Size: {BATCH_SIZE}")
print(f"Epochs: {EPOCHS}")
print(f"Learning Rate: {LEARNING_RATE}")
print(f"Seed: {SEED}")
print("="*70 + "\n")

# ===== Custom Layers: MaxBlurPool2D and SqueezeExcite =====
class MaxBlurPool2D(layers.Layer):
    """
    MaxBlurPool2D: Anti-aliased downsampling layer
    
    Combines MaxPooling (stride=1) followed by depthwise blur pooling (stride=2).
    This provides shift-invariance and reduces aliasing artifacts while preserving
    important features from max pooling.
    
    Reference: "Making Convolutional Networks Shift-Invariant Again" (Zhang, 2019)
    
    Args:
        pool_size: Window size for initial max pool (default 2)
        filt_size: Size of the blur kernel; 3 or 5 recommended (default 3)
        stride: Downsampling stride for blur step (default 2)
    """
    def __init__(self, pool_size=2, filt_size=3, stride=2, **kwargs):
        super().__init__(**kwargs)
        self.pool_size = pool_size
        self.filt_size = filt_size
        self.stride = stride

    def build(self, input_shape):
        ch = int(input_shape[-1])
        # Create 1D blur kernel (binomial filter)
        if self.filt_size == 3:
            base = tf.constant([1., 2., 1.], dtype=tf.float32)
        elif self.filt_size == 5:
            base = tf.constant([1., 4., 6., 4., 1.], dtype=tf.float32)
        else:
            base = tf.constant([1., 2., 1.], dtype=tf.float32)
        
        kernel_1d = base / tf.reduce_sum(base)
        # Create 2D kernel via outer product
        kernel_2d = tf.tensordot(kernel_1d, kernel_1d, axes=0)  # [k,k]
        kernel_2d = kernel_2d[:, :, tf.newaxis, tf.newaxis]     # [k,k,1,1]
        kernel_2d = tf.tile(kernel_2d, [1, 1, ch, 1])           # [k,k,C,1]
        self.blur_kernel = tf.constant(kernel_2d, dtype=tf.float32)
        super().build(input_shape)

    def call(self, x):
        # Max pooling with stride 1 keeps resolution before blur-downsample
        x = tf.nn.max_pool2d(x, ksize=self.pool_size, strides=1, padding='SAME')
        # Depthwise blur with stride=2 (downsampling)
        x = tf.nn.depthwise_conv2d(x, self.blur_kernel,
                                   strides=[1, self.stride, self.stride, 1],
                                   padding='SAME')
        return x

    def get_config(self):
        cfg = super().get_config()
        cfg.update({
            "pool_size": self.pool_size,
            "filt_size": self.filt_size,
            "stride": self.stride
        })
        return cfg


class SqueezeExcite(layers.Layer):
    """
    Squeeze-and-Excitation Block: Channel attention mechanism
    
    Adaptively recalibrates channel-wise feature responses by explicitly
    modeling interdependencies between channels.
    
    Reference: "Squeeze-and-Excitation Networks" (Hu et al., 2018)
    
    Args:
        ratio: Reduction ratio for bottleneck (default 16)
    """
    def __init__(self, ratio=16, **kwargs):
        super().__init__(**kwargs)
        self.ratio = ratio

    def build(self, input_shape):
        ch = int(input_shape[-1])
        mid = max(1, ch // self.ratio)
        # 1x1 convs act as Dense layers on [B,1,1,C] squeezed tensor
        self.fc1 = layers.Conv2D(mid, kernel_size=1, activation='relu', use_bias=True)
        self.fc2 = layers.Conv2D(ch,  kernel_size=1, activation='sigmoid', use_bias=True)
        super().build(input_shape)

    def call(self, x):
        # Squeeze: Global average pooling to [B,1,1,C]
        se = tf.reduce_mean(x, axis=[1, 2], keepdims=True)
        # Excitation: Bottleneck MLP via 1x1 convs
        se = self.fc1(se)
        se = self.fc2(se)
        # Scale original features by attention weights
        return x * se

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"ratio": self.ratio})
        return cfg


# ===== Load and Prepare Data =====
print("Loading FER2013 dataset...")
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"FER2013 CSV not found at {DATA_PATH}\n"
        "Please download from: https://www.kaggle.com/datasets/msambare/fer2013\n"
        "Or place fer2013.csv in the flask-backend directory"
    )

df = pd.read_csv(DATA_PATH)
print("✅ Dataset loaded successfully!")
print("\nDataset Preview:")
print(df.head())
print("\nUsage Distribution:")
print(df["Usage"].value_counts())
print("\nEmotion Distribution:")
print(df["emotion"].value_counts())

# ===== Use Official Splits =====
train_df = df[df['Usage'] == 'Training'].reset_index(drop=True)
val_df   = df[df['Usage'] == 'PublicTest'].reset_index(drop=True)    # Validation
test_df  = df[df['Usage'] == 'PrivateTest'].reset_index(drop=True)   # Test

print(f"\n📊 Dataset Splits:")
print(f"   Training:   {len(train_df):,} samples")
print(f"   Validation: {len(val_df):,} samples")
print(f"   Test:       {len(test_df):,} samples")

# ===== Helper: Parse Pixel Strings to Arrays =====
def parse_pixels(series):
    """Convert '48x48' grayscale pixel strings into (N,48,48,1) float32 arrays"""
    arr = np.stack(series.apply(lambda x: np.fromstring(x, sep=' ', dtype=np.float32)).to_list())
    return arr.reshape(-1, 48, 48, 1)

print("\n📐 Parsing and resizing images...")
# Parse original 48x48 images
X_train_48 = parse_pixels(train_df['pixels'])
X_val_48   = parse_pixels(val_df['pixels'])
X_test_48  = parse_pixels(test_df['pixels'])

# Resize to 64x64 for model input
X_train = tf.image.resize(X_train_48, INPUT_SIZE, method=tf.image.ResizeMethod.BICUBIC).numpy()
X_val   = tf.image.resize(X_val_48,   INPUT_SIZE, method=tf.image.ResizeMethod.BICUBIC).numpy()
X_test  = tf.image.resize(X_test_48,  INPUT_SIZE, method=tf.image.ResizeMethod.BICUBIC).numpy()

y_train = train_df['emotion'].values.astype(int)
y_val   = val_df['emotion'].values.astype(int)
y_test  = test_df['emotion'].values.astype(int)

print(f"✅ Image parsing complete!")
print(f"   X_train: {X_train.shape}")
print(f"   X_val:   {X_val.shape}")
print(f"   X_test:  {X_test.shape}")

# ===== Handle Class Imbalance with Oversampling =====
print("\n⚖️ Applying RandomOverSampler to balance training classes...")
X_train_flat = X_train.reshape(X_train.shape[0], -1)
oversampler = RandomOverSampler(sampling_strategy='auto', random_state=SEED)
X_train_res_flat, y_train_res = oversampler.fit_resample(X_train_flat, y_train)
X_train_res = X_train_res_flat.reshape(-1, INPUT_SIZE[0], INPUT_SIZE[1], 1)

print(f"✅ Oversampling complete!")
print(f"   Original: {X_train.shape[0]:,} samples")
print(f"   After oversampling: {X_train_res.shape[0]:,} samples")
print("\nClass distribution after oversampling:")
unique, counts = np.unique(y_train_res, return_counts=True)
for emotion_idx, count in zip(unique, counts):
    print(f"   {LABELS[emotion_idx]}: {count:,} samples")

# ===== Normalize Pixel Values =====
print("\n🎨 Normalizing pixel values to [0, 1]...")
X_train_res = X_train_res.astype(np.float32) / 255.0
X_val = X_val.astype(np.float32) / 255.0
X_test = X_test.astype(np.float32) / 255.0

# ===== One-Hot Encode Labels =====
y_train_cat = to_categorical(y_train_res, num_classes=NUM_CLASSES)
y_val_cat   = to_categorical(y_val,       num_classes=NUM_CLASSES)
y_test_cat  = to_categorical(y_test,      num_classes=NUM_CLASSES)

# ===== Data Augmentation (Training Only) =====
print("\n🔄 Setting up data augmentation...")
datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode='nearest'
)
train_generator = datagen.flow(X_train_res, y_train_cat, batch_size=BATCH_SIZE, shuffle=True, seed=SEED)

# ===== Model Definition with SE and MaxBlur =====
def build_model(input_shape=(64, 64, 1), num_classes=7):
    """
    Advanced FER Model with SE Blocks and MaxBlurPool2D
    
    Architecture:
    - 5 convolutional blocks (each with 2 conv layers)
    - Squeeze-and-Excitation after each block
    - MaxBlurPool2D for anti-aliased downsampling (blocks 1-4)
    - BatchNormalization for stable training
    - Dropout for regularization
    - Dense head with 3 layers
    
    Total Parameters: ~8.5M
    """
    model = Sequential([
        # Block 1: 64x64 -> 32x32
        Conv2D(64, (3, 3), activation='relu', padding='same', input_shape=input_shape),
        BatchNormalization(),
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        SqueezeExcite(ratio=16),
        MaxBlurPool2D(pool_size=2, filt_size=3, stride=2),
        Dropout(0.3),

        # Block 2: 32x32 -> 16x16
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        SqueezeExcite(ratio=16),
        MaxBlurPool2D(pool_size=2, filt_size=3, stride=2),
        Dropout(0.3),

        # Block 3: 16x16 -> 8x8
        Conv2D(256, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(256, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        SqueezeExcite(ratio=16),
        MaxBlurPool2D(pool_size=2, filt_size=3, stride=2),
        Dropout(0.3),

        # Block 4: 8x8 -> 4x4
        Conv2D(512, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(512, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        SqueezeExcite(ratio=16),
        MaxBlurPool2D(pool_size=2, filt_size=3, stride=2),
        Dropout(0.3),

        # Block 5: 4x4 (no downsampling)
        Conv2D(512, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        Conv2D(512, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        SqueezeExcite(ratio=16),
        Dropout(0.3),

        # Classification Head
        Flatten(),
        Dense(1024, activation='relu'),
        BatchNormalization(),
        Dropout(0.4),
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(0.4),
        Dense(256, activation='relu'),
        BatchNormalization(),
        Dropout(0.4),
        Dense(num_classes, activation='softmax')
    ])
    return model

print("\n🏗️ Building model...")
model = build_model(input_shape=(INPUT_SIZE[0], INPUT_SIZE[1], 1), num_classes=NUM_CLASSES)

# ===== Compile Model =====
model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("\n📋 Model Summary:")
print("="*70)
model.summary()
print("="*70)

# ===== Training Callbacks =====
early_stop = EarlyStopping(
    monitor='val_accuracy',
    patience=15,
    restore_best_weights=True,
    verbose=1
)

lr_reducer = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=7,
    verbose=1,
    min_lr=1e-5
)

checkpoint = ModelCheckpoint(
    SAVE_MODEL_PATH,
    monitor='val_accuracy',
    save_best_only=True,
    verbose=1
)

# ===== Train Model =====
print("\n" + "="*70)
print("🚀 STARTING TRAINING")
print("="*70)
print(f"Training samples: {X_train_res.shape[0]:,}")
print(f"Validation samples: {X_val.shape[0]:,}")
print(f"Batch size: {BATCH_SIZE}")
print(f"Steps per epoch: {len(train_generator)}")
print("="*70 + "\n")

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=(X_val, y_val_cat),
    callbacks=[early_stop, lr_reducer, checkpoint],
    verbose=1
)

print("\n✅ Model training finished!")

# ===== Save Final Model =====
model.save(SAVE_MODEL_PATH)
print(f"\n💾 Model saved to: {SAVE_MODEL_PATH}")

# ===== Evaluate on Test Set =====
print("\n" + "="*70)
print("📊 EVALUATING ON TEST SET (PrivateTest)")
print("="*70)

loss, accuracy = model.evaluate(X_test, y_test_cat, verbose=0)
print(f"\n✅ Test Loss: {loss:.4f}")
print(f"✅ Test Accuracy: {accuracy * 100:.2f}%")

# ===== Plotting Training History =====
print("\n📈 Generating training plots...")
plt.figure(figsize=(14, 5))

# Accuracy plot
plt.subplot(1, 2, 1)
plt.plot(history.history.get('accuracy', []), label='Training Accuracy', linewidth=2)
plt.plot(history.history.get('val_accuracy', []), label='Validation Accuracy', linewidth=2)
plt.title('Model Accuracy Over Epochs', fontsize=14, fontweight='bold')
plt.xlabel('Epoch', fontsize=12)
plt.ylabel('Accuracy', fontsize=12)
plt.legend(loc='lower right', fontsize=10)
plt.grid(alpha=0.3)

# Loss plot
plt.subplot(1, 2, 2)
plt.plot(history.history.get('loss', []), label='Training Loss', linewidth=2)
plt.plot(history.history.get('val_loss', []), label='Validation Loss', linewidth=2)
plt.title('Model Loss Over Epochs', fontsize=14, fontweight='bold')
plt.xlabel('Epoch', fontsize=12)
plt.ylabel('Loss', fontsize=12)
plt.legend(loc='upper right', fontsize=10)
plt.grid(alpha=0.3)

plt.tight_layout()
if IN_COLAB:
    plt.savefig('/content/drive/MyDrive/training_history.png', dpi=300, bbox_inches='tight')
else:
    plt.savefig(os.path.join(os.path.dirname(__file__), 'training_history.png'), dpi=300, bbox_inches='tight')
plt.show()

# ===== Confusion Matrix & Classification Report =====
print("\n🎯 Generating predictions for test set...")
y_pred_probs = model.predict(X_test, verbose=0)
y_pred = np.argmax(y_pred_probs, axis=1)
y_true = y_test

print("\n📊 Classification Report:")
print("="*70)
report = classification_report(y_true, y_pred, target_names=LABELS, output_dict=True)
report_df = pd.DataFrame(report).transpose()
print(report_df[['precision', 'recall', 'f1-score', 'support']])
print("="*70)

macro_f1 = report['macro avg']['f1-score']
weighted_f1 = report['weighted avg']['f1-score']
print(f"\n✅ Macro F1-Score: {macro_f1:.4f}")
print(f"✅ Weighted F1-Score: {weighted_f1:.4f}")

# Confusion Matrix
print("\n🔍 Generating confusion matrix...")
cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(10, 8))
sns.heatmap(
    cm,
    annot=True,
    fmt='d',
    cmap='Blues',
    xticklabels=LABELS,
    yticklabels=LABELS,
    cbar_kws={'label': 'Count'}
)
plt.xlabel("Predicted Label", fontsize=12, fontweight='bold')
plt.ylabel("True Label", fontsize=12, fontweight='bold')
plt.title("Confusion Matrix - Test Set (PrivateTest)", fontsize=14, fontweight='bold')
plt.tight_layout()

if IN_COLAB:
    plt.savefig('/content/drive/MyDrive/confusion_matrix.png', dpi=300, bbox_inches='tight')
else:
    plt.savefig(os.path.join(os.path.dirname(__file__), 'confusion_matrix.png'), dpi=300, bbox_inches='tight')
plt.show()

# ===== Per-Class Performance Analysis =====
print("\n📈 Per-Class Performance Analysis:")
print("="*70)
for i, label in enumerate(LABELS):
    precision = report[label]['precision']
    recall = report[label]['recall']
    f1 = report[label]['f1-score']
    support = int(report[label]['support'])
    print(f"{label:12s} | Precision: {precision:.3f} | Recall: {recall:.3f} | F1: {f1:.3f} | Support: {support:4d}")
print("="*70)

# ===== Summary =====
print("\n" + "="*70)
print("🎉 TRAINING COMPLETE!")
print("="*70)
print(f"✅ Model saved: {SAVE_MODEL_PATH}")
print(f"✅ Test Accuracy: {accuracy * 100:.2f}%")
print(f"✅ Macro F1-Score: {macro_f1:.4f}")
print(f"✅ Weighted F1-Score: {weighted_f1:.4f}")
print("\n🚀 Next Steps:")
print("   1. Copy the .h5 model file to flask-backend directory")
print("   2. Update app.py to use the new model")
print("   3. Test with your EmotionAid frontend")
print("="*70 + "\n")
