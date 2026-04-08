from app.services.llm_service import generate_response
from app.services.memory_service import save_message
from sqlalchemy.orm import Session
from app.models.chat import Chat
from app.models.chat_session import ChatSession


async def handle_chat(user_id: str, message: str) -> dict:
    """
    Main chat handler:
    - Receives user input
    - Calls LLM for response
    - Persists conversation
    - Returns structured response
    """

    # Generate AI response
    ai_response = await generate_response(message)

    # Save conversation (async, non-blocking pattern later)
    await save_message(user_id, message, ai_response)

    # Return structured response
    return {
        "user_id": user_id,
        "message": message,
        "response": ai_response
    }
    # Create session
def create_session(db: Session, user_id: int, title: str = "New Chat"):
    session = ChatSession(user_id=user_id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

# Save message
def save_chat(db: Session, user_id: int, session_id: int, message: str, response: str):
    chat = Chat(
        user_id=user_id,
        session_id=session_id,
        message=message,
        response=response
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

# Get chats with pagination
def get_session_chats(db: Session, session_id: int, skip: int = 0, limit: int = 20):
    return (
        db.query(Chat)
        .filter(Chat.session_id == session_id)
        .order_by(Chat.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

# Get user sessions
def get_user_sessions(db: Session, user_id: int):
    return db.query(ChatSession).filter(ChatSession.user_id == user_id).all()
