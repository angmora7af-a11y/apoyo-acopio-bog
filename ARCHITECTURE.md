# Architecture — Ayuda Logística BOG

> **Audiencia:** Equipo de desarrollo  
> **Stack:** React · FastAPI · MongoDB Atlas · Vercel (frontend estático + backend serverless)  
> **Versión:** 1.1 — Agosto 2026

---

## Tabla de contenidos

1. [Diagrama de alto nivel](#1-diagrama-de-alto-nivel)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Frontend — React](#3-frontend--react)
4. [Backend — FastAPI](#4-backend--fastapi)
5. [Base de datos — MongoDB Atlas](#5-base-de-datos--mongodb-atlas)
6. [Infraestructura Vercel](#6-infraestructura-vercel)
7. [Contrato de API](#7-contrato-de-api)
8. [Seguridad](#8-seguridad)
9. [Flujo de datos end-to-end](#9-flujo-de-datos-end-to-end)
10. [Configuración de entornos](#10-configuración-de-entornos)
11. [Pipeline CI/CD](#11-pipeline-cicd)
12. [Decisiones de diseño (ADR)](#12-decisiones-de-diseño-adr)

---

## 1. Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                               │
│              (Voluntario / Administrador — móvil o desktop)         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Vercel Edge Network (CDN + TLS)                  │
│   Un solo dominio/proyecto · mismo origen para todo → sin CORS  │
└──────────┬───────────────────────────────────────────────────────┘
           │                              │
    /  (assets)                   /api/*  (route)
           │                              │
           ▼                              ▼
┌──────────────────┐         ┌────────────────────────────────────┐
│  Vercel           │         │  Vercel Serverless Function        │
│  Static Build     │         │  (Python runtime, @vercel/python)  │
│  React SPA        │         │  ┌──────────────────────────────┐ │
│                   │         │  │  ASGI: backend/api/index.py │ │
│  index.html       │         │  │  → FastAPI Application       │ │
│  assets/          │         │  └──────────────────────────────┘ │
│  favicon.ico      │         │  Cold start por invocación fría   │
└──────────────────┘         └───────────────┬────────────────────┘
                                             │  TLS / Motor async
                                             ▼
                             ┌───────────────────────────────────┐
                             │  MongoDB Atlas (M10 cluster)      │
                             │  Región: us-east-1 (Virginia)     │
                             │                                   │
                             │  Colecciones:                     │
                             │    · voluntarios                  │
                             │    · donaciones                   │
                             │    · envios                       │
                             │    · recepciones                  │
                             └───────────────────────────────────┘
```

---

## 2. Stack tecnológico

### Frontend
| Capa | Librería / Herramienta | Versión mínima | Por qué |
|------|------------------------|----------------|---------|
| Framework UI | React | 18.x | Ecosistema, concurrent rendering |
| Lenguaje | TypeScript | 5.x | Type-safety en contratos de API |
| Build tool | Vite | 5.x | HMR instantáneo, tree-shaking |
| Routing | React Router | 6.x | Nested routes, lazy loading |
| Server state | TanStack Query | 5.x | Cache, revalidación, optimistic updates |
| Client state | Zustand | 4.x | Sesión de voluntario (liviano) |
| Forms | React Hook Form + Zod | 7.x / 3.x | Validación sin re-renders |
| Estilos | Tailwind CSS | 3.x | Responsive utility-first, sin CSS custom |
| HTTP | Axios | 1.x | Interceptors para JWT y errores globales |
| Testing | Vitest + Testing Library | latest | Co-located con Vite |

### Backend
| Capa | Librería / Herramienta | Versión mínima | Por qué |
|------|------------------------|----------------|---------|
| Framework | FastAPI | 0.111.x | Async nativo, OpenAPI automático |
| Lenguaje | Python | 3.12 | Match statements, performance |
| Servidor ASGI | Uvicorn + Gunicorn | latest | Multi-worker + async loop |
| ODM / Driver | Beanie + Motor | 1.26.x / 3.x | ODM async sobre Motor, modelos Pydantic |
| Validación | Pydantic v2 | 2.x | 5-17x más rápido que v1, integrado en FastAPI |
| Auth | python-jose + passlib | latest | JWT HS256, bcrypt |
| CORS | FastAPI middleware | — | Mismo origen en prod (Vercel routes `/api/*`); habilitado para `localhost` en dev |
| Variables de entorno | pydantic-settings | 2.x | `.env` type-safe |
| Testing | Pytest + httpx | latest | Async test client |

### Infraestructura
| Servicio | Uso |
|----------|-----|
| Vercel — Static Build | Hosting del bundle React (`frontend/`) |
| Vercel — Serverless Function (Python) | FastAPI corriendo como función ASGI (`backend/api/index.py`) |
| Vercel Edge Network | CDN, TLS, dominio custom, routing `/api/*` → función / resto → estático |
| MongoDB Atlas | Cluster en la nube (network access abierto — ver §6, no hay IP fija de Vercel) |
| GitHub Actions | CI — test backend/frontend en cada push/PR |
| Vercel Git Integration | CD — build + deploy automático (`vercel.json`) en cada push a `main`, preview por PR |

---

## 3. Frontend — React

### Estructura de directorios

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # Clientes HTTP por dominio
│   │   ├── client.ts           # Instancia Axios con interceptors
│   │   ├── donaciones.ts
│   │   ├── envios.ts
│   │   ├── recepciones.ts
│   │   └── voluntarios.ts
│   │
│   ├── components/             # Componentes reutilizables (sin lógica de negocio)
│   │   ├── ui/                 # Átomos: Button, Badge, Card, Input, Counter
│   │   ├── layout/             # TopBar, BottomNav, PageWrapper
│   │   └── shared/             # CategoryGrid, CargaSummary, EstadoBadge
│   │
│   ├── features/               # Módulos de negocio (colocación por feature)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── useSession.ts   # Zustand store de sesión
│   │   │   └── authSchemas.ts  # Zod schemas
│   │   ├── donaciones/
│   │   │   ├── DonacionesPage.tsx
│   │   │   ├── NuevaDonacionModal.tsx
│   │   │   ├── DonacionCard.tsx
│   │   │   ├── useDonaciones.ts   # TanStack Query hooks
│   │   │   └── donacionSchemas.ts
│   │   ├── envios/
│   │   │   ├── EnviosPage.tsx
│   │   │   ├── NuevoEnvioModal.tsx
│   │   │   ├── CargoSelector.tsx   # Selector de donaciones con preview
│   │   │   ├── useEnvios.ts
│   │   │   └── envioSchemas.ts
│   │   └── recepciones/
│   │       ├── RecepcionesPage.tsx
│   │       ├── NuevaRecepcionModal.tsx
│   │       ├── useRecepciones.ts
│   │       └── recepcionSchemas.ts
│   │
│   ├── hooks/                  # Hooks genéricos
│   │   ├── useNowDateTime.ts   # Fecha/hora actual para forms
│   │   └── useToast.ts
│   │
│   ├── store/                  # Zustand stores globales
│   │   └── sessionStore.ts     # { usuario, setUsuario, clearSession }
│   │
│   ├── types/                  # Tipos TypeScript espejo del schema MongoDB
│   │   ├── donacion.types.ts
│   │   ├── envio.types.ts
│   │   ├── recepcion.types.ts
│   │   └── voluntario.types.ts
│   │
│   ├── utils/
│   │   ├── categorias.ts       # Constante CATEGORIES array
│   │   └── formatters.ts       # Fecha, hora, cajas
│   │
│   ├── App.tsx                 # Router raíz + QueryClientProvider
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Gestión de estado

```
┌─────────────────────────────────────────────────────┐
│  Zustand (sessionStore)                              │
│  { id, nombre, documento, rol }                      │
│  Persiste en localStorage — sobrevive F5             │
└───────────────────────────┬─────────────────────────┘
                            │ se lee en
                            ▼
┌─────────────────────────────────────────────────────┐
│  TanStack Query (server state)                       │
│  useQuery('donaciones', fetchDonaciones)             │
│  useMutation(crearDonacion, { onSuccess: refetch })  │
│  Cache: staleTime 30s · gcTime 5m                    │
└─────────────────────────────────────────────────────┘
```

### Responsive design

- **Mobile-first** con Tailwind: breakpoints `sm:` (640px) `md:` (768px) `lg:` (1024px)
- Layout base: columna única + bottom nav fija (móvil)
- Layout `sm:`: sidebar lateral + grid de 2 columnas en forms
- Modales como bottom-sheets en móvil, centrados en desktop (`sm:items-center`)
- Tamaños de toque mínimo 44×44px en todos los controles interactivos

### Axios — interceptors globales

```typescript
// src/api/client.ts
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL })

client.interceptors.request.use((config) => {
  const { usuario } = sessionStore.getState()
  if (usuario?.token) config.headers.Authorization = `Bearer ${usuario.token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) sessionStore.getState().clearSession()
    return Promise.reject(error)
  }
)
```

---

## 4. Backend — FastAPI

### Estructura de directorios

```
backend/
├── app/
│   ├── main.py                 # FastAPI app factory, CORS, lifespan
│   ├── config.py               # pydantic-settings — ENV vars type-safe
│   │
│   ├── db/
│   │   ├── connection.py       # Motor client + Beanie init
│   │   └── indexes.py          # Creación de índices al arrancar
│   │
│   ├── models/                 # Beanie Documents (ODM — espejo del schema.dbml)
│   │   ├── voluntario.py
│   │   ├── donacion.py
│   │   ├── envio.py
│   │   └── recepcion.py
│   │
│   ├── schemas/                # Pydantic v2 — Request / Response bodies
│   │   ├── voluntario.py       # LoginRequest, VoluntarioResponse
│   │   ├── donacion.py         # CrearDonacionRequest, DonacionResponse
│   │   ├── envio.py
│   │   └── recepcion.py
│   │
│   ├── routers/                # FastAPI APIRouter por dominio
│   │   ├── auth.py             # POST /auth/login
│   │   ├── donaciones.py       # CRUD + cambio de estado
│   │   ├── envios.py
│   │   └── recepciones.py
│   │
│   ├── services/               # Lógica de negocio (sin dependencia de HTTP)
│   │   ├── donacion_service.py
│   │   ├── envio_service.py    # Transacción: insert envío + update donaciones
│   │   └── recepcion_service.py # Transacción: insert recepción + update envío + donaciones
│   │
│   ├── dependencies/
│   │   ├── auth.py             # get_current_user() — verifica JWT
│   │   └── pagination.py       # PaginationParams
│   │
│   └── utils/
│       ├── codigo_generator.py # Genera D-001, E-001, R-001
│       └── datetime_utils.py
│
├── tests/
│   ├── conftest.py             # Motor mock / test DB
│   ├── test_donaciones.py
│   ├── test_envios.py
│   └── test_recepciones.py
│
├── Dockerfile
├── docker-compose.yml          # Dev local: FastAPI + MongoDB local
├── requirements.txt
├── requirements-dev.txt        # pytest, httpx, faker
├── .env.example
└── pyproject.toml
```

### App factory y lifespan

```python
# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.connection import init_db
from app.db.indexes import create_indexes
from app.routers import auth, donaciones, envios, recepciones
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()       # Conecta Motor + inicia Beanie
    await create_indexes() # Crea índices si no existen
    yield
    # shutdown: Motor cierra la conexión automáticamente

app = FastAPI(
    title="Ayuda Logística BOG",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,   # ["https://cdn.ayudalog.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth")
app.include_router(donaciones.router,  prefix="/api/donaciones")
app.include_router(envios.router,      prefix="/api/envios")
app.include_router(recepciones.router, prefix="/api/recepciones")
```

### Modelo Beanie (ejemplo: Donacion)

```python
# app/models/donacion.py
from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field
from app.models.shared import CategoriasKits, EstadoDonacion

class Donacion(Document):
    codigo:              Indexed(str, unique=True)
    acopio:              Indexed(str)
    responsable_id:      PydanticObjectId
    responsable_nombre:  str
    fecha_hora:          Indexed(datetime)
    destino:             Optional[str] = None
    comentarios:         Optional[str] = None
    categorias:          CategoriasKits
    total_cajas:         int = Field(ge=0)
    estado:              Indexed(EstadoDonacion) = EstadoDonacion.pendiente
    created_at:          datetime = Field(default_factory=datetime.utcnow)
    updated_at:          datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "donaciones"
        indexes = [
            [("estado", 1), ("fecha_hora", -1)],   # compuesto principal
            [("acopio", 1), ("estado", 1)],
            [("estado", 1), ("total_cajas", 1)],
        ]
```

### Servicio con transacción (ejemplo: confirmar recepción)

```python
# app/services/recepcion_service.py
async def confirmar_recepcion(
    payload: CrearRecepcionRequest,
    creado_por: Voluntario,
    session: AsyncIOMotorClientSession,
) -> Recepcion:

    async with await motor_client.start_session() as session:
        async with session.start_transaction():

            # 1. Obtener el envío y validar que está en tránsito
            envio = await Envio.get(payload.envio_id, session=session)
            if not envio or envio.estado != EstadoEnvio.en_transito:
                raise HTTPException(400, "Envío no disponible para recepción")

            # 2. Crear la recepción
            recepcion = Recepcion(
                **payload.model_dump(exclude={"envio_id"}),
                envio_id=envio.id,
                envio_codigo=envio.codigo,
                carga_categorias=envio.carga_categorias,
                total_cajas=envio.total_cajas,
                creado_por_id=creado_por.id,
                creado_por_nombre=creado_por.nombre,
            )
            await recepcion.insert(session=session)

            # 3. Actualizar envío → entregado
            await Envio.find_one(
                Envio.id == envio.id, session=session
            ).update({"$set": {"estado": "entregado", "updated_at": datetime.utcnow()}})

            # 4. Actualizar todas las donaciones del envío → entregado
            await Donacion.find(
                {"_id": {"$in": envio.donaciones_ids}}, session=session
            ).update_many(
                {"$set": {"estado": "entregado", "updated_at": datetime.utcnow()}}
            )

    return recepcion
```

### Variables de entorno

```python
# app/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    mongodb_uri:    str                       # mongodb+srv://...@atlas
    mongodb_db:     str = "ayuda_logistica"
    jwt_secret:     str                       # mínimo 32 chars
    jwt_expire_min: int = 480                 # 8 horas por turno
    cors_origins:   list[str] = ["http://localhost:5173"]
    environment:    str = "development"       # development | production

settings = Settings()
```

---

## 5. Base de datos — MongoDB Atlas

### Configuración del cluster

| Parámetro | Valor | Razón |
|-----------|-------|-------|
| Tier | M10 | Primer tier con réplica y backups |
| Región | us-east-1 (N. Virginia) | Misma región que la función serverless de Vercel (`iad1` por defecto) → menor latencia |
| Réplica | 3 nodos (primario + 2 secundarios) | Disponibilidad + failover automático |
| Backup | Continuo (point-in-time) | Recovery a cualquier minuto |
| Encriptación | At-rest (AES-256) + In-transit (TLS 1.2) | Datos sensibles de emergencia |

### Índices (resumen ejecutivo)

```
Colección       Índice                              Tipo        Uso principal
──────────────────────────────────────────────────────────────────────────────
voluntarios     documento                           UNIQUE      Login O(1)
voluntarios     (documento, rol)                    COMPOUND    Covered query auth
donaciones      codigo                              UNIQUE      Lookup por ID legible
donaciones      (estado, fecha_hora DESC)           COMPOUND    Lista por estado + orden
donaciones      (acopio, estado)                    COMPOUND    Dashboard por acopio
envios          codigo                              UNIQUE      —
envios          (estado, fecha_hora DESC)           COMPOUND    Envíos en tránsito
envios          donaciones_ids                      MULTIKEY    ¿En qué envío va D-003?
envios          (ciudad_origen, ciudad_destino)     COMPOUND    Métricas de ruta
recepciones     codigo                              UNIQUE      —
recepciones     envio_id                            UNIQUE      Evita doble recepción
recepciones     fecha_hora                          SINGLE      Reportes por fecha
```

### Validación con $jsonSchema

Cada colección lleva un validator para garantizar integridad a nivel de base de datos, independiente de la capa de aplicación. Ver `schema.dbml` para la especificación completa.

---

## 6. Infraestructura Vercel

Un solo proyecto de Vercel enlazado al repo. `vercel.json` en la raíz define dos builds y el routing entre ellos — frontend y backend quedan bajo el **mismo dominio**, eliminando el problema de CORS que antes resolvía CloudFront como origen único.

### `vercel.json` (raíz del repo)

```json
{
  "version": 2,
  "builds": [
    { "src": "backend/api/index.py", "use": "@vercel/python" },
    { "src": "frontend/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/api/index.py" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```

### Entrypoint serverless (`backend/api/index.py`)

Vercel's Python runtime necesita un archivo con una variable `app` (ASGI). Reexporta la app de FastAPI existente sin duplicar lógica:

```python
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402
```

`requirements.txt` se sigue leyendo desde `backend/requirements.txt` — el builder de Python de Vercel busca el archivo en directorios padre del entrypoint.

### Diagrama de red

```
Internet
    │
    ▼
Vercel Edge Network (dominio *.vercel.app o custom domain)
    ├── Route: /api/*  → Serverless Function (Python — backend/api/index.py)
    │                        └─ FastAPI app (Beanie + Motor)
    │
    └── Route: /*      → Static Build (frontend/dist, generado con `vite build`)
                                                  │
                                                  ▼  TLS / Motor async
                                       MongoDB Atlas
                                       (Network Access: 0.0.0.0/0 —
                                        Vercel no expone IP saliente fija)
```

### Consideraciones al pasar de EC2 a serverless

Estas son las diferencias reales de comportamiento frente al modelo anterior (EC2 + Docker + Nginx), no solo de configuración:

| Tema | Antes (EC2) | Ahora (Vercel) |
|------|-------------|----------------|
| IP saliente hacia Atlas | Fija (IP elástica de EC2) → whitelist específico | Dinámica, sin IP fija → Atlas Network Access debe permitir `0.0.0.0/0` (o usar el add-on de IP fija / integración oficial Atlas-Vercel si el plan lo permite). La seguridad recae en credenciales fuertes + TLS, no en el whitelist de IP |
| Conexión Mongo | Un solo `AsyncIOMotorClient` de vida larga (proceso persistente) | El cliente se crea en el `lifespan` de FastAPI; se reutiliza mientras la instancia serverless siga "caliente", pero cada cold start vuelve a conectar — vigilar latencia y límite de conexiones concurrentes en Atlas |
| Tiempo de ejecución | Sin límite práctico (proceso propio) | Límite de duración por invocación según plan de Vercel (Hobby: más restrictivo; Pro: mayor). Cuidado con endpoints que hagan operaciones largas |
| Workers | Gunicorn con 4 workers fijos | Escalado horizontal automático por invocación — no hay concepto de "workers" a configurar |
| CORS | Necesario porque CloudFront y EC2 podían diverger de dominio | Ya no es crítico: `/api/*` y el resto de rutas comparten el mismo dominio de Vercel |
| Docker/Nginx | Pieza central del deploy | Deja de usarse en producción — `backend/Dockerfile` y `backend/docker-compose.yml` quedan solo para levantar Mongo/backend en local |

---

## 7. Contrato de API

Todos los endpoints bajo `/api/`. OpenAPI disponible en `/api/docs` (Swagger UI).

### Auth

```
POST   /api/auth/login
  Body:    { nombre, documento, rol }
  Returns: { access_token, token_type, voluntario: { id, nombre, rol } }
  Notes:   JWT HS256, expire = 8h (un turno)
```

### Donaciones

```
GET    /api/donaciones
  Query: estado?, acopio?, page=1, limit=20
  Auth:  Bearer token

POST   /api/donaciones
  Body: CrearDonacionRequest
  Auth: Bearer token

GET    /api/donaciones/{id}
  Auth: Bearer token

PATCH  /api/donaciones/{id}/estado
  Body: { estado: "listo" | "pendiente" }
  Auth: Bearer token
  Rule: Solo permite pendiente ↔ listo. en_transito/entregado son solo por sistema.
```

### Envíos

```
GET    /api/envios
  Query: estado?, ciudad_destino?, page=1, limit=20
  Auth:  Bearer token

POST   /api/envios
  Body: CrearEnvioRequest (incluye donaciones_ids[])
  Auth: Bearer token
  Note: Transacción — actualiza estado de donaciones asociadas → en_transito

GET    /api/envios/{id}
  Auth: Bearer token

GET    /api/envios/disponibles-para-recepcion
  Returns: Envíos con estado=en_transito
  Auth:    Bearer token
```

### Recepciones

```
GET    /api/recepciones
  Query: page=1, limit=20
  Auth:  Bearer token

POST   /api/recepciones
  Body: CrearRecepcionRequest (incluye envio_id)
  Auth: Bearer token
  Note: Transacción — actualiza envío + donaciones → entregado

GET    /api/recepciones/{id}
  Auth: Bearer token
```

### Respuestas de error estándar

```json
{
  "detail": "Envío no disponible para recepción",
  "code": "ENVIO_NOT_AVAILABLE",
  "status": 400
}
```

---

## 8. Seguridad

### Autenticación

- JWT HS256 firmado con `JWT_SECRET` (mínimo 32 caracteres, rotación cada 90 días)
- Expiración: 8 horas (duración de un turno voluntario)
- El `voluntario_id` va en el payload del token — nunca el documento de identidad

### Autorización

| Acción | Voluntario | Administrador |
|--------|-----------|---------------|
| Crear donación / envío / recepción | ✓ | ✓ |
| Cambiar estado (pendiente ↔ listo) | ✓ | ✓ |
| Eliminar registros | ✗ | ✓ |
| Ver métricas globales | ✗ | ✓ |
| Gestionar voluntarios | ✗ | ✓ |

Implementar con `Depends(require_role("administrador"))` en FastAPI.

### Hardening

- **CORS**: mismo origen en producción (frontend y API comparten dominio de Vercel vía `vercel.json`); `CORS_ORIGINS` solo relevante para dev local
- **Rate limiting**: `slowapi` en FastAPI — 60 req/min por IP en `/auth/login`
- **MongoDB Atlas**: sin IP fija que whitelistear (Vercel serverless no expone una IP saliente estable) — Network Access debe permitir `0.0.0.0/0`; la seguridad depende de credenciales fuertes, usuario de BD con permisos mínimos y rotación periódica
- **Secrets**: variables de entorno del proyecto en Vercel (Project Settings → Environment Variables, cifradas en reposo) para `JWT_SECRET` y `MONGODB_URI` — nunca en archivos `.env` commiteados
- **Headers HTTP**: agregar `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` vía middleware de FastAPI (ya no hay Nginx en el flujo de producción)

---

## 9. Flujo de datos end-to-end

### Caso: Registrar donación y marcarla lista

```
Voluntario                React                  FastAPI              MongoDB Atlas
    │                       │                       │                       │
    │  Llena formulario      │                       │                       │
    │──────────────────────▶│                       │                       │
    │                       │  POST /api/donaciones  │                       │
    │                       │  { acopio, categorias  │                       │
    │                       │    total_cajas, estado }│                      │
    │                       │───────────────────────▶│                       │
    │                       │                       │ Valida Pydantic        │
    │                       │                       │ Genera D-00N           │
    │                       │                       │ Insert donacion ──────▶│
    │                       │                       │                       │ Escribe
    │                       │                       │◀──────────────────────│
    │                       │  201 DonacionResponse  │                       │
    │                       │◀───────────────────────│                       │
    │  Invalidate query cache│                       │                       │
    │  TanStack refetch list │                       │                       │
    │◀───────────────────────│                       │                       │
    │                       │                       │                       │
    │  Click "Listo"         │                       │                       │
    │──────────────────────▶│                       │                       │
    │                       │ PATCH /donaciones/{id}/estado                  │
    │                       │───────────────────────▶│                       │
    │                       │                       │ Valida estado máquina  │
    │                       │                       │ UpdateOne ────────────▶│
    │                       │◀───────────────────────│                       │
```

### Caso: Confirmar recepción (transacción multi-doc)

```
FastAPI recibe POST /api/recepciones
    │
    ├─ Inicia session.start_transaction()
    │
    ├─ 1. Find Envio → valida estado = "en_transito"
    ├─ 2. Insert Recepcion
    ├─ 3. UpdateOne Envio → estado: "entregado"
    ├─ 4. UpdateMany Donaciones (donaciones_ids[]) → estado: "entregado"
    │
    ├─ commit_transaction()   ← Si falla cualquier step → rollback automático
    │
    └─ Return RecepcionResponse (201)
```

---

## 10. Configuración de entornos

### Variables de entorno backend

En local, `backend/.env` (gitignored — ver `.env.example` como plantilla). En Vercel, las mismas claves se configuran en **Project Settings → Environment Variables** (no se commitea ningún `.env`):

```bash
# .env.example — NO commitear .env con valores reales
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/
MONGODB_DB=ayuda_logistica
JWT_SECRET=cambia_esto_por_32_chars_minimo_en_prod
JWT_EXPIRE_MIN=480
CORS_ORIGINS=["http://localhost:5173"]
ENVIRONMENT=development
```

En producción `ENVIRONMENT=production` y `CORS_ORIGINS` puede dejarse vacío o restringido, ya que `/api/*` y el frontend comparten dominio.

### Variables de entorno frontend

Como `/api/*` se enruta al mismo dominio (ver `vercel.json`), `VITE_API_URL` en producción es una ruta relativa, no un dominio distinto:

```bash
# .env.local
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Ayuda Logística BOG

# Producción (configurado en Vercel, o relativo si no se define)
VITE_API_URL=/api
```

### Docker Compose (desarrollo local)

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/
      - MONGODB_DB=ayuda_logistica_dev
      - JWT_SECRET=dev_secret_min_32_chars_xxxxxxxx
      - ENVIRONMENT=development
    depends_on:
      - mongo
    volumes:
      - ./app:/app/app   # hot reload en dev

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 11. Pipeline CI/CD

CI (tests) y CD (deploy) quedan separados: GitHub Actions solo valida; Vercel despliega automáticamente al detectar push vía su integración de Git (no requiere un job de deploy manual).

```
Push a main / PR abierto
        │
        ├──────────────────────────────┐
        ▼                              ▼
┌───────────────────────────┐  ┌─────────────────────────────────────┐
│ GitHub Actions — CI       │  │ Vercel Git Integration               │
│ .github/workflows/ci.yml  │  │                                       │
│                           │  │  PR abierto → Preview Deployment       │
│ JOB 1: test-backend       │  │    build backend/api (Python)          │
│  ├─ python 3.12            │  │    build frontend (vite build)         │
│  ├─ pip install -r         │  │    URL única para revisar el cambio    │
│  │   requirements-dev.txt  │  │                                       │
│  ├─ pytest --cov=app tests/│  │  Merge a main → Production Deployment  │
│  └─ Upload coverage report │  │    mismo build, publicado en el        │
│                           │  │    dominio de producción               │
│ JOB 2: test-frontend       │  │                                       │
│  ├─ node 20                │  │  Variables de entorno tomadas de       │
│  ├─ npm ci                 │  │  Project Settings (no del repo)        │
│  └─ npm run test           │  │                                       │
└───────────────────────────┘  └─────────────────────────────────────┘
```

El merge a `main` solo debería ocurrir si CI está en verde — Vercel no bloquea el deploy si CI falla salvo que se configure explícitamente como *required check* en la protección de la rama.

---

## 12. Decisiones de diseño (ADR)

### ADR-001 — FastAPI sobre Django/Flask
**Decisión:** FastAPI  
**Razón:** Motor (async MongoDB driver) requiere contexto async nativo. FastAPI + Uvicorn es async de punta a punta; Flask/Django agregarían complejidad de threading innecesaria. OpenAPI automático reduce documentación manual.

### ADR-002 — Beanie ODM sobre PyMongo directo
**Decisión:** Beanie sobre Motor  
**Razón:** Los modelos Beanie son Pydantic Documents — el mismo modelo se usa como ODM y como schema de validación. Reduce código boilerplate de serialización/deserialización. Motor directo queda disponible para queries complejas con `aggregate()`.

### ADR-003 — Embedding de `categorias_kits`
**Decisión:** Sub-documento embebido en cada colección  
**Razón:** Las categorías nunca se consultan de forma independiente. Embedding evita `$lookup` costosos en listados. El tamaño del sub-documento es fijo (8 campos int) — no hay riesgo de unbounded arrays.

### ADR-004 — Snapshot de datos desnormalizados
**Decisión:** `responsable_nombre`, `carga_categorias`, `total_cajas` se persisten como snapshot  
**Razón:** En un sistema de emergencia, la inmutabilidad del historial es crítica. Si un voluntario cambia su nombre, los registros históricos deben conservar el nombre original. Prioridad: auditoría > consistencia eventual.

### ADR-005 (revisado) — Vercel sobre AWS S3 + CloudFront + EC2
**Decisión:** Vercel (frontend estático + backend FastAPI como función serverless Python), reemplaza la decisión original de AWS.  
**Razón:** Prioridad de velocidad de entrega sobre control de infraestructura — proyecto de ayuda humanitaria con ventana de tiempo corta. Un solo `vercel.json` define build y routing de ambas piezas bajo el mismo dominio, logrando el mismo objetivo que perseguía la decisión original (mismo origen → sin CORS) sin operar EC2/Nginx/ECR a mano.  
**Trade-offs aceptados:** sin IP saliente fija hacia MongoDB Atlas (Network Access debe abrirse a `0.0.0.0/0`), cold starts en la función Python, límite de duración por invocación según el plan de Vercel, y menor control sobre headers/caché comparado con Nginx + CloudFront manual. Ver detalle en [§6](#6-infraestructura-vercel).

### ADR-006 — TanStack Query sobre Redux/Context
**Decisión:** TanStack Query para server state, Zustand solo para sesión  
**Razón:** El 95% del estado de la app es server state (listas, formularios). Redux introduce boilerplate innecesario. TanStack Query maneja caché, revalidación, optimistic updates y estados de loading/error de forma declarativa.

---

*Documento mantenido por el equipo de desarrollo. Actualizar ante cambios de infraestructura o decisiones de arquitectura.*
