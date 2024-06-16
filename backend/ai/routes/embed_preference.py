import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
import numpy as np
from models.chat import model as chat_model
from models.embeddings import model as embeddings_model

preference_prompt = ChatPromptTemplate.from_messages([
    ("system", "Given the following preference description, generate a new description that expresses interest in research topics closely related to but not the same as the original one, expanding slightly into adjacent areas. Ensure the new topics remain relevant but introduce some variety. Be concise."),
    ("user", "{preference}")
])

abstract_prompt = ChatPromptTemplate.from_messages([
    ("system", "Generate an abstract of a scientific research paper from arXiv that matches the following topics of interest. Start immediately with the abstract and output nothing else."),
    ("user", "{preference}")
])

parser = StrOutputParser()

preference_chain = preference_prompt | chat_model | parser
num_preferences = 4

abstract_chain = abstract_prompt | chat_model | parser
abstracts_per_preference = 2

chain = (
    {
        "input": RunnablePassthrough(),
        "output": \
            RunnableLambda(lambda x: [x] * num_preferences) \
            | preference_chain.map()
    } \
    | RunnableLambda(lambda x: [x['input']['preference']] + x['output']) \
    | RunnableLambda(lambda x: x * abstracts_per_preference) \
    | abstract_chain.map() \
    | RunnableLambda(lambda x: embeddings_model.embed_documents(x)) \
    | RunnableLambda(lambda x: np.mean(x, axis=0).tolist())
).with_types(input_type=preference_prompt.input_schema)
