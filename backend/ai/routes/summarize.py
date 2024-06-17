from langchain_core.prompts import ChatPromptTemplate
from models.chat import model as chat_model

prompt = ChatPromptTemplate.from_messages([
    ("system", "Please summarise, use $$...$$ for block equations, $...$ inline and include equations if they best encapsulate the point. Start with the summary immediately, do not include any other text or repeat what I said. Use markdown. Top-level sections should be ### (h3). Have these sections:\nOutline (block of text that is a high level overview of the text, no bullet points. third person.)\n Key contributions (alternating freeflowing text and bullet points, don't just have bullet points. attach equations here if suitable but please don't overdo equations, usually 0-2 is good.)\nResults (short rundown of improvements, don't overdo it. you can use markdown table if it's best represented as such, but again (and I repeat) do NOT overdo it, no need to use a table if it's not useful)\nConclusion (alternating freeflowing text and bullet points, don't just have bullet points.)\n\nHere is the text:\n"),
    ("user", "{text}")
])

model = chat_model.bind(
    max_tokens=4095,
    temperature=0,
    top_p=1,
    frequency_penalty=0.0,
    presence_penalty=0.0,
)

chain = prompt | model
