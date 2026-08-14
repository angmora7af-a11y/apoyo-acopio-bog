from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    mongodb_uri: str
    mongodb_db: str = "ayuda_logistica"
    jwt_secret: str
    jwt_expire_min: int = 480
    cors_origins: list[str] = ["http://localhost:5173"]
    environment: str = "development"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


settings = Settings()
