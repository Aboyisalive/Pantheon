from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.chat_service import generate_response
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.schemas.chat import ChatCreate, ChatOut, SessionCreate, SessionOut
from app.services import chat_service
from app.api.v1.auth import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str

@router.post("/chat")

async def chat_endpoint(request: ChatRequest):
    return {
        "user_id": request.user_id,
        "message": request.message,
        "response": await generate_response(request.message)
    }

# Create new session
@router.post("/sessions", response_model=SessionOut)
def create_session(data: SessionCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return chat_service.create_session(db, user.id, data.title)

# Get all sessions
@router.get("/sessions", response_model=list[SessionOut])
def get_sessions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return chat_service.get_user_sessions(db, user.id)

# Send message
@router.post("/message", response_model=ChatOut)
def send_message(chat: ChatCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    bot_response = f"Echo: {chat.message}"  # replace with LLM later
    return chat_service.save_chat(db, user.id, chat.session_id, chat.message, bot_response)

# Get session messages (paginated)
@router.get("/sessions/{session_id}/messages", response_model=list[ChatOut])
def get_messages(session_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return chat_service.get_session_chats(db, session_id, skip, limit)