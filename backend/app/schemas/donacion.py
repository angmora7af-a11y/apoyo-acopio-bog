from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.shared import EstadoDonacion, CategoriasKits


class CrearDonacionRequest(BaseModel):
    acopio:      str = Field(min_length=2)
    fecha_hora:  datetime
    destino:     Optional[str] = None
    comentarios: Optional[str] = None
    categorias:  CategoriasKits
    estado:      EstadoDonacion = EstadoDonacion.pendiente


class CambiarEstadoRequest(BaseModel):
    estado: EstadoDonacion

    model_config = {"json_schema_extra": {"example": {"estado": "listo"}}}


class DonacionResponse(BaseModel):
    id:                 str
    codigo:             str
    acopio:             str
    responsable_id:     str
    responsable_nombre: str
    fecha_hora:         datetime
    destino:            Optional[str]
    comentarios:        Optional[str]
    categorias:         CategoriasKits
    total_cajas:        int
    estado:             EstadoDonacion
    created_at:         datetime
    updated_at:         datetime
