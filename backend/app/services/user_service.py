from sqlalchemy.orm import Session
from app.models.user import User
from app.core.auth import hash_password

def create_user(db: Session, username: str, email: str, password: str):
    user = User(
        username=username,
        email=email,
        password_hash=hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def update_user(db: Session, user: User, username: str = None, email: str = None):
    if username is not None:
        user.username = username
    if email is not None:
        user.email = email
    db.commit()
    db.refresh(user)
    return user

def change_password(db: Session, user: User, new_password: str):
    user.password_hash = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user: User):
    from app.models.chat import Chat
    from app.models.chat_session import ChatSession
    from app.models.folder import Folder

    db.query(Chat).filter(Chat.user_id == user.id).delete()
    db.query(ChatSession).filter(ChatSession.user_id == user.id).delete()
    db.query(Folder).filter(Folder.user_id == user.id).delete()
    db.delete(user)
    db.commit()