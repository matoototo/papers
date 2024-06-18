import os
from langchain_nvidia_ai_endpoints import ChatNVIDIA

model = ChatNVIDIA(model=os.environ.get("CHAT_MODEL", "meta/llama3-70b-instruct"))
