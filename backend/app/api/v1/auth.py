from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.db.db import get_db
from app.services import user_service
from app.core import auth
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserUpdate,
    PasswordChange,
    Token,
    UserWithToken,
)

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


# Current user
@router.get("/me", response_model=UserOut)
def read_me(user=Depends(get_current_user)):
    return user


# Update profile (username / email)
@router.patch("/me", response_model=UserWithToken)
def update_me(update: UserUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if update.username and update.username != user.username:
        if user_service.get_user_by_username(db, update.username):
            raise HTTPException(status_code=400, detail="Username already taken")
    if update.email and update.email != user.email:
        if user_service.get_user_by_email(db, update.email):
            raise HTTPException(status_code=400, detail="Email already registered")

    updated = user_service.update_user(db, user, update.username, update.email)

    # Token subject is the email, so re-mint in case it changed
    token = auth.create_access_token({"sub": updated.email})
    return {"user": updated, "access_token": token, "token_type": "bearer"}


# Change password
@router.put("/me/password", status_code=204)
def change_my_password(payload: PasswordChange, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not auth.verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    user_service.change_password(db, user, payload.new_password)