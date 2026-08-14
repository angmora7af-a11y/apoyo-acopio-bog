from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.connection import get_client
from app.config import settings


async def next_codigo(prefix: str) -> str:
    """Contador atómico por prefijo usando findAndModify pattern."""
    client = get_client()
    db: AsyncIOMotorDatabase = client[settings.mongodb_db]
    result = await db.counters.find_one_and_update(
        {"_id": prefix.lower()},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return f"{prefix}-{str(result['seq']).zfill(3)}"
