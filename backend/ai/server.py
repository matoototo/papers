import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langserve import add_routes
from routes.suggest_categories import chain as suggest_categories_chain
from routes.embed_preference import chain as embed_preference_chain
from routes.summarize import chain as summarize_chain
from models.embeddings import model as embeddings_model

class TextRequest(BaseModel):
    text: str

app = FastAPI(title="Papers AI Server")

add_routes(app, suggest_categories_chain, path="/suggest_categories")
add_routes(app, embed_preference_chain, path="/embed_preference")

@app.post("/embed_text")
async def embed_text(body: TextRequest):
    return embeddings_model.embed_query(body.text)

@app.post("/summarize")
async def summarize(body: TextRequest):
    async def generator():
        async for chunk in summarize_chain.astream(body.text):
            yield chunk.content

    return StreamingResponse(generator(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.environ.get("AI_HOST", "localhost"), port=os.environ.get("AI_PORT", 3002))
