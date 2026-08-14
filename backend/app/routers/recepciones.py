from fastapi import APIRouter, Depends

from app.models.voluntario import Voluntario
from app.schemas.recepcion import CrearRecepcionRequest, RecepcionResponse
from app.services import recepcion_service
from app.dependencies.auth import get_current_user
from app.dependencies.pagination import PaginationParams, get_pagination

router = APIRouter()


@router.get("", response_model=list[RecepcionResponse])
async def listar(
    pag:     PaginationParams = Depends(get_pagination),
    usuario: Voluntario = Depends(get_current_user),
):
    return await recepcion_service.listar_recepciones(pag.skip, pag.limit)


@router.post("", response_model=RecepcionResponse, status_code=201)
async def confirmar(
    body:    CrearRecepcionRequest,
    usuario: Voluntario = Depends(get_current_user),
):
    return await recepcion_service.confirmar_recepcion(body, usuario)


@router.get("/{recepcion_id}", response_model=RecepcionResponse)
async def obtener(
    recepcion_id: str,
    usuario:      Voluntario = Depends(get_current_user),
):
    return await recepcion_service.obtener_recepcion(recepcion_id)
