import os
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings

model = NVIDIAEmbeddings(
    model=os.environ.get("EMBEDDINGS_MODEL", "nvidia/nv-embed-v1"),
    dimensions=int(os.environ.get("EMBEDDINGS_SIZE", 1024))
)
