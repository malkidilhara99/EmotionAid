#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Quick Test Script for Advanced FER Model Integration
====================================================
This script tests:
1. Custom layers import
2. Model structure compatibility
3. Prediction on sample data

Run before training to ensure everything is set up correctly.
"""

import sys
import os

print("="*70)
print("ADVANCED FER MODEL - PRE-TRAINING CHECK")
print("="*70)

# Test 1: TensorFlow availability
print("\n[1/5] Checking TensorFlow...")
try:
    import tensorflow as tf
    print(f"   ✅ TensorFlow {tf.__version__} installed")
    print(f"   ✅ GPU Available: {len(tf.config.list_physical_devices('GPU')) > 0}")
except ImportError:
    print("   ❌ TensorFlow not installed!")
    print("   Install: pip install tensorflow")
    sys.exit(1)

# Test 2: Required libraries
print("\n[2/5] Checking required libraries...")
missing = []
try:
    import pandas as pd
    print("   ✅ pandas installed")
except ImportError:
    missing.append("pandas")

try:
    import numpy as np
    print("   ✅ numpy installed")
except ImportError:
    missing.append("numpy")

try:
    import matplotlib
    print("   ✅ matplotlib installed")
except ImportError:
    missing.append("matplotlib")

try:
    import seaborn
    print("   ✅ seaborn installed")
except ImportError:
    missing.append("seaborn")

try:
    from sklearn.metrics import classification_report
    print("   ✅ scikit-learn installed")
except ImportError:
    missing.append("scikit-learn")

try:
    from imblearn.over_sampling import RandomOverSampler
    print("   ✅ imbalanced-learn installed")
except ImportError:
    missing.append("imbalanced-learn")

if missing:
    print(f"\n   ❌ Missing libraries: {', '.join(missing)}")
    print(f"   Install: pip install {' '.join(missing)}")
    sys.exit(1)

# Test 3: Custom layers
print("\n[3/5] Testing custom layers...")
try:
    from custom_layers import MaxBlurPool2D, SqueezeExcite
    print("   ✅ Custom layers imported successfully")
    
    # Test MaxBlurPool2D
    test_input = tf.random.normal((1, 64, 64, 64))
    maxblur = MaxBlurPool2D(pool_size=2, filt_size=3, stride=2)
    output = maxblur(test_input)
    assert output.shape == (1, 32, 32, 64), f"MaxBlurPool2D output shape incorrect: {output.shape}"
    print("   ✅ MaxBlurPool2D working correctly")
    
    # Test SqueezeExcite
    test_input = tf.random.normal((1, 32, 32, 128))
    se = SqueezeExcite(ratio=16)
    output = se(test_input)
    assert output.shape == (1, 32, 32, 128), f"SqueezeExcite output shape incorrect: {output.shape}"
    print("   ✅ SqueezeExcite working correctly")
    
except Exception as e:
    print(f"   ❌ Custom layers test failed: {e}")
    sys.exit(1)

# Test 4: Check for FER2013 dataset
print("\n[4/5] Checking for FER2013 dataset...")
fer_path_local = os.path.join(os.path.dirname(__file__), "fer2013.csv")
fer_path_colab = "/content/drive/MyDrive/fer2013.csv"

if os.path.exists(fer_path_local):
    print(f"   ✅ Dataset found: {fer_path_local}")
    fer_available = True
elif os.path.exists(fer_path_colab):
    print(f"   ✅ Dataset found: {fer_path_colab}")
    fer_available = True
else:
    print(f"   ⚠️ FER2013 dataset not found")
    print(f"   Expected: {fer_path_local}")
    print(f"   Download: https://www.kaggle.com/datasets/msambare/fer2013")
    fer_available = False

# Test 5: Model building test
print("\n[5/5] Testing model building...")
try:
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Conv2D, BatchNormalization, Dropout, Flatten
    
    # Build a minimal model with custom layers
    model = Sequential([
        Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=(64, 64, 1)),
        BatchNormalization(),
        SqueezeExcite(ratio=16),
        MaxBlurPool2D(pool_size=2, filt_size=3, stride=2),
        Flatten(),
        Dense(7, activation='softmax')
    ])
    
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    print("   ✅ Model building successful")
    print(f"   Total parameters: {model.count_params():,}")
    
    # Test prediction
    dummy_input = tf.random.normal((1, 64, 64, 1))
    prediction = model.predict(dummy_input, verbose=0)
    assert prediction.shape == (1, 7), f"Prediction shape incorrect: {prediction.shape}"
    print("   ✅ Model prediction working")
    
except Exception as e:
    print(f"   ❌ Model building failed: {e}")
    sys.exit(1)

# Summary
print("\n" + "="*70)
print("PRE-TRAINING CHECK SUMMARY")
print("="*70)
print("✅ TensorFlow installed and working")
print("✅ All required libraries available")
print("✅ Custom layers (MaxBlurPool2D, SqueezeExcite) working")
if fer_available:
    print("✅ FER2013 dataset available")
else:
    print("⚠️ FER2013 dataset not found (download before training)")
print("✅ Model building and prediction working")
print("\n🚀 Ready to train! Run:")
print("   python train_fer_advanced_SE_MaxBlur.py")
print("="*70)
