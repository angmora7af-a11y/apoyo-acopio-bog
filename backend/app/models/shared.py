from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class EstadoEnvio(str, Enum):
    en_transito = "en_transito"
    entregado   = "entregado"


class TipoTransporte(str, Enum):
    carro       = "carro"
    camion      = "camion"
    avion_vuelo = "avion_vuelo"
    barco       = "barco"
    otro        = "otro"


class RolUsuario(str, Enum):
    voluntario    = "voluntario"
    administrador = "administrador"


class CategoriasKits(BaseModel):
    model_config = ConfigDict(extra="allow")

    aseo:         int = Field(default=0, ge=0)
    alimentos:    int = Field(default=0, ge=0)
    mascotas:     int = Field(default=0, ge=0)
    medicamentos: int = Field(default=0, ge=0)
    insumos:      int = Field(default=0, ge=0)
    rescate:      int = Field(default=0, ge=0)
    refugio:      int = Field(default=0, ge=0)
    ropa:         int = Field(default=0, ge=0)

    def total(self) -> int:
        return sum(self.model_dump().values())

    def sumar(self, other: "CategoriasKits") -> "CategoriasKits":
        a = self.model_dump()
        b = other.model_dump()
        merged = {k: a.get(k, 0) + b.get(k, 0) for k in set(a) | set(b)}
        return CategoriasKits(**merged)
