import os
print(os.listdir(os.path.join(os.path.dirname(__file__), 'CrewAi with solutionRecommendation part', 'solution_recommandation', 'src', 'solution_recommandation')))
import sys
from flask import Flask, request, jsonify
import json
has_flask_cors = True
try:
    from flask_cors import CORS
except Exception:
    # If flask_cors isn't installed, fall back to a simple dev-mode flag and
    # register response headers later. Installing `flask-cors` is still
    # recommended for production and finer-grained control.
    has_flask_cors = False
    def CORS(app, **kwargs):
        # no-op placeholder so existing call sites work; we'll register
        # headers after the Flask app is created when flask-cors is missing.
        print('[WARN] flask_cors not installed; using simple dev CORS fallback')
        return None
from PIL import Image
import numpy as np
import tensorflow as tf
import io
import os
import re


# Dynamic import for CrewAI main.py
import importlib.util
main_path = os.path.join(os.path.dirname(__file__), 'CrewAi with solutionRecommendation part', 'solution_recommandation', 'src', 'solution_recommandation', 'main.py')
spec = importlib.util.spec_from_file_location('main', main_path)
main = importlib.util.module_from_spec(spec)
sys.modules['main'] = main
spec.loader.exec_module(main)
crewai_run = main.run

# Simple local fallback runner: deterministic, cheap, useful when OpenAI quota is exhausted.
def simple_crewai_run(emotion: str, payload):
    """Return a small, helpful canned response based on emotion and optional reason/payload.
    This avoids calling external APIs when quota is exhausted.
    """
    reason = ''
    if isinstance(payload, dict):
        reason = payload.get('reason', '')
    elif isinstance(payload, str):
        reason = payload

    # load fallbacks from JSON file so they are editable
    try:
        with open(os.path.join(os.path.dirname(__file__), 'crewai_fallbacks.json'), 'r', encoding='utf-8') as f:
            fallbacks = json.load(f)
    except Exception:
        fallbacks = {}

    # If there is a simple hardcoded map (reason keyword -> emotion), prefer
    # that mapping so we can return a tailored template for common cases like
    # 'breakup'. The map is editable on-disk in `crewai_hardcoded_map.json`.
    try:
        map_path = os.path.join(os.path.dirname(__file__), 'crewai_hardcoded_map.json')
        if os.path.exists(map_path):
            with open(map_path, 'r', encoding='utf-8') as mf:
                hk = json.load(mf)
            # match reason keywords in payload (if present)
            reason_lower = (reason or '').lower()
            for kw, mapped_em in hk.items():
                if kw.lower() in reason_lower:
                    emotion = mapped_em
                    break
    except Exception:
        pass

    em = (emotion or '').capitalize()
    suggestions = fallbacks.get(em) or fallbacks.get('Neutral', [])

    # Prefer any multiline suggestion (contains newline) as the canonical
    # template. This lets authors keep a single long template plus a short
    # follow-up hint in the list while ensuring the long template displays
    # verbatim instead of being wrapped into a bullet list.
    for s in suggestions:
        if isinstance(s, str) and '\n' in s:
            return s

    # Otherwise build a concise plain list (no markdown bullets or headers).
    # Return short lines separated by a single blank line so the UI shows
    # readable, non-markdown text.
    return '\n\n'.join(str(s).strip() for s in suggestions[:3])


def _strip_context_wrapper(text: str) -> str:
    """Remove legacy wrapper strings like 'Context: ... Suggested actions:\n' if present.

    This allows old cached responses that used the wrapper to be normalized
    into the cleaner bullet-only format without losing the suggestion text.
    """
    if not text:
        return text
    try:
        # Remove code fences
        text = text.replace('```', '')

        # Remove legacy wrapper marker if present
        marker = 'Suggested actions:\n'
        if marker in text:
            text = text.split(marker, 1)[1].strip()

        # Remove a leading 'Context: ...' line if present
        text = re.sub(r'^\s*Context:.*?\n', '', text, flags=re.IGNORECASE)

        # Normalize lines: remove markdown bullets, numbering, and heading markers
        cleaned_lines = []
        for line in text.splitlines():
            l = line.strip()
            # remove leading markdown bullets like '-' or '*' or numbering like '1.'
            l = re.sub(r'^[-*]+\s*', '', l)
            l = re.sub(r'^\d+\.\s*', '', l)
            # remove heading hashes
            l = re.sub(r'^#+\s*', '', l)
            cleaned_lines.append(l)

        cleaned = '\n'.join(cleaned_lines)
        # collapse multiple blank lines to a single blank line
        cleaned = re.sub(r'\n{2,}', '\n\n', cleaned)
        return cleaned.strip()
    except Exception:
        return text

# Background job store for async CrewAI calls
from threading import Thread, Lock
import uuid
_jobs_lock = Lock()
_jobs: dict = {}  # job_id -> {status: 'pending'|'running'|'done'|'error', result: str}
import time
import random
from collections import deque
import hashlib
from pathlib import Path

# Simple in-memory queue for CrewAI jobs to throttle outbound requests
crewai_queue = deque()
crewai_queue_lock = Lock()
# Minimum seconds between CrewAI requests (tune to your quota) -> default 2s
CREWAI_MIN_INTERVAL = float(os.environ.get('CREWAI_MIN_INTERVAL', '2.0'))
crewai_last_call_time = 0.0


def _is_rate_limit_error(exc: Exception) -> bool:
    """Heuristic to detect provider rate-limit errors without depending on a specific SDK class."""
    name = exc.__class__.__name__ if exc is not None else ''
    text = str(exc).lower() if exc is not None else ''
    # also check for common quota/exceeded messages
    return (
        'ratelimit' in name.lower()
        or 'rate limit' in text
        or 'rate-limit' in text
        or 'rate_limit' in text
        or 'quota' in text
        or 'exceed' in text
        or 'limit' in text and 'requests' in text
    )


# Simple on-disk cache to avoid repeated identical CrewAI calls when quota is tight.
CACHE_PATH = Path(os.path.join(os.path.dirname(__file__), 'crewai_cache.json'))
_cache_lock = Lock()


def _fallbacks_mtime() -> float:
    """Return the last-modified time of the fallbacks file (0 if missing).

    This allows automatic cache invalidation when a developer updates
    `crewai_fallbacks.json` without restarting the server.
    """
    try:
        p = Path(os.path.join(os.path.dirname(__file__), 'crewai_fallbacks.json'))
        if p.exists():
            return float(p.stat().st_mtime)
    except Exception:
        pass
    return 0.0


def _cache_load() -> dict:
    try:
        if CACHE_PATH.exists():
            with CACHE_PATH.open('r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def _cache_save(cache: dict):
    try:
        with CACHE_PATH.open('w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


def _cache_key(emotion: str, payload) -> str:
    # Normalize payload to stable string
    try:
        p = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    except Exception:
        p = str(payload)
    key_raw = f"{emotion}|{p}"
    return hashlib.sha256(key_raw.encode('utf-8')).hexdigest()


def _interpolate(text: str, payload) -> str:
    """Interpolate simple placeholders into cached or fallback text.

    Currently supports {name} substitution. If payload is not a dict,
    it's treated as a reason string and no name substitution occurs.
    """
    if not text:
        return text
    try:
        if isinstance(payload, dict):
            name = payload.get('name') or payload.get('user_name') or payload.get('username') or 'there'
            # basic safe replacement
            return text.replace('{name}', str(name))
    except Exception:
        pass
    return text


def _cache_get(emotion: str, payload):
    # If fallbacks were updated more recently than the cache, ignore cache
    try:
        cache_mtime = float(CACHE_PATH.stat().st_mtime) if CACHE_PATH.exists() else 0.0
    except Exception:
        cache_mtime = 0.0
    fallback_m = _fallbacks_mtime()
    if fallback_m > cache_mtime:
        # fallback templates changed; do not return stale cache
        return None

    key = _cache_key(emotion, payload)
    with _cache_lock:
        cache = _cache_load()
        return cache.get(key)


def _cache_set(emotion: str, payload, value):
    key = _cache_key(emotion, payload)
    with _cache_lock:
        cache = _cache_load()
        cache[key] = value
        _cache_save(cache)


def call_crewai_with_retries(emotion: str, reason: str, max_attempts: int = 5, base_wait: float = 1.0):
    """Call crewai_run with exponential backoff. Raises the last exception if exhausted."""
    class SimpleResult:
        def __init__(self, raw):
            self.raw = raw

    attempt = 0
    last_exc = None
    while True:
        try:
            return crewai_run(emotion, reason)
        except Exception as exc:
            last_exc = exc
            attempt += 1
            # if it's a rate-limit-ish error, backoff and retry; otherwise rethrow immediately
            if not _is_rate_limit_error(exc):
                # non-rate limit error - raise immediately
                raise

            if attempt >= max_attempts:
                # After exhausting retries due to rate-limits, return a safe local fallback
                print(f"[CREWAI] Exhausted retries due to rate/quota errors: {exc}; returning local fallback")
                fallback_text = simple_crewai_run(emotion, reason)
                return SimpleResult(fallback_text)

            wait = base_wait * (2 ** (attempt - 1))
            # jitter 0.5x - 1x
            wait = wait * (0.5 + random.random() * 0.5)
            print(f"[CREWAI] Rate limit detected, retrying in {wait:.1f}s (attempt {attempt}/{max_attempts})")
            time.sleep(wait)
            continue

def _run_crewai_job(job_id: str, emotion: str, payload):
    """Run a CrewAI job in background.

    payload may be a string (reason) for backwards compatibility, or a dict containing
    keys like 'reason' and 'age_group'. We forward the payload to call_crewai_with_retries
    which in turn calls the crewai runner.
    """
    with _jobs_lock:
        _jobs[job_id] = {'status': 'running', 'result': None}
    try:
        # Normalize payload into something crewai_run understands (we let crewai_run
        # accept either a string reason or a dict with extra metadata).
        try:
            res = call_crewai_with_retries(emotion, payload, max_attempts=10, base_wait=1.0)
        except Exception as exc:
            with _jobs_lock:
                _jobs[job_id]['status'] = 'error'
                _jobs[job_id]['result'] = str(exc)
            print(f"[CREWAI JOB {job_id}] Failed after retries: {exc}")
            return

        raw = getattr(res, 'raw', str(res))
        with _jobs_lock:
            _jobs[job_id]['status'] = 'done'
            _jobs[job_id]['result'] = raw
    except Exception as e:
        with _jobs_lock:
            _jobs[job_id]['status'] = 'error'
            _jobs[job_id]['result'] = str(e)


def _crewai_worker():
    global crewai_last_call_time
    print('[CREWAI WORKER] Started')
    while True:
        try:
            item = None
            with crewai_queue_lock:
                if crewai_queue:
                    item = crewai_queue.popleft()
            if item is None:
                time.sleep(0.5)
                continue

            job_id, emotion, payload = item

            # throttle calls to respect CREWAI_MIN_INTERVAL
            now = time.time()
            elapsed = now - crewai_last_call_time
            if elapsed < CREWAI_MIN_INTERVAL:
                time.sleep(CREWAI_MIN_INTERVAL - elapsed)

            # mark running
            with _jobs_lock:
                _jobs[job_id] = {'status': 'running', 'result': None}

            try:
                print(f'[CREWAI WORKER] Running job {job_id} (emotion={emotion})')
                # Try cache first
                cached = _cache_get(emotion, payload)
                if cached is not None:
                    print(f'[CREWAI WORKER] Using cached result for job {job_id}')
                    # normalize cached value in case it contains legacy wrapper
                    cached_clean = _strip_context_wrapper(cached)
                    # Interpolate per-job using payload
                    interp = _interpolate(cached_clean, payload)
                    with _jobs_lock:
                        _jobs[job_id]['status'] = 'done'
                        _jobs[job_id]['result'] = interp
                else:
                    try:
                        res = call_crewai_with_retries(emotion, payload, max_attempts=5, base_wait=1.0)
                        raw = getattr(res, 'raw', str(res))
                        with _jobs_lock:
                            _jobs[job_id]['status'] = 'done'
                            _jobs[job_id]['result'] = raw
                        # store in cache
                        _cache_set(emotion, payload, raw)
                    except Exception as exc:
                        # If rate-limited, fall back to local canned response and cache it
                        if _is_rate_limit_error(exc):
                            print(f'[CREWAI WORKER] Rate limit for job {job_id}, using local fallback')
                            fallback = simple_crewai_run(emotion, payload)
                            interp = _interpolate(fallback, payload)
                            with _jobs_lock:
                                _jobs[job_id]['status'] = 'done'
                                _jobs[job_id]['result'] = interp
                            # Store raw fallback template in cache so interpolation occurs per-request
                            _cache_set(emotion, payload, fallback)
                        else:
                            with _jobs_lock:
                                _jobs[job_id]['status'] = 'error'
                                _jobs[job_id]['result'] = str(exc)
                            print(f'[CREWAI WORKER] Job {job_id} error: {exc}')
            except Exception as exc:
                with _jobs_lock:
                    _jobs[job_id]['status'] = 'error'
                    _jobs[job_id]['result'] = str(exc)
                print(f'[CREWAI WORKER] Job {job_id} error: {exc}')

            crewai_last_call_time = time.time()
        except Exception as e:
            print('[CREWAI WORKER] unexpected error', e)
            time.sleep(1.0)

# Start worker thread
Thread(target=_crewai_worker, daemon=True).start()


app = Flask(__name__)
# Prefer explicit CORS via flask-cors when available. If it's not
# installed in this environment, register a minimal dev-only after_request
# handler that adds the headers needed by the browser to accept responses
# from the React dev server (http://localhost:3000).
if has_flask_cors:
    # Restrict to the typical React dev origin to reduce blast radius.
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
else:
    @app.after_request
    def _add_dev_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response


# Health endpoint so visiting the base URL returns a friendly message
@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'ok', 'message': 'EmotionAid backend running', 'endpoints': ['/predict (POST)', '/predict_audio (POST)', '/crewai/recommend (POST)', '/crewai/debug_fallback?emotion=Sad (GET)', '/users (GET/POST)']}), 200

# Import custom layers for advanced FER model
try:
    from custom_layers import MaxBlurPool2D, SqueezeExcite
    CUSTOM_LAYERS_AVAILABLE = True
    print("✅ Custom layers (MaxBlurPool2D, SqueezeExcite) imported successfully")
except ImportError as e:
    CUSTOM_LAYERS_AVAILABLE = False
    print(f"⚠️ Custom layers not available: {e}")
    print("   Advanced model (fer_model_SE_MaxBlur.h5) will not load.")
    MaxBlurPool2D = None
    SqueezeExcite = None

# Discover and load face model (prefer advanced SE+MaxBlur model if present)
face_model_candidates = ['fer_model_SE_MaxBlur.h5', 'fer_model_corrected.h5', 'fer2013_checkpoint_seed_2024.h5']
face_model_path = None
for candidate in face_model_candidates:
    candidate_path = os.path.join(os.path.dirname(__file__), candidate)
    if os.path.exists(candidate_path):
        face_model_path = candidate_path
        break

if not face_model_path:
    raise FileNotFoundError(f"No face model found in backend. Checked: {face_model_candidates}")

# Load face model with custom layers support if available
model_name = os.path.basename(face_model_path)
custom_objects = None

if CUSTOM_LAYERS_AVAILABLE and ('SE_MaxBlur' in model_name or 'se_maxblur' in model_name.lower()):
    custom_objects = {
        'MaxBlurPool2D': MaxBlurPool2D,
        'SqueezeExcite': SqueezeExcite
    }
    print(f"🔧 Loading model with custom layers: {model_name}")
    face_model = tf.keras.models.load_model(face_model_path, custom_objects=custom_objects)
else:
    face_model = tf.keras.models.load_model(face_model_path)

face_model.name = model_name
print(f"✅ Loaded face model: {face_model.name}")
try:
    face_model.summary()
except Exception:
    pass

# Emotion class labels — adjust if your models use different ordering
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Determine face model expected input size (height, width, channels)
face_input_shape = None
try:
    # model.input_shape can be like (None,48,48,1) or (None,64,64,1)
    ishape = face_model.input_shape
    if ishape and len(ishape) >= 3:
        # take last three dims if batch dimension present
        if len(ishape) == 4:
            _, h, w, c = ishape
            face_input_shape = (int(h or 48), int(w or 48), int(c or 1))
        elif len(ishape) == 3:
            _, h, w = ishape
            face_input_shape = (int(h or 48), int(w or 48), 1)
except Exception:
    face_input_shape = (48, 48, 1)

if not face_input_shape:
    face_input_shape = (48, 48, 1)

print(f"Face model expects input shape (h,w,c): {face_input_shape}")

# Try to load speech emotion recognition model if present
speech_model = None
speech_model_path = os.path.join(os.path.dirname(__file__), 'best_ser_model.h5')
if os.path.exists(speech_model_path):
    try:
        speech_model = tf.keras.models.load_model(speech_model_path)
        speech_model.name = os.path.basename(speech_model_path)
        print(f"✅ Loaded speech model: {speech_model.name}")
        try:
            speech_model.summary()
        except Exception:
            pass
    except Exception as e:
        print(f"Failed to load speech model at {speech_model_path}: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    file = request.files['image']
    # Adapt resize depending on loaded face model expected size
    target_h, target_w, target_c = face_input_shape
    img = Image.open(file.stream)
    # convert to grayscale if model expects single channel
    if target_c == 1:
        img = img.convert('L')
    else:
        img = img.convert('RGB')
    img = img.resize((target_w, target_h))

    arr = np.array(img).astype('float32') / 255.0
    # ensure correct shape ordering
    if target_c == 1 and arr.ndim == 2:
        arr = arr.reshape(target_h, target_w, 1)
    if arr.shape[-1] != target_c:
        # Try to adjust channels
        if target_c == 1:
            arr = np.mean(arr, axis=2, keepdims=True)
        else:
            # replicate gray to 3 channels
            arr = np.repeat(arr[..., :1], 3, axis=2)

    img_array = np.expand_dims(arr, axis=0)

    predictions = face_model.predict(img_array)[0]
    # Map predictions to labels if length matches, otherwise return index keys
    if len(predictions) == len(emotion_labels):
        top_emotion = emotion_labels[np.argmax(predictions)]
        preds_dict = dict(zip(emotion_labels, map(float, predictions)))
    else:
        top_idx = int(np.argmax(predictions))
        top_emotion = f'class_{top_idx}'
        preds_dict = {f'class_{i}': float(predictions[i]) for i in range(len(predictions))}

    print(f"📌 Prediction completed using model: {face_model.name}, Top emotion: {top_emotion}")

    result = {
        'predictions': preds_dict,
        'top_emotion': top_emotion,
        'model_used': face_model.name
    }
    return jsonify(result)


@app.route('/predict_audio', methods=['POST'])
def predict_audio():
    if speech_model is None:
        return jsonify({'error': 'Speech model not available on server. Place best_ser_model.h5 in the backend folder.'}), 400

    if 'audio' not in request.files:
        return jsonify({'error': 'No audio part. Use form field name "audio"'}), 400

    file = request.files['audio']
    # Try to import librosa for audio preprocessing
    try:
        import librosa
        import soundfile as sf
    except Exception as e:
        return jsonify({'error': 'Missing audio preprocessing libraries. Please install librosa and soundfile (pip install librosa soundfile).', 'detail': str(e)}), 500

    # Read audio into numpy
    try:
        # librosa can load from bytes via soundfile
        data, sr = librosa.load(file, sr=16000, mono=True)
    except Exception as e:
        # fallback: try reading with soundfile
        try:
            file.stream.seek(0)
            data, sr = sf.read(file.stream)
            if data.ndim > 1:
                data = np.mean(data, axis=1)
            # resample if needed
            if sr != 16000:
                data = librosa.resample(data, sr, 16000)
                sr = 16000
        except Exception as e2:
            return jsonify({'error': 'Failed to read audio file', 'detail': str(e2)}), 400

    # Compute mel-spectrogram with 64 mel bands and resize/crop/pad time axis to 64
    try:
        S = librosa.feature.melspectrogram(y=data, sr=sr, n_mels=64, fmax=8000)
        log_S = librosa.power_to_db(S, ref=np.max)
        # Normalize to 0-1
        lo = log_S.min()
        hi = log_S.max()
        if hi - lo > 0:
            norm = (log_S - lo) / (hi - lo)
        else:
            norm = np.zeros_like(log_S)

        # Ensure time dimension is 64 (n_mels x time)
        h, t = norm.shape
        target_t = 64
        if t < target_t:
            # pad
            pad_width = target_t - t
            norm = np.pad(norm, ((0,0),(0,pad_width)), mode='constant')
        elif t > target_t:
            norm = norm[:, :target_t]

        # final shape (64,64)
        spec = norm.astype('float32')
        # add channel and batch dims depending on model expected input
        inp = np.expand_dims(spec, axis=-1)  # (64, target_t, 1)
        inp = np.expand_dims(inp, axis=0)

        predictions = speech_model.predict(inp)[0]
        # Map predictions to emotion_labels if same length
        if len(predictions) == len(emotion_labels):
            top_emotion = emotion_labels[np.argmax(predictions)]
            preds_dict = dict(zip(emotion_labels, map(float, predictions)))
        else:
            top_idx = int(np.argmax(predictions))
            top_emotion = f'class_{top_idx}'
            preds_dict = {f'class_{i}': float(predictions[i]) for i in range(len(predictions))}

        return jsonify({'predictions': preds_dict, 'top_emotion': top_emotion, 'model_used': speech_model.name})
    except Exception as e:
        return jsonify({'error': 'Audio preprocessing or model prediction failed', 'detail': str(e)}), 500


# CrewAI solution recommendation endpoint
@app.route('/crewai/recommend', methods=['POST'])
def crewai_recommend():
    data = request.json
    emotion = data.get('emotion')
    # Support both camelCase (ageGroup) and snake_case (age_group)
    age_group = data.get('ageGroup') or data.get('age_group')
    gender = data.get('gender')
    email = data.get('email')
    age = data.get('age')
    # allow reason to be optional (empty string accepted)
    reason = data.get('reason', '')
    async_mode = data.get('async', True)
    # optional name for personalization
    name = None
    if isinstance(data, dict):
        name = data.get('name') or data.get('user_name') or data.get('username')
    if not emotion:
        return jsonify({'error': 'Emotion is required'}), 400
    
    # Build user context for personalization
    user_context = {
        'reason': reason,
        'age_group': age_group,
        'gender': gender,
        'email': email,
        'age': age,
        'name': name
    }
    try:
        # --- hardcoded mapping override: if the reason contains a keyword
        # mapped in crewai_hardcoded_map.json, return that mapping's fallback
        # immediately (interpolated) so common cases like 'breakup' show the
        # tailored multiline template.
        try:
            map_path = os.path.join(os.path.dirname(__file__), 'crewai_hardcoded_map.json')
            if os.path.exists(map_path):
                with open(map_path, 'r', encoding='utf-8') as mf:
                    hk = json.load(mf)
                reason_lower = (reason or '').lower()
                matched = None
                for kw, mapped_em in hk.items():
                    if kw.lower() in reason_lower:
                        matched = mapped_em
                        break
                if matched:
                    # load the fallbacks and return the matching template
                    try:
                        with open(os.path.join(os.path.dirname(__file__), 'crewai_fallbacks.json'), 'r', encoding='utf-8') as f:
                            fallbacks = json.load(f)
                    except Exception:
                        fallbacks = {}
                    suggestions = fallbacks.get(matched) or fallbacks.get('Neutral', [])
                    payload = {**user_context}  # Use full user context
                    if len(suggestions) == 1 and isinstance(suggestions[0], str) and '\n' in suggestions[0]:
                        sol = _interpolate(suggestions[0], payload)
                        return jsonify({'solution': sol, 'hardcoded': True}), 200
                    # otherwise assemble a concise bullet list (no 'Context:' header)
                    sol = '\n'.join(f"- {s}" for s in suggestions[:3])
                    sol = _interpolate(sol, payload)
                    return jsonify({'solution': sol, 'hardcoded': True}), 200
        except Exception:
            # if hardcoded mapping fails, continue to normal flow
            pass
        # If async requested, create background job and return job id
        if async_mode:
            job_id = str(uuid.uuid4())
            # enqueue the job for background worker to pick up
            with crewai_queue_lock:
                crewai_queue.append((job_id, emotion, user_context))
            with _jobs_lock:
                _jobs[job_id] = {'status': 'pending', 'result': None}
            return jsonify({'job_id': job_id}), 202

        # synchronous fallback
        # Try to use cache first for sync calls
        cached = _cache_get(emotion, user_context)
        if cached is not None:
            # Interpolate placeholders (e.g., {name}, {age_group}) per-request using user_context
            sol = _interpolate(cached, user_context)
            return jsonify({'solution': sol, 'cached': True})
        try:
            # Pass full user context into crewai call
            result = call_crewai_with_retries(emotion, user_context, max_attempts=5, base_wait=1.0)
            sol = getattr(result, 'raw', str(result))
            _cache_set(emotion, user_context, sol)
            return jsonify({'solution': sol})
        except Exception as exc:
            # If rate-limited or other issue, use local fallback and cache it
            if _is_rate_limit_error(exc):
                print('[CREWAI] Rate limit detected on sync call, returning local fallback')
                fallback = _cache_get(emotion, payload)
                if fallback is None:
                    fallback = simple_crewai_run(emotion, payload)
                    _cache_set(emotion, payload, fallback)
                sol = _interpolate(fallback, payload)
                return jsonify({'solution': sol, 'fallback': True}), 200
            # otherwise return error
            return jsonify({'error': str(exc)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/crewai/status/<job_id>', methods=['GET'])
def crewai_status(job_id):
    with _jobs_lock:
        job = _jobs.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    return jsonify({'status': job['status'], 'result': job['result']})


@app.route('/crewai/force_process', methods=['POST'])
def crewai_force_process():
    """Pop one item from the queue and process it immediately (useful for debugging).

    Returns the job_id and the resulting status/result.
    """
    item = None
    with crewai_queue_lock:
        if crewai_queue:
            item = crewai_queue.popleft()
    if item is None:
        return jsonify({'error': 'No queued jobs'}), 404

    job_id, emotion, payload = item
    # mark pending -> running
    with _jobs_lock:
        _jobs[job_id] = {'status': 'running', 'result': None}

    try:
        # try cache first
        cached = _cache_get(emotion, payload)
        if cached is not None:
            # normalize cached value (strip legacy wrapper) before returning
            clean_cached = _strip_context_wrapper(cached)
            with _jobs_lock:
                _jobs[job_id]['status'] = 'done'
                _jobs[job_id]['result'] = clean_cached
            return jsonify({'job_id': job_id, 'status': 'done', 'result': clean_cached})

        # run using the same retry/call logic
        try:
            res = call_crewai_with_retries(emotion, payload, max_attempts=5, base_wait=1.0)
            raw = getattr(res, 'raw', str(res))
            with _jobs_lock:
                _jobs[job_id]['status'] = 'done'
                _jobs[job_id]['result'] = raw
            _cache_set(emotion, payload, raw)
            return jsonify({'job_id': job_id, 'status': 'done', 'result': raw})
        except Exception as exc:
            # if rate-limited, fallback to local and cache
            if _is_rate_limit_error(exc):
                fallback = simple_crewai_run(emotion, payload)
                with _jobs_lock:
                    _jobs[job_id]['status'] = 'done'
                    _jobs[job_id]['result'] = fallback
                _cache_set(emotion, payload, fallback)
                return jsonify({'job_id': job_id, 'status': 'done', 'result': fallback, 'fallback': True})
            with _jobs_lock:
                _jobs[job_id]['status'] = 'error'
                _jobs[job_id]['result'] = str(exc)
            return jsonify({'job_id': job_id, 'status': 'error', 'result': str(exc)}), 500
    except Exception as e:
        with _jobs_lock:
            _jobs[job_id]['status'] = 'error'
            _jobs[job_id]['result'] = str(e)
        return jsonify({'error': str(e)}), 500



    @app.route('/crewai/clear_cache', methods=['POST'])
    def crewai_clear_cache():
        """Clear CrewAI cache. POST body may include { "emotion": "Sad", "payload": {...} }

        If no body is provided, the entire cache file is removed/cleared.
        If emotion and payload are provided, only that cache key is deleted.
        """
        try:
            data = request.get_json(silent=True) or {}
            emotion = data.get('emotion')
            payload = data.get('payload')
            # delete specific key
            if emotion and payload is not None:
                key = _cache_key(emotion, payload)
                with _cache_lock:
                    cache = _cache_load()
                    if key in cache:
                        del cache[key]
                        _cache_save(cache)
                return jsonify({'status': 'removed', 'key': key}), 200

            # clear entire cache
            try:
                if CACHE_PATH.exists():
                    CACHE_PATH.unlink()
            except Exception:
                # fallback: overwrite with empty dict
                _cache_save({})
            return jsonify({'status': 'cleared'}), 200
        except Exception as e:
            return jsonify({'error': 'failed to clear cache', 'detail': str(e)}), 500



    @app.route('/crewai/debug_fallback', methods=['GET'])
    def crewai_debug_fallback():
        """Return raw fallbacks for an emotion and the output of simple_crewai_run.

        Query params:
          emotion (required) - emotion key like 'Sad'
          reason (optional) - reason string forwarded to the runner
          name (optional) - name for interpolation testing
        """
        emotion = request.args.get('emotion')
        if not emotion:
            return jsonify({'error': 'emotion query parameter required (e.g. ?emotion=Sad)'}), 400
        reason = request.args.get('reason', '')
        name = request.args.get('name')
        try:
            # load raw fallbacks file
            p = os.path.join(os.path.dirname(__file__), 'crewai_fallbacks.json')
            with open(p, 'r', encoding='utf-8') as f:
                fallbacks = json.load(f)
        except Exception as e:
            fallbacks = {}

        em = (emotion or '').capitalize()
        suggestions = fallbacks.get(em) or fallbacks.get('Neutral', [])

        payload = {'reason': reason}
        if name:
            payload['name'] = name

        # what simple local runner returns
        simple_out = simple_crewai_run(emotion, payload)

        # check cache
        cached = _cache_get(emotion, payload)

        return jsonify({'emotion': em, 'raw_suggestions': suggestions, 'simple_run': simple_out, 'cached': cached}), 200


# Minimal users endpoint so the frontend can optionally persist profiles.
# Accepts POST (save profile) and GET (list saved profiles). A simple
# users.json file in the backend folder is used for persistence.
@app.route('/users', methods=['GET', 'POST'])
def users():
    users_file = os.path.join(os.path.dirname(__file__), 'users.json')
    # Handle POST: accept JSON body or form data
    if request.method == 'POST':
        try:
            data = request.get_json(force=False, silent=True)
            if data is None:
                # fallback to form fields
                data = request.form.to_dict()
        except Exception:
            data = request.form.to_dict()

        # load existing
        try:
            if os.path.exists(users_file):
                with open(users_file, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
            else:
                existing = []
        except Exception:
            existing = []

        # append and save
        existing.append(data)
        try:
            with open(users_file, 'w', encoding='utf-8') as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
        except Exception as e:
            return jsonify({'error': 'Failed to save user', 'detail': str(e)}), 500

        return jsonify({'status': 'saved'}), 201

    # GET: return list
    try:
        if os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        else:
            existing = []
    except Exception:
        existing = []
    return jsonify({'users': existing}), 200

if __name__ == "__main__":
    # When debug=True, the Werkzeug reloader may import this module twice which
    # can lead to Flask attempting to register the same view function twice
    # (AssertionError: View function mapping is overwriting an existing endpoint).
    # Disable the automatic reloader to avoid duplicate registrations while
    # keeping debug output enabled.
    app.run(debug=True, use_reloader=False, port=5000)
