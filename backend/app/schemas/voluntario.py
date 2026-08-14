from pydantic import BaseModel, Field
from app.models.shared import RolUsuario


class LoginRequest(BaseModel):
    nombre:    str = Field(min_length=2)
    documento: str = Field(min_length=4)
    rol:       RolUsuario = RolUsuario.voluntario


class VoluntarioResponse(BaseModel):
    id:        str
    nombre:    str
    documento: str
    rol:       RolUsuario


class LoginResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    voluntario:   VoluntarioResponse
