If you want to prevent the crew from making external OpenAI calls (for local testing or when you don't have API quota), set the environment variable FORCE_LOCAL_CREW=1 before running the backend.

This repo also contains `agents.yaml` and `tasks.yaml` which declare which agents and tasks are used. If you prefer, you can comment out `llm:` lines in `agents.yaml` to avoid explicit provider references. The code will automatically use a local LLM shim in forced-local mode.

Example (PowerShell):

$env:FORCE_LOCAL_CREW = '1'
python main.py

Or set it globally in your environment before starting the Flask server.
