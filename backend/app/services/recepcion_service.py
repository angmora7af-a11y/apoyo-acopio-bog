from datetime import timezone
from fastapi import HTTPException
from beanie import PydanticObjectId

from app.models.donacion import Donacion
from app.models.envio import Envio
from app.models.recepcion import Recepcion
from app.models.voluntario import Voluntario
from app.models.shared import EstadoDonacion, EstadoEnvio
from app.schemas.recepcion import CrearRecepcionRequest, RecepcionResponse
from app.utils.codigo_generator import next_codigo
from app.utils.datetime_utils import utcnow
from app.db.connection import get_client
from app.config import settings


def _to_response(r: Recepcion) -> RecepcionResponse:
    return RecepcionResponse(
        id=str(r.id),
        codigo=r.codigo,
        receptor_nombre=r.receptor_nombre,
        envio_id=str(r.envio_id),
        envio_codigo=r.envio_codigo,
        carga_categorias=r.carga_categorias,
        total_cajas=r.total_cajas,
        tipo_transporte=r.tipo_transporte,
        capacidad_ton=r.capacidad_ton,
        empresa=r.empresa,
        responsable_nombre=r.responsable_nombre,
        contacto=r.contacto,
        placa=r.placa,
        fecha_hora=r.fecha_hora,
        ciudad_origen=r.ciudad_origen,
        ciudad_destino=r.ciudad_destino,
        creado_por_id=str(r.creado_por_id) if r.creado_por_id else None,
        creado_por_nombre=r.creado_por_nombre,
        created_at=r.created_at,
    )


async def confirmar_recepcion(
    body: CrearRecepcionRequest, usuario: Voluntario
) -> RecepcionResponse:
    envio_oid = PydanticObjectId(body.envio_id)

    # Verificar que no existe ya una recepción para este envío
    existente = await Recepcion.find_one(Recepcion.envio_id == envio_oid)
    if existente:
        raise HTTPException(status_code=409, detail="Este envío ya tiene una recepción registrada")

    envio = await Envio.get(envio_oid)
    if not envio or envio.estado != EstadoEnvio.en_transito:
        raise HTTPException(status_code=400, detail="Envío no disponible para recepción")

    codigo = await next_codigo("R")
    fecha = body.fecha_hora.replace(tzinfo=timezone.utc) if body.fecha_hora.tzinfo is None else body.fecha_hora
    now = utcnow()

    # Usar transacción multi-documento
    client = get_client()
    async with await client.start_session() as session:
        async with session.start_transaction():
            recepcion = Recepcion(
                codigo=codigo,
                receptor_nombre=body.receptor_nombre,
                envio_id=envio.id,
                envio_codigo=envio.codigo,
                carga_categorias=envio.carga_categorias,
                total_cajas=envio.total_cajas,
                tipo_transporte=body.tipo_transporte or envio.tipo_transporte,
                capacidad_ton=body.capacidad_ton or envio.capacidad_ton,
                empresa=body.empresa or envio.empresa,
                responsable_nombre=body.responsable_nombre or envio.responsable_nombre,
                contacto=body.contacto or envio.contacto,
                placa=body.placa or envio.placa,
                fecha_hora=fecha,
                ciudad_origen=body.ciudad_origen or envio.ciudad_origen,
                ciudad_destino=body.ciudad_destino or envio.ciudad_destino,
                creado_por_id=usuario.id,
                creado_por_nombre=usuario.nombre,
            )
            await recepcion.insert(session=session)

            # Envío → entregado
            await Envio.find_one(Envio.id == envio.id, session=session).update(
                {"$set": {"estado": EstadoEnvio.entregado, "updated_at": now}}
            )

            # Donaciones del envío → entregado
            if envio.donaciones_ids:
                await Donacion.find(
                    {"_id": {"$in": envio.donaciones_ids}}, session=session
                ).update_many(
                    {"$set": {"estado": EstadoDonacion.entregado, "updated_at": now}}
                )

    return _to_response(recepcion)


async def listar_recepciones(skip: int, limit: int) -> list[RecepcionResponse]:
    docs = await Recepcion.find().sort(-Recepcion.fecha_hora).skip(skip).limit(limit).to_list()
    return [_to_response(r) for r in docs]


async def obtener_recepcion(recepcion_id: str) -> RecepcionResponse:
    r = await Recepcion.get(PydanticObjectId(recepcion_id))
    if not r:
        raise HTTPException(status_code=404, detail="Recepción no encontrada")
    return _to_response(r)
