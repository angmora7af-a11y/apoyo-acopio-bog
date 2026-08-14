from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.voluntario import Voluntario
from app.models.shared import RolUsuario
from app.schemas.voluntario import LoginRequest, LoginResponse, VoluntarioResponse
from app.dependencies.auth import create_access_token

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=LoginResponse)
@limiter.limit("20/minute")
async def login(request: Request, body: LoginRequest):
    voluntario = await Voluntario.find_one(Voluntario.documento == body.documento)

    if not voluntario:
        voluntario = Voluntario(
            nombre=body.nombre,
            documento=body.documento,
            rol=body.rol,
        )
        await voluntario.insert()
    else:
        # Actualizar nombre si cambió
        if voluntario.nombre != body.nombre:
            await voluntario.set({Voluntario.nombre: body.nombre})

    token = create_access_token({"sub": str(voluntario.id), "rol": voluntario.rol})

    return LoginResponse(
        access_token=token,
        voluntario=VoluntarioResponse(
            id=str(voluntario.id),
            nombre=voluntario.nombre,
            documento=voluntario.documento,
            rol=voluntario.rol,
        ),
    )
