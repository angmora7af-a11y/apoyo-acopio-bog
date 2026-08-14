from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from app.models.shared import TipoTransporte, CategoriasKits


class Recepcion(Document):
    codigo:             Indexed(str, unique=True)
    receptor_nombre:    str
    envio_id:           Indexed(PydanticObjectId, unique=True)
    envio_codigo:       str
    carga_categorias:   Optional[CategoriasKits] = None
    total_cajas:        Optional[int] = None
    tipo_transporte:    Optional[TipoTransporte] = None
    capacidad_ton:      Optional[float] = None
    empresa:            Optional[str] = None
    responsable_nombre: Optional[str] = None
    contacto:           Optional[str] = None
    placa:              Optional[str] = None
    fecha_hora:         datetime
    ciudad_origen:      Optional[str] = None
    ciudad_destino:     Optional[str] = None
    creado_por_id:      Optional[PydanticObjectId] = None
    creado_por_nombre:  Optional[str] = None
    created_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "recepciones"
        indexes = [
            [("ciudad_origen", 1), ("ciudad_destino", 1)],
        ]
