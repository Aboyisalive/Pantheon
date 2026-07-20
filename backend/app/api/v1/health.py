from fastapi import APIRouter
from sqlalchemy import text

from app.db.db import engine

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "chatbot-backend"
    }


@router.get("/health/db")
async def db_health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "reachable"}
    except Exception as e:
        return {"status": "unhealthy", "database": "unreachable", "error": str(e)}
