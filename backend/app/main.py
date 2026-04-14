import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.db import Base, engine

# import models so SQLAlchemy knows about them
from app.models.user import User
from app.models.chat import Chat
from app.models.chat_session import ChatSession
from app.api.v1 import chat, health, auth

# Create tables
Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    app = FastAPI(title="Chatbot Backend API", version="1.0.0")

    frontend_urls = os.getenv("FRONTEND_URL", "https://pantheon-umber.vercel.app/")
    frontend_origins = [url.strip() for url in frontend_urls.split(",") if url.strip()]

    # CORS settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=frontend_origins,
        allow_methods=["*"],
        allow_credentials=True,
        allow_headers=["*"],
    )
        
    # Include API routers
    app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
    app.include_router(health.router, prefix="/api/v1", tags=["health"])
    app.include_router(auth.router, prefix="/api/v1", tags=["auth"])

    # Root endpoint
    @app.get("/")
    async def root():
        return {"message": "API is running!"}

    return app

app = create_app()