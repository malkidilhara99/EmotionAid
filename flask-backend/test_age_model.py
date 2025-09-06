"""Simple test harness for the age_group_model.h5

Usage (PowerShell):
  C:\path\to\repo\flask-backend\venv\Scripts\python.exe test_age_model.py --image ../public/emo.png --model age_group_model.h5 --debug

What it does:
- Loads the Keras model file (default: age_group_model.h5 in same folder)
- Prints model.input_shape and inferred (h,w,c)
- Loads the image, resizes to model input, normalizes to [0,1]
- Runs prediction and prints result; if predictions length matches provided labels, it maps to label via argmax

This is a small, local tool to reproduce the same preprocessing used by the Flask endpoint and verify outputs.
"""

import argparse
import os
from PIL import Image
import numpy as np
import tensorflow as tf

DEFAULT_LABELS = ['Child', 'Teen', 'YoungAdult', 'Adult', 'MiddleAged', 'Senior']


def infer_input_shape(model):
    ishape = None
    try:
        ishape = model.input_shape
        if ishape and len(ishape) >= 3:
            if len(ishape) == 4:
                _, h, w, c = ishape
                return (int(h or 64), int(w or 64), int(c or 3))
            elif len(ishape) == 3:
                _, h, w = ishape
                return (int(h or 64), int(w or 64), 1)
    except Exception:
        pass
    return (64, 64, 3)


def preprocess_image(path, target_h, target_w, target_c):
    img = Image.open(path)
    if target_c == 1:
        img = img.convert('L')
    else:
        img = img.convert('RGB')
    img = img.resize((target_w, target_h))
    arr = np.array(img).astype('float32') / 255.0
    if arr.ndim == 2 and target_c == 1:
        arr = arr.reshape(target_h, target_w, 1)
    elif arr.ndim == 2 and target_c == 3:
        arr = np.repeat(arr[..., None], 3, axis=2)
    elif arr.shape[-1] != target_c:
        if target_c == 1:
            arr = np.mean(arr, axis=2, keepdims=True)
        else:
            arr = arr[..., :target_c]
    return np.expand_dims(arr, axis=0)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--image', required=True, help='Path to image to test')
    p.add_argument('--model', default='age_group_model.h5', help='Path to Keras .h5 model file')
    p.add_argument('--labels', default=None, help='Comma-separated labels (optional)')
    p.add_argument('--debug', action='store_true')
    args = p.parse_args()

    model_path = os.path.abspath(args.model)
    if not os.path.exists(model_path):
        print('Model not found:', model_path)
        return

    print('Loading model from', model_path)
    model = tf.keras.models.load_model(model_path)
    print('Model loaded. model.input_shape =', getattr(model, 'input_shape', None))

    target_h, target_w, target_c = infer_input_shape(model)
    print('Inferred target (h,w,c):', (target_h, target_w, target_c))

    img_path = os.path.abspath(args.image)
    if not os.path.exists(img_path):
        print('Image not found:', img_path)
        return

    x = preprocess_image(img_path, target_h, target_w, target_c)
    if args.debug:
        print('Prepared input shape for model:', x.shape)

    try:
        preds = model.predict(x)
    except Exception as e:
        print('Model prediction failed:', str(e))
        raise

    print('Raw prediction output shape:', getattr(preds, 'shape', None))

    labels = DEFAULT_LABELS
    if args.labels:
        labels = [s.strip() for s in args.labels.split(',') if s.strip()]

    # handle scalar / regression output
    if np.isscalar(preds) or (hasattr(preds, 'shape') and preds.shape[-1] == 1):
        val = float(np.asarray(preds).reshape(-1)[0])
        print('Predicted scalar age (regression):', val)
        return

    preds_arr = np.asarray(preds).reshape(-1)
    if preds_arr.size == len(labels):
        idx = int(np.argmax(preds_arr))
        print('Predicted class:', labels[idx], '(index', idx, ')')
        print('All class probs:', dict(zip(labels, preds_arr.tolist())))
    else:
        print('Predictions length', preds_arr.size, 'does not match labels length', len(labels))
        print('Raw predictions:', preds_arr.tolist())


if __name__ == '__main__':
    main()
