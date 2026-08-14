from datetime import datetime, timezone
from beanie import Document, Indexed
from pydantic import Field
from app.models.shared import RolUsuario


class Voluntario(Document):
    nombre:     str
    documento:  Indexed(str, unique=True)
    rol:        RolUsuario = RolUsuario.voluntario
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "voluntarios"
