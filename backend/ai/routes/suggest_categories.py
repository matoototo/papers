from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from models.chat import model as chat_model

prompt = ChatPromptTemplate.from_messages([
    ("system", "Suggest relevant valid arXiv categories based on the following description, one per line. Only output categories."),
    ("user", "{preference}")
])

parser = StrOutputParser()

chain = prompt | chat_model | parser
