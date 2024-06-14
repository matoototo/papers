#!/bin/sh

ENV_DIR="embeddings/env"

if [ ! -d "$ENV_DIR" ]; then
  python3 -m venv $ENV_DIR
  echo "Virtual environment created at $ENV_DIR"
fi

. $ENV_DIR/bin/activate

pip install -q --requirement embeddings/requirements.txt

python3 embeddings/server.py
