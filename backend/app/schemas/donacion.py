from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.shared import CategoriasKits


class CrearDonacionRequest(BaseModel):
    fecha_hora:      datetime
    donante_nombre:  str = Field(min_length=2)
    receptor_nombre: str = Field(min_length=2)
    categorias:      CategoriasKits
    comentarios:     Optional[str] = None


class DonacionResponse(BaseModel):
    id:                str
    codigo:            str
    fecha_hora:        datetime
    donante_nombre:    str
    receptor_nombre:   str
    categorias:        CategoriasKits
    total_cajas:       int
    comentarios:       Optional[str]
    creado_por_id:     str
    creado_por_nombre: str
    created_at:        datetime
    updated_at:        datetime
