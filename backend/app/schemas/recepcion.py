from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.shared import TipoTransporte, CategoriasKits


class CrearRecepcionRequest(BaseModel):
    receptor_nombre:    str = Field(min_length=2)
    envio_id:           str
    tipo_transporte:    Optional[TipoTransporte] = None
    capacidad_ton:      Optional[float] = None
    empresa:            Optional[str] = None
    responsable_nombre: Optional[str] = None
    contacto:           Optional[str] = None
    placa:              Optional[str] = None
    fecha_hora:         datetime
    ciudad_origen:      Optional[str] = None
    ciudad_destino:     Optional[str] = None


class RecepcionResponse(BaseModel):
    id:                 str
    codigo:             str
    receptor_nombre:    str
    envio_id:           str
    envio_codigo:       str
    carga_categorias:   Optional[CategoriasKits]
    total_cajas:        Optional[int]
    tipo_transporte:    Optional[TipoTransporte]
    capacidad_ton:      Optional[float]
    empresa:            Optional[str]
    responsable_nombre: Optional[str]
    contacto:           Optional[str]
    placa:              Optional[str]
    fecha_hora:         datetime
    ciudad_origen:      Optional[str]
    ciudad_destino:     Optional[str]
    creado_por_id:      Optional[str]
    creado_por_nombre:  Optional[str]
    created_at:         datetime
