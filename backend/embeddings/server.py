import os
from flask import Flask, request, jsonify
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from dotenv import load_dotenv
import openai
from langchain.prompts import PromptTemplate
from langchain_openai import OpenAI

load_dotenv()

if not os.environ.get("NVIDIA_API_KEY", "").startswith("nvapi-"):
    raise ValueError("NVIDIA_API_KEY not found or invalid in the environment")

embedder = NVIDIAEmbeddings(model=os.environ.get("EMBEDDINGS_MODEL", "snowflake/arctic-embed-l"))

openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY not found in the environment")

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

@app.route('/suggest_categories', methods=['POST'])
def suggest_categories():
    data = request.get_json()
    preference = data.get('preference', '')

    if not preference:
        return jsonify({'error': 'Preference description is required'}), 400

    try:
        prompt = PromptTemplate(
            input_variables=["preference"],
            template="Based on the following description: {preference}, suggest relevant valid arXiv categories, one per line. Only output categories."
        )

        llm = OpenAI(api_key=openai.api_key)
        chain = prompt | llm

        response = chain.invoke(preference)

        return jsonify({'categories': response.strip().split('\n')}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host=os.environ.get('EMBEDDINGS_HOST', 'localhost'), port=os.environ.get('EMBEDDINGS_PORT', 3002))
