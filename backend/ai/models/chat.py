import os
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model=os.environ.get("CHAT_MODEL", "gpt-4o"))
