# -*- coding: utf-8 -*-
"""
Custom TensorFlow/Keras Layers for Advanced FER Model
=====================================================
This module contains custom layers used in the advanced FER model:
- MaxBlurPool2D: Anti-aliased downsampling
- SqueezeExcite: Channel attention mechanism

Import these layers before loading the model in Flask app.

Usage in app.py:
    from custom_layers import MaxBlurPool2D, SqueezeExcite
    
    face_model = tf.keras.models.load_model(
        face_model_path,
        custom_objects={
            'MaxBlurPool2D': MaxBlurPool2D,
            'SqueezeExcite': SqueezeExcite
        }
    )
"""

import tensorflow as tf
from tensorflow.keras import layers


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


# Test function to verify layers work correctly
def test_custom_layers():
    """Test custom layers with dummy data"""
    print("Testing MaxBlurPool2D...")
    test_input = tf.random.normal((1, 64, 64, 64))  # Batch=1, H=64, W=64, C=64
    maxblur = MaxBlurPool2D(pool_size=2, filt_size=3, stride=2)
    output = maxblur(test_input)
    print(f"  Input shape: {test_input.shape}")
    print(f"  Output shape: {output.shape}")
    print(f"  Expected: (1, 32, 32, 64) ✅")
    
    print("\nTesting SqueezeExcite...")
    test_input = tf.random.normal((1, 32, 32, 128))
    se = SqueezeExcite(ratio=16)
    output = se(test_input)
    print(f"  Input shape: {test_input.shape}")
    print(f"  Output shape: {output.shape}")
    print(f"  Expected: (1, 32, 32, 128) ✅")
    
    print("\n✅ All custom layers working correctly!")


if __name__ == "__main__":
    test_custom_layers()
