from datetime import timezone
from fastapi import HTTPException, status
from beanie import PydanticObjectId

from app.models.donacion import Donacion
from app.models.voluntario import Voluntario
from app.schemas.donacion import CrearDonacionRequest, DonacionResponse
from app.utils.codigo_generator import next_codigo


def _to_response(d: Donacion) -> DonacionResponse:
    return DonacionResponse(
        id=str(d.id),
        codigo=d.codigo,
        fecha_hora=d.fecha_hora,
        donante_nombre=d.donante_nombre,
        receptor_nombre=d.receptor_nombre,
        categorias=d.categorias,
        total_cajas=d.total_cajas,
        comentarios=d.comentarios,
        creado_por_id=str(d.creado_por_id),
        creado_por_nombre=d.creado_por_nombre,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )


async def crear_donacion(
    body: CrearDonacionRequest, usuario: Voluntario
) -> DonacionResponse:
    codigo = await next_codigo("D")
    fecha = body.fecha_hora.replace(tzinfo=timezone.utc) if body.fecha_hora.tzinfo is None else body.fecha_hora

    donacion = Donacion(
        codigo=codigo,
        fecha_hora=fecha,
        donante_nombre=body.donante_nombre,
        receptor_nombre=body.receptor_nombre,
        categorias=body.categorias,
        total_cajas=body.categorias.total(),
        comentarios=body.comentarios,
        creado_por_id=usuario.id,
        creado_por_nombre=usuario.nombre,
    )
    await donacion.insert()
    return _to_response(donacion)


async def listar_donaciones(
    donante: str | None,
    skip: int,
    limit: int,
) -> list[DonacionResponse]:
    query = {}
    if donante:
        query["donante_nombre"] = {"$regex": donante, "$options": "i"}

    docs = await Donacion.find(query).sort(-Donacion.fecha_hora).skip(skip).limit(limit).to_list()
    return [_to_response(d) for d in docs]


async def obtener_donacion(donacion_id: str) -> DonacionResponse:
    d = await Donacion.get(PydanticObjectId(donacion_id))
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donación no encontrada")
    return _to_response(d)
