from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ChatCreate(BaseModel):
    message: str
    session_id: int

class ChatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    message: str
    response: str
    created_at: datetime


class SessionCreate(BaseModel):
    title: str | None = "New Chat"

class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
