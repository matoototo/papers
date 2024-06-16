#!/bin/sh

ENV_DIR="ai/env"
HOST=${AI_HOST:-"localhost"}
PORT=${AI_PORT:-3002}
URL="http://$HOST:$PORT"

if [ ! -d "$ENV_DIR" ]; then
  python3 -m venv $ENV_DIR
  echo "Virtual environment created at $ENV_DIR"
fi

. $ENV_DIR/bin/activate

pip install -q --requirement ai/requirements.txt

# export LANGCHAIN_TRACING_V2="true"
python3 ai/server.py

while ! curl -s $URL >/dev/null; do
  echo "Waiting for server to start..."
  sleep 1
done

echo "Server started successfully at $URL"
