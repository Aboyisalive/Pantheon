from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.chat_service import generate_response
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.schemas.chat import (
    ChatCreate,
    ChatOut,
    SessionCreate,
    SessionUpdate,
    SessionOut,
    FolderCreate,
    FolderOut,
)
from app.services import chat_service
from app.services.llm_service import generate_stream
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

# Send message (streaming)
@router.post("/message")
async def send_message(chat: ChatCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not chat_service.get_session(db, user.id, chat.session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    history = []
    for c in chat_service.get_session_chats(db, chat.session_id):
        history.append({"role": "user", "content": c.message})
        history.append({"role": "assistant", "content": c.response})

    async def stream_and_save():
        full_response = ""
        async for event in generate_stream(chat.message, history):
            if event.startswith("data: [DONE]"):
                yield "data: [DONE]\n\n"
            elif event.startswith("data: [ERROR]"):
                yield event
            else:
                token = event[6:].rstrip("\n\n")
                full_response += token
                yield f"data: {token}\n\n"
        chat_service.save_chat(db, user.id, chat.session_id, chat.message, full_response)

    return StreamingResponse(stream_and_save(), media_type="text/event-stream")
 
# Get session messages (paginated)
@router.get("/sessions/{session_id}/messages", response_model=list[ChatOut])
def get_messages(session_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not chat_service.get_session(db, user.id, session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    return chat_service.get_session_chats(db, session_id, skip, limit)

# Rename / move session to folder
@router.patch("/sessions/{session_id}", response_model=SessionOut)
def update_session(session_id: int, payload: SessionUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    session = chat_service.get_session(db, user.id, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # folder_id=null means "unfile"; absent means "leave alone"
    folder_id = payload.folder_id if "folder_id" in payload.model_fields_set else ...
    if folder_id is not ... and folder_id is not None:
        if not chat_service.get_folder(db, user.id, folder_id):
            raise HTTPException(status_code=404, detail="Folder not found")

    return chat_service.update_session(db, session, title=payload.title, folder_id=folder_id)

# Delete session
@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(session_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    session = chat_service.get_session(db, user.id, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    chat_service.delete_session(db, session)

# ── Folders ──
@router.get("/folders", response_model=list[FolderOut])
def get_folders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return chat_service.get_user_folders(db, user.id)

@router.post("/folders", response_model=FolderOut)
def create_folder(payload: FolderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Folder name is required")
    return chat_service.create_folder(db, user.id, name[:60])

@router.delete("/folders/{folder_id}", status_code=204)
def delete_folder(folder_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    folder = chat_service.get_folder(db, user.id, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    chat_service.delete_folder(db, folder)