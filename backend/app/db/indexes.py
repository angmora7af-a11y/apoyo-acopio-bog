from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo.errors import OperationFailure
from app.db.connection import get_client
from app.config import settings


async def _idx(col: AsyncIOMotorCollection, keys, **kwargs) -> None:
    """create_index idempotente: ignora IndexOptionsConflict (code 85)."""
    try:
        await col.create_index(keys, **kwargs)
    except OperationFailure as e:
        if e.code != 85:
            raise


async def create_indexes() -> None:
    client = get_client()
    db = client[settings.mongodb_db]

    # ── voluntarios ──────────────────────────────────────────
    await _idx(db.voluntarios, "documento",               unique=True, name="uq_voluntarios_documento")
    await _idx(db.voluntarios, "rol",                                  name="idx_voluntarios_rol")
    await _idx(db.voluntarios, [("documento", 1), ("rol", 1)],         name="idx_voluntarios_doc_rol")

    # ── donaciones ───────────────────────────────────────────
    await _idx(db.donaciones, "codigo",                   unique=True, name="uq_donaciones_codigo")
    await _idx(db.donaciones, "estado",                                name="idx_donaciones_estado")
    await _idx(db.donaciones, "responsable_id",                        name="idx_donaciones_responsable")
    await _idx(db.donaciones, "acopio",                                name="idx_donaciones_acopio")
    await _idx(db.donaciones, [("estado", 1), ("fecha_hora", -1)],     name="idx_donaciones_estado_fecha")
    await _idx(db.donaciones, [("acopio", 1), ("estado", 1)],          name="idx_donaciones_acopio_estado")
    await _idx(db.donaciones, [("estado", 1), ("total_cajas", 1)],     name="idx_donaciones_estado_cajas")

    # ── envios ───────────────────────────────────────────────
    await _idx(db.envios, "codigo",                       unique=True, name="uq_envios_codigo")
    await _idx(db.envios, "estado",                                    name="idx_envios_estado")
    await _idx(db.envios, "fecha_hora",                                name="idx_envios_fecha_hora")
    await _idx(db.envios, "donaciones_ids",                            name="idx_envios_donaciones_ids")
    await _idx(db.envios, "ciudad_destino",                            name="idx_envios_destino")
    await _idx(db.envios, [("estado", 1), ("fecha_hora", -1)],         name="idx_envios_estado_fecha")
    await _idx(db.envios, [("ciudad_origen", 1), ("ciudad_destino", 1)], name="idx_envios_ruta")

    # ── recepciones ──────────────────────────────────────────
    await _idx(db.recepciones, "codigo",                  unique=True, name="uq_recepciones_codigo")
    await _idx(db.recepciones, "envio_id",                unique=True, name="uq_recepciones_envio_id")
    await _idx(db.recepciones, "fecha_hora",                           name="idx_recepciones_fecha_hora")
    await _idx(db.recepciones, "ciudad_destino",                       name="idx_recepciones_destino")
