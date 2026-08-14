from datetime import timezone
from fastapi import HTTPException, status
from beanie import PydanticObjectId

from app.models.donacion import Donacion
from app.models.envio import Envio
from app.models.voluntario import Voluntario
from app.models.shared import EstadoDonacion, EstadoEnvio, CategoriasKits
from app.schemas.envio import CrearEnvioRequest, EnvioResponse
from app.utils.codigo_generator import next_codigo
from app.utils.datetime_utils import utcnow


def _to_response(e: Envio) -> EnvioResponse:
    return EnvioResponse(
        id=str(e.id),
        codigo=e.codigo,
        tipo_transporte=e.tipo_transporte,
        capacidad_ton=e.capacidad_ton,
        empresa=e.empresa,
        placa=e.placa,
        responsable_nombre=e.responsable_nombre,
        contacto=e.contacto,
        fecha_hora=e.fecha_hora,
        ciudad_origen=e.ciudad_origen,
        ciudad_destino=e.ciudad_destino,
        donaciones_ids=[str(i) for i in e.donaciones_ids],
        carga_categorias=e.carga_categorias,
        total_cajas=e.total_cajas,
        estado=e.estado,
        creado_por_id=str(e.creado_por_id) if e.creado_por_id else None,
        creado_por_nombre=e.creado_por_nombre,
        created_at=e.created_at,
        updated_at=e.updated_at,
    )


async def crear_envio(body: CrearEnvioRequest, usuario: Voluntario) -> EnvioResponse:
    don_ids = [PydanticObjectId(i) for i in body.donaciones_ids]

    # Validar que todas las donaciones existen y están listas
    donaciones = await Donacion.find(
        {"_id": {"$in": don_ids}, "estado": EstadoDonacion.listo}
    ).to_list()

    if len(donaciones) != len(don_ids):
        raise HTTPException(
            status_code=400,
            detail="Algunas donaciones no existen o no están en estado 'listo'",
        )

    # Agregar categorías
    carga = CategoriasKits()
    for d in donaciones:
        carga = carga.sumar(d.categorias)
    total = sum(d.total_cajas for d in donaciones)

    codigo = await next_codigo("E")
    fecha = body.fecha_hora.replace(tzinfo=timezone.utc) if body.fecha_hora.tzinfo is None else body.fecha_hora

    envio = Envio(
        codigo=codigo,
        tipo_transporte=body.tipo_transporte,
        capacidad_ton=body.capacidad_ton,
        empresa=body.empresa,
        placa=body.placa,
        responsable_nombre=body.responsable_nombre,
        contacto=body.contacto,
        fecha_hora=fecha,
        ciudad_origen=body.ciudad_origen,
        ciudad_destino=body.ciudad_destino,
        donaciones_ids=don_ids,
        carga_categorias=carga,
        total_cajas=total,
        creado_por_id=usuario.id,
        creado_por_nombre=usuario.nombre,
    )
    await envio.insert()

    # Actualizar donaciones → en_transito
    now = utcnow()
    await Donacion.find({"_id": {"$in": don_ids}}).update_many(
        {"$set": {"estado": EstadoDonacion.en_transito, "updated_at": now}}
    )

    return _to_response(envio)


async def listar_envios(
    estado: str | None,
    ciudad_destino: str | None,
    skip: int,
    limit: int,
) -> list[EnvioResponse]:
    query = {}
    if estado:
        query["estado"] = estado
    if ciudad_destino:
        query["ciudad_destino"] = {"$regex": ciudad_destino, "$options": "i"}

    docs = await Envio.find(query).sort(-Envio.fecha_hora).skip(skip).limit(limit).to_list()
    return [_to_response(e) for e in docs]


async def obtener_envio(envio_id: str) -> EnvioResponse:
    e = await Envio.get(PydanticObjectId(envio_id))
    if not e:
        raise HTTPException(status_code=404, detail="Envío no encontrado")
    return _to_response(e)


async def listar_disponibles_recepcion() -> list[EnvioResponse]:
    docs = await Envio.find(Envio.estado == EstadoEnvio.en_transito).sort(-Envio.fecha_hora).to_list()
    return [_to_response(e) for e in docs]
