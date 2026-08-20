from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.models.voluntario import Voluntario
from app.schemas.donacion import CrearDonacionRequest, DonacionResponse
from app.services import donacion_service
from app.dependencies.auth import get_current_user
from app.dependencies.pagination import PaginationParams, get_pagination

router = APIRouter()


@router.get("", response_model=list[DonacionResponse])
async def listar(
    donante: Optional[str] = Query(None),
    pag:     PaginationParams = Depends(get_pagination),
    usuario: Voluntario = Depends(get_current_user),
):
    return await donacion_service.listar_donaciones(donante, pag.skip, pag.limit)


@router.post("", response_model=DonacionResponse, status_code=201)
async def crear(
    body:    CrearDonacionRequest,
    usuario: Voluntario = Depends(get_current_user),
):
    return await donacion_service.crear_donacion(body, usuario)


@router.get("/{donacion_id}", response_model=DonacionResponse)
async def obtener(
    donacion_id: str,
    usuario: Voluntario = Depends(get_current_user),
):
    return await donacion_service.obtener_donacion(donacion_id)
