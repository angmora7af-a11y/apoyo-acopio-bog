from enum import Enum
from pydantic import BaseModel, Field


class EstadoDonacion(str, Enum):
    pendiente   = "pendiente"
    listo       = "listo"
    en_transito = "en_transito"
    entregado   = "entregado"


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
    aseo:         int = Field(default=0, ge=0)
    alimentos:    int = Field(default=0, ge=0)
    mascotas:     int = Field(default=0, ge=0)
    medicamentos: int = Field(default=0, ge=0)
    insumos:      int = Field(default=0, ge=0)
    rescate:      int = Field(default=0, ge=0)
    refugio:      int = Field(default=0, ge=0)
    ropa:         int = Field(default=0, ge=0)

    def total(self) -> int:
        return (
            self.aseo + self.alimentos + self.mascotas + self.medicamentos
            + self.insumos + self.rescate + self.refugio + self.ropa
        )

    def sumar(self, other: "CategoriasKits") -> "CategoriasKits":
        return CategoriasKits(
            aseo=self.aseo + other.aseo,
            alimentos=self.alimentos + other.alimentos,
            mascotas=self.mascotas + other.mascotas,
            medicamentos=self.medicamentos + other.medicamentos,
            insumos=self.insumos + other.insumos,
            rescate=self.rescate + other.rescate,
            refugio=self.refugio + other.refugio,
            ropa=self.ropa + other.ropa,
        )
