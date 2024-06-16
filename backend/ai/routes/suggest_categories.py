import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages([
    ("system", "Suggest relevant valid arXiv categories based on the following description, one per line. Only output categories."),
    ("user", "{preference}")
])

model = ChatOpenAI(model=os.environ.get("CHAT_MODEL", "gpt-4o"))

parser = StrOutputParser()

chain = prompt | model | parser
