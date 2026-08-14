from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.db.connection import init_db, close_db
from app.db.indexes import create_indexes
from app.routers import auth, donaciones, envios, recepciones

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await create_indexes()
    yield
    await close_db()


app = FastAPI(
    title="Ayuda Logística BOG",
    description="API de gestión humanitaria — centros de acopio y despacho logístico",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(donaciones.router,  prefix="/api/donaciones",  tags=["Donaciones"])
app.include_router(envios.router,      prefix="/api/envios",      tags=["Envíos"])
app.include_router(recepciones.router, prefix="/api/recepciones", tags=["Recepciones"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "env": settings.environment}
