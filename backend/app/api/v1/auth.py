from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.db.db import get_db
from app.services import user_service
from app.core import auth
from app.schemas.user import UserCreate, UserOut, Token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    user = user_service.get_user_by_email(db, email)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# Register
@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = user_service.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    return user_service.create_user(db, user.username, user.email, user.password)


# Login
@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, form_data.username)

    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"sub": user.email})

    return {"access_token": token, "token_type": "bearer"}