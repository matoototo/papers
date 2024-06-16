import os
from langchain_openai import OpenAIEmbeddings

model = OpenAIEmbeddings(
    model=os.environ.get("EMBEDDINGS_MODEL", "text-embedding-3-large"),
    dimensions=int(os.environ.get("EMBEDDINGS_SIZE", 1024))
)
