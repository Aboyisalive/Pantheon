import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.db.db import Base, engine

# import models so SQLAlchemy knows about them
from app.models.user import User
from app.models.chat import Chat
from app.models.chat_session import ChatSession
from app.api.v1 import chat, health, auth

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup instead of at import time, so a temporarily
    # unreachable database doesn't crash-loop the container on deploy
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        logger.exception("Could not create tables at startup; continuing without them")
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="Chatbot Backend API", version="1.0.0", lifespan=lifespan)

    frontend_urls = os.getenv("FRONTEND_URL", "https://pantheon-umber.vercel.app")
    frontend_origins = [url.strip() for url in frontend_urls.split(",") if url.strip()]

    # CORS settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=frontend_origins,
        allow_methods=["*"],
        allow_credentials=True,
        allow_headers=["*"],
    )
        
    # Handled here (not ServerErrorMiddleware) so the 503 passes back through
    # CORSMiddleware and the browser surfaces it instead of a CORS failure
    @app.exception_handler(SQLAlchemyError)
    async def db_error_handler(request: Request, exc: SQLAlchemyError):
        logger.error("Database error on %s: %s", request.url.path, exc)
        return JSONResponse(status_code=503, content={"detail": "Database unavailable"})

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