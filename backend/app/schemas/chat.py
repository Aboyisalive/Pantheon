from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ChatCreate(BaseModel):
    message: str
    session_id: int

class ChatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    user_id: int
    message: str
    response: str
    created_at: datetime

class SessionCreate(BaseModel):
    title: str | None = "New Chat"

class SessionUpdate(BaseModel):
    title: str | None = None
    folder_id: int | None = None

class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    folder_id: int | None = None
    created_at: datetime

class FolderCreate(BaseModel):
    name: str

class FolderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
