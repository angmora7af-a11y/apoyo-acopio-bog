from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.shared import EstadoEnvio, TipoTransporte, CategoriasKits


class CrearEnvioRequest(BaseModel):
    tipo_transporte:    TipoTransporte
    capacidad_ton:      Optional[float] = None
    empresa:            Optional[str] = None
    placa:              Optional[str] = None
    responsable_nombre: str = Field(min_length=2)
    contacto:           Optional[str] = None
    fecha_hora:         datetime
    ciudad_origen:      str = Field(min_length=2)
    ciudad_destino:     str = Field(min_length=2)
    donaciones_ids:     list[str] = Field(default_factory=list)


class EnvioResponse(BaseModel):
    id:                 str
    codigo:             str
    tipo_transporte:    TipoTransporte
    capacidad_ton:      Optional[float]
    empresa:            Optional[str]
    placa:              Optional[str]
    responsable_nombre: str
    contacto:           Optional[str]
    fecha_hora:         datetime
    ciudad_origen:      str
    ciudad_destino:     str
    donaciones_ids:     list[str]
    carga_categorias:   CategoriasKits
    total_cajas:        int
    estado:             EstadoEnvio
    creado_por_id:      Optional[str]
    creado_por_nombre:  Optional[str]
    created_at:         datetime
    updated_at:         datetime
