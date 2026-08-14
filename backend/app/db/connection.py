from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("MongoDB client not initialized")
    return _client


async def init_db() -> None:
    global _client
    from app.models.voluntario import Voluntario
    from app.models.donacion import Donacion
    from app.models.envio import Envio
    from app.models.recepcion import Recepcion

    _client = AsyncIOMotorClient(settings.mongodb_uri)
    await init_beanie(
        database=_client[settings.mongodb_db],
        document_models=[Voluntario, Donacion, Envio, Recepcion],
    )


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
