import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

#!/usr/bin/env python
import sys
import warnings
import json
from datetime import datetime
warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

# Provide an opt-out for external LLM calls. If FORCE_LOCAL_CREW is set to '1' or 'true',
# we will use a simple deterministic local fallback instead of importing and running
# the full Crew (which requires OPENAI API access).
FORCE_LOCAL_CREW = os.environ.get('FORCE_LOCAL_CREW', os.environ.get('FORCE_LOCAL_CREW'.upper(), '0')).lower() in ('1', 'true', 'yes')

if FORCE_LOCAL_CREW:
    print('[CREW MAIN] FORCE_LOCAL_CREW enabled: will use local fallbacks and avoid external API calls')
else:
    # only import the heavy crew implementation when not in forced-local mode
    from solution_recommandation.crew import EnhancedEmotionalSupportCrew

# emotion_utils.py
def get_emotion_valence(emotion: str) -> str:
    positive = ["happy", "joyful", "proud", "grateful", "excited", "content"]
    negative = ["sad", "angry", "fearful", "anxious", "lonely", "guilty", "ashamed"]
    neutral = ["neutral", "calm"]

    emotion = emotion.lower()
    if emotion in positive:
        return "positive"
    elif emotion in negative:
        return "negative"
    else:
        return "neutral"


def run(emotion: str = 'Neutral', reason: str = ''):
    """
    Run the enhanced emotional support crew with provided emotion and reason.
    """
    valence = get_emotion_valence(emotion)
    inputs = {
        "emotion": emotion,
        "reason": reason,
        "current_year": str(datetime.now().year),
        "emotion_valence": valence
    }

    # If FORCE_LOCAL_CREW is enabled return a simple deterministic fallback
    if FORCE_LOCAL_CREW:
        class SimpleResult:
            def __init__(self, raw):
                self.raw = raw

        def simple_crewai_run(emotion: str, payload):
            reason_text = ''
            if isinstance(payload, dict):
                reason_text = payload.get('reason', '')
            elif isinstance(payload, str):
                reason_text = payload

            # load fallbacks from the shared JSON file
            try:
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                fallback_path = os.path.join(base_dir, 'crewai_fallbacks.json')
                with open(fallback_path, 'r', encoding='utf-8') as f:
                    fallbacks = json.load(f)
            except Exception:
                fallbacks = {}

            em = (emotion or '').capitalize()
            suggestions = fallbacks.get(em) or fallbacks.get('Neutral', [])

            # If the fallback is a single multiline template (e.g., a breakup
            # message), return it verbatim so the frontend can display it
            # cleanly. Otherwise produce a short bullet list with optional
            # context.
            for s in suggestions:
                if isinstance(s, str) and '\n' in s:
                    return SimpleResult(s)

            intro = f"Context: {reason_text[:200]}. " if reason_text else ''
            text = intro + 'Suggested actions:\n' + '\n'.join(f"- {s}" for s in suggestions[:3])
            return SimpleResult(text)

        res = simple_crewai_run(emotion, reason)
        print("[CREW MAIN] Local fallback result prepared")
        return res

    # otherwise run the full crew (may raise if OPENAI API key missing or quota exhausted)
    try:
        result = EnhancedEmotionalSupportCrew().crew().kickoff(inputs=inputs)
        print("✅ Crew execution completed successfully!")
        print("\n" + "="*60)
        print("EMOTIONAL SUPPORT PLAN COMPLETED")
        print("="*60)
        print(result.raw)
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")

# Keep the main function for direct execution
def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py run")
        sys.exit(1)

    command = sys.argv[1].lower()
    # remaining args after the command
    remaining = sys.argv[2:]

    try:
        if command == "run":
            # If the caller provided emotion and reason, forward them; otherwise use defaults.
            if len(remaining) >= 2:
                run(remaining[0], remaining[1])
            elif len(remaining) == 1:
                run(remaining[0], '')
            else:
                run()
        else:
            print(f"Unknown command: {command}")
            print("Available commands: run")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()