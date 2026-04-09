import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env")


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    APP_NAME: str = "Pantheon Backend"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()