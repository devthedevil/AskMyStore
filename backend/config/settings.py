from pydantic_settings import BaseSettings
from pathlib import Path
import os


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    model_name: str = "claude-sonnet-4-20250514"
    embedding_model: str = "all-MiniLM-L6-v2"
    data_dir: str = str(Path(__file__).parent.parent.parent / "data")
    top_k: int = 10

    class Config:
        env_file = str(Path(__file__).parent.parent.parent / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
