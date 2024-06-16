import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langserve import add_routes
from routes.suggest_categories import chain as suggest_categories_chain
from routes.embed_preference import chain as embed_preference_chain
from models.embeddings import model as embeddings_model

class EmbedTextRequest(BaseModel):
    text: str

app = FastAPI(title="Papers AI Server")

add_routes(app, suggest_categories_chain, path="/suggest_categories")
add_routes(app, embed_preference_chain, path="/embed_preference")

@app.post("/embed_text")
async def embed_text(body: EmbedTextRequest):
    text = body.text

    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        embedding = embeddings_model.embed_query(text)
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.environ.get("AI_HOST", "localhost"), port=os.environ.get("AI_PORT", 3002))
