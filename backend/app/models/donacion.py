from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from app.models.shared import CategoriasKits


class Donacion(Document):
    codigo:             Indexed(str, unique=True)
    fecha_hora:         datetime
    donante_nombre:     str
    receptor_nombre:    str
    categorias:         CategoriasKits
    total_cajas:        int = Field(default=0, ge=0)
    comentarios:        Optional[str] = None
    creado_por_id:      PydanticObjectId
    creado_por_nombre:  str
    created_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "donaciones"
        indexes = [
            [("fecha_hora", -1)],
            [("donante_nombre", 1)],
        ]
