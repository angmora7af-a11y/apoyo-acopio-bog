from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.models.voluntario import Voluntario
from app.schemas.envio import CrearEnvioRequest, EnvioResponse
from app.services import envio_service
from app.dependencies.auth import get_current_user
from app.dependencies.pagination import PaginationParams, get_pagination

router = APIRouter()


@router.get("", response_model=list[EnvioResponse])
async def listar(
    estado:         Optional[str] = Query(None),
    ciudad_destino: Optional[str] = Query(None),
    pag:            PaginationParams = Depends(get_pagination),
    usuario:        Voluntario = Depends(get_current_user),
):
    return await envio_service.listar_envios(estado, ciudad_destino, pag.skip, pag.limit)


@router.get("/disponibles-recepcion", response_model=list[EnvioResponse])
async def disponibles_recepcion(usuario: Voluntario = Depends(get_current_user)):
    return await envio_service.listar_disponibles_recepcion()


@router.post("", response_model=EnvioResponse, status_code=201)
async def crear(
    body:    CrearEnvioRequest,
    usuario: Voluntario = Depends(get_current_user),
):
    return await envio_service.crear_envio(body, usuario)


@router.get("/{envio_id}", response_model=EnvioResponse)
async def obtener(
    envio_id: str,
    usuario:  Voluntario = Depends(get_current_user),
):
    return await envio_service.obtener_envio(envio_id)
