from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from app.models.shared import EstadoDonacion, CategoriasKits


class Donacion(Document):
    codigo:             Indexed(str, unique=True)
    acopio:             str
    responsable_id:     PydanticObjectId
    responsable_nombre: str
    fecha_hora:         datetime
    destino:            Optional[str] = None
    comentarios:        Optional[str] = None
    categorias:         CategoriasKits
    total_cajas:        int = Field(default=0, ge=0)
    estado:             EstadoDonacion = EstadoDonacion.pendiente
    created_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "donaciones"
        indexes = [
            [("estado", 1), ("fecha_hora", -1)],
            [("acopio", 1), ("estado", 1)],
            [("estado", 1), ("total_cajas", 1)],
        ]
