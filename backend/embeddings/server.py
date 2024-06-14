import os
from flask import Flask, request, jsonify
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from dotenv import load_dotenv

load_dotenv()

if not os.environ.get("NVIDIA_API_KEY", "").startswith("nvapi-"):
    raise ValueError("NVIDIA_API_KEY not found or invalid in the environment")

embedder = NVIDIAEmbeddings(model=os.environ.get("EMBEDDINGS_MODEL", "snowflake/arctic-embed-l"))

app = Flask(__name__)

@app.route('/embed_text', methods=['POST'])
def embed_text():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'Text is required'}), 400

    try:
        embedding = embedder.embed_query(text)
        return jsonify({'embedding': embedding}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host=os.environ.get('EMBEDDINGS_HOST', 'localhost'), port=os.environ.get('EMBEDDINGS_PORT', 3002))
