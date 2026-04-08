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