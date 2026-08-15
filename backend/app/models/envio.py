from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from app.models.shared import EstadoEnvio, TipoTransporte, CategoriasKits


class Envio(Document):
    codigo:             Indexed(str, unique=True)
    tipo_transporte:    TipoTransporte
    capacidad_ton:      Optional[float] = None
    empresa:            Optional[str] = None
    placa:              Optional[str] = None
    responsable_nombre: str
    contacto:           Optional[str] = None
    fecha_hora:         datetime
    ciudad_origen:      str
    ciudad_destino:     str
    carga_categorias:   CategoriasKits
    total_cajas:        int = Field(default=0, ge=0)
    estado:             EstadoEnvio = EstadoEnvio.en_transito
    creado_por_id:      Optional[PydanticObjectId] = None
    creado_por_nombre:  Optional[str] = None
    created_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "envios"
        indexes = [
            [("estado", 1), ("fecha_hora", -1)],
            [("ciudad_origen", 1), ("ciudad_destino", 1)],
            [("estado", 1), ("ciudad_destino", 1)],
        ]
