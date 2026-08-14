from datetime import timezone
from fastapi import HTTPException, status
from beanie import PydanticObjectId

from app.models.donacion import Donacion
from app.models.voluntario import Voluntario
from app.models.shared import EstadoDonacion
from app.schemas.donacion import CrearDonacionRequest, DonacionResponse
from app.utils.codigo_generator import next_codigo
from app.utils.datetime_utils import utcnow

# Transiciones de estado permitidas manualmente (las del sistema no aplican aquí)
_MANUAL_TRANSITIONS = {
    EstadoDonacion.pendiente: {EstadoDonacion.listo},
    EstadoDonacion.listo:     {EstadoDonacion.pendiente},
}


def _to_response(d: Donacion) -> DonacionResponse:
    return DonacionResponse(
        id=str(d.id),
        codigo=d.codigo,
        acopio=d.acopio,
        responsable_id=str(d.responsable_id),
        responsable_nombre=d.responsable_nombre,
        fecha_hora=d.fecha_hora,
        destino=d.destino,
        comentarios=d.comentarios,
        categorias=d.categorias,
        total_cajas=d.total_cajas,
        estado=d.estado,
        created_at=d.created_at,
        updated_at=d.updated_at,
    )


async def crear_donacion(
    body: CrearDonacionRequest, usuario: Voluntario
) -> DonacionResponse:
    codigo = await next_codigo("D")
    total = body.categorias.total()
    fecha = body.fecha_hora.replace(tzinfo=timezone.utc) if body.fecha_hora.tzinfo is None else body.fecha_hora

    donacion = Donacion(
        codigo=codigo,
        acopio=body.acopio,
        responsable_id=usuario.id,
        responsable_nombre=usuario.nombre,
        fecha_hora=fecha,
        destino=body.destino,
        comentarios=body.comentarios,
        categorias=body.categorias,
        total_cajas=total,
        estado=body.estado,
    )
    await donacion.insert()
    return _to_response(donacion)


async def listar_donaciones(
    estado: str | None,
    acopio: str | None,
    skip: int,
    limit: int,
) -> list[DonacionResponse]:
    query = {}
    if estado:
        query["estado"] = estado
    if acopio:
        query["acopio"] = {"$regex": acopio, "$options": "i"}

    docs = await Donacion.find(query).sort(-Donacion.fecha_hora).skip(skip).limit(limit).to_list()
    return [_to_response(d) for d in docs]


async def obtener_donacion(donacion_id: str) -> DonacionResponse:
    d = await Donacion.get(PydanticObjectId(donacion_id))
    if not d:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donación no encontrada")
    return _to_response(d)


async def cambiar_estado(donacion_id: str, nuevo_estado: EstadoDonacion) -> DonacionResponse:
    d = await Donacion.get(PydanticObjectId(donacion_id))
    if not d:
        raise HTTPException(status_code=404, detail="Donación no encontrada")

    permitidos = _MANUAL_TRANSITIONS.get(d.estado, set())
    if nuevo_estado not in permitidos:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede cambiar de '{d.estado}' a '{nuevo_estado}' manualmente",
        )

    await d.set({Donacion.estado: nuevo_estado, Donacion.updated_at: utcnow()})
    return _to_response(d)
