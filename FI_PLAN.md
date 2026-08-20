# FI_PLAN.md — Plan de Ajustes: el conteo de inventario se mueve de "Donación" a "Envío"

> **Origen del cambio:** mensaje de Natalia Castro Montaña (Imagineapps), 2026-08-15.
> **Tipo de cambio:** corrección de flujo de negocio — no es una funcionalidad nueva, es una
> reubicación del punto donde ocurre el conteo por categorías.
> **Documentos afectados que quedan desactualizados por este plan:** `hus.md` (HU-02, HU-03),
> `ARCHITECTURE.md` (§3, §4, §7, §9), `schema.dbml` (colección `donaciones`).

---

## 0. Contexto — por qué cambia el flujo

Cita textual (resumida) de Natalia:

> "No se hace inventario de las donaciones cuando llegan sino cuando se van a ir. Es imposible
> tener caja 001, 002, etc. porque son montañas — seleccionar cajas es imposible. [...] Cuando ya
> están las cajas listas y acumuladas se haría el registro por camión. Llega camión con 5
> toneladas, se empieza a hacer conteo de # de cajas por categoría **en ese camión** — literal lo
> que está. No es necesario marcar 'listo para enviar' porque por defecto si está ahí es porque
> está listo. Sería solo una marca por camión de que quedó check para el despacho. [...] No cambia
> el proceso sino el momento de hacerlo."

Lo que esto invalida del diseño actual (`hus.md` HU-02/HU-03, y el código ya implementado):

- No existen "donaciones" individuales con código propio (`D-001`, `D-002`...) que luego se
  seleccionan una a una para armar un envío. Las donaciones llegan como acumulado físico sin
  trazabilidad unitaria.
- No existe un estado intermedio `pendiente → listo` a nivel de donación. El toggle "Marcar como
  Listo para enviar" (`NuevaDonacionModal.tsx:100-106`, `DonacionesPage.tsx:14-17`) no aplica.
- El conteo por categorías **para efectos de inventario/despacho** se dispara en el momento de
  cargar un camión, dentro del flujo de **Envío** (ver §2.2 y §5) — no al recibir.
- **Aclaración posterior (misma fecha):** esto no significa que el módulo Donaciones desaparezca.
  Sí se necesita seguir dejando un registro de que "algo entró" — quién donó, quién lo recibió y
  qué se entregó — pero como **bitácora simple**, sin estado ni relación con el inventario de
  Envíos. La especificación completa de este módulo rediseñado está en el **Anexo A**.

---

## 1. Modelo mental: antes vs. ahora

| | Antes (implementado hoy) | Ahora (corregido) |
|---|---|---|
| Momento del conteo | Al recibir la donación en el acopio | Al cargar el camión para despacho |
| Unidad de registro | 1 donación = 1 documento con código `D-00N` | 1 camión = 1 documento de envío con su conteo |
| Selección de carga | Checkbox para elegir qué `D-00N` van en el envío | No hay selección — se cuenta lo que físicamente se sube a ese camión |
| Estado "listo" | Campo `estado` en `Donacion` (`pendiente`/`listo`) | No existe; si el conteo está en el envío, ya está listo |
| Confirmación de despacho | Implícita al crear el envío con donaciones `listo` | Un solo "check" por camión al momento de crear el envío |
| Módulo Donaciones (página, colección, endpoints) | CRUD con estado `pendiente/listo`, usado para alimentar el inventario de Envíos | Se **rediseña** como bitácora simple (donante → receptor → set entregado + notas), sin estado y sin relación con Envíos — ver Anexo A |

**No cambia:** el formulario de transporte (tipo, capacidad, responsable, ruta) ni el módulo de
Recepciones en su función de cerrar el ciclo — solo se le quita la dependencia de `donaciones_ids`.

---

## 2. Impacto en el modelo de datos

### 2.1 Colección `donaciones` — se redefine como bitácora (sin inventario)

- Deja de ser el lugar donde se cuenta inventario para armar envíos. `Donacion` (modelo),
  `donacion_service.py`, `routers/donaciones.py`, `schemas/donacion.py` se **reescriben** con un
  propósito distinto: dejar constancia de que un donante entregó algo a un receptor del acopio,
  con el set de categorías recibido y notas libres. Ver especificación completa en **Anexo A**.
- `EstadoDonacion` (enum `pendiente/listo/en_transito/entregado`) se elimina — la nueva
  `Donacion` no tiene máquina de estados, es un registro inmutable (igual que `Recepcion`).
- Esta colección **no se referencia desde `Envio`** — no hay `donaciones_ids`, no hay agregación.
  Envíos hace su propio conteo independiente al momento del despacho (§2.2).

### 2.2 Colección `envios` — absorbe el conteo por categoría

Cambios sobre `backend/app/models/envio.py`:

- **Eliminar** `donaciones_ids: list[PydanticObjectId]` — ya no hay documentos de donación que
  referenciar.
- `carga_categorias: CategoriasKits` y `total_cajas: int` **se mantienen**, pero cambian de
  origen: hoy se calculan agregando las donaciones seleccionadas
  (`envio_service.py:52-56`); ahora se reciben **directamente del formulario** como el conteo que
  el voluntario hace parado frente al camión.
- Opcional: agregar `verificado: bool = True` (el "check" de despacho). Ver §7 — probablemente no
  se necesita un campo aparte, porque el acto de guardar el formulario de envío ya *es* el check.

### 2.3 Colección `recepciones` — sin cambios de forma, se le quita una dependencia

`recepcion_service.confirmar_recepcion` (líneas 89-95) hoy hace, dentro de la transacción:

```python
# Donaciones del envío → entregado
if envio.donaciones_ids:
    await Donacion.find({"_id": {"$in": envio.donaciones_ids}}, session=session)\
        .update_many({"$set": {"estado": EstadoDonacion.entregado, "updated_at": now}})
```

Este bloque se elimina. La recepción sigue actualizando únicamente `Envio.estado → entregado`.
El snapshot `carga_categorias`/`total_cajas` que ya copia del envío (líneas 68-69) sigue igual —
sigue siendo la fuente de verdad de "qué llegó".

---

## 3. Backend — cambios archivo por archivo

| Archivo | Acción |
|---|---|
| `app/models/donacion.py` | **Reescribir** — nuevo modelo bitácora, ver Anexo A §A.1 |
| `app/schemas/donacion.py` | **Reescribir** — `CrearDonacionRequest`/`DonacionResponse` nuevos, ver Anexo A §A.1 |
| `app/services/donacion_service.py` | **Reescribir** — sin cambios de estado, sin transacciones, ver Anexo A §A.2 |
| `app/routers/donaciones.py` | **Reescribir** — solo `GET`/`POST`/`GET {id}`, se quita `PATCH /estado`; se mantiene el `include_router` en `main.py` |
| `app/models/shared.py` | Quitar `EstadoDonacion` |
| `app/models/envio.py` | Quitar `donaciones_ids`; `carga_categorias`/`total_cajas` pasan a ser campos de entrada directa (ya existen, solo cambia quién los llena) |
| `app/schemas/envio.py` | `CrearEnvioRequest`: quitar `donaciones_ids: list[str]`, agregar `categorias: CategoriasKits` (se renombra/mapea a `carga_categorias` al guardar, igual que hace hoy `Donacion`) |
| `app/services/envio_service.py` | `crear_envio`: eliminar el bloque de validación/agregación de donaciones (líneas 39-56) y el `update_many` que las pasaba a `en_transito` (líneas 80-84). `total_cajas = body.categorias.total()` directo |
| `app/services/recepcion_service.py` | Eliminar el bloque de actualización de `Donacion` (líneas 89-95) y el import de `Donacion`/`EstadoDonacion` |
| `app/db/indexes.py` (si existe lógica de índices por colección) | Quitar índices de `donaciones_ids` en `envios`; quitar índices de la colección `donaciones` |

---

## 4. Frontend — cambios archivo por archivo

| Archivo | Acción |
|---|---|
| `features/donaciones/NuevaDonacionModal.tsx` | **Reescribir** — formulario simplificado (donante, receptor, set, notas), ver Anexo A §A.3 |
| `features/donaciones/DonacionesPage.tsx` | **Reescribir** — lista tipo bitácora sin badges de estado ni botón de cambio de estado, ver Anexo A §A.3 |
| `features/donaciones/useDonaciones.ts` | **Reescribir** — quitar `useCambiarEstado`; mantener `useDonaciones()`/`useCrearDonacion()` |
| `features/envios/NuevoEnvioModal.tsx` | Quitar la sección "Asociar carga" (líneas 123-158, el `useDonaciones({estado:'listo'})` y el checklist de selección). En su lugar, insertar el `CategoryGrid` para que el voluntario cuente cajas por categoría directamente en el formulario de envío. El resumen (`CatPills` + total) se calcula sobre lo digitado, no sobre donaciones seleccionadas |
| `features/envios/useEnvios.ts` | Actualizar el payload de `useCrearEnvio` para enviar `categorias` en vez de `donaciones_ids` |
| `App.tsx` | Se mantiene `<Route path="/donaciones">` apuntando a la página rediseñada |
| `components/layout/BottomNav.tsx` | Se mantiene el ítem `Donaciones` (sin cambios) |
| `types/donacion.types.ts` | **Reescribir** el tipo `Donacion` con los campos nuevos, ver Anexo A §A.3 |
| `api/donaciones.ts` (cliente Axios) | **Reescribir** — quitar `cambiarEstado`, mantener `listar`/`crear`/`obtener` |

No hace falta tocar `Recepciones` en frontend — su formulario y página no referencian donaciones.

---

## 5. Flujo end-to-end actualizado

```
Camión llega al punto de acopio (5 toneladas)
        │
        ▼
Voluntario abre "Nuevo Envío"
        │
        ├─ Datos de transporte (tipo, capacidad, empresa, placa)
        ├─ Responsable y contacto
        ├─ Ruta y fecha/hora de despacho
        └─ Conteo por categoría — lo que literalmente se sube a ESE camión
               (mismo CategoryGrid que antes vivía en "Nueva Donación")
        │
        ▼
Guardar envío = el "check" de despacho
  (no hay paso previo de "listo para enviar"; si se contó, está listo)
        │
        ▼
Envío queda en estado "en_transito" con su carga_categorias/total_cajas
        │
        ▼
Camión llega a destino → Recepción confirma llegada
  (ya no hay donaciones que actualizar en cascada — solo Envío → "entregado")
```

---

## 6. Documentación a actualizar (fuera de este plan, como siguiente paso)

- `hus.md`: reescribir HU-02 (bitácora de donación — donante/receptor/set/notas, sin "listo") y
  quitar HU-03 (ya no existe el estado "listo"); el conteo de despacho pasa a ser criterio de
  aceptación de HU-04 (Registrar Envío).
- `ARCHITECTURE.md`: actualizar la nota de la colección `donaciones` en el diagrama (§1) para
  reflejar que es bitácora sin estado; actualizar el contrato de API (§7) quitando
  `PATCH /donaciones/{id}/estado`; corregir el diagrama de flujo (§9) para que el conteo de
  inventario aparezca en el paso de envío y no en el de donación.
- `schema.dbml`: reescribir la tabla `donaciones` con los campos del Anexo A; quitar
  `estado_donacion` de los enums; en `envios` quitar `donaciones_ids` y documentar que
  `carga_categorias`/`total_cajas` son entrada directa, no agregación.

---

## 7. Preguntas abiertas para confirmar con Natalia antes de implementar

1. ~~¿Se elimina por completo el registro de "llegada" de donaciones, o se necesita algo mínimo?~~
   **Resuelto (2026-08-15):** sí se necesita — bitácora simple de donante, receptor, set
   entregado y notas, sin estado y sin relación con Envíos. Ver Anexo A.
2. **El "check por camión"** (en Envíos) — ¿es simplemente el botón "Registrar envío" (no se
   necesita campo nuevo), o necesitan un paso intermedio donde el conteo se guarda como borrador
   mientras se va cargando el camión y luego alguien más lo "confirma" antes del despacho? Esto
   determina si agregamos `verificado: bool` a `Envio` o no. *(Sigue abierta.)*
3. **¿Quién hace el conteo en el envío?** ¿El mismo rol de "acopio" que registra donaciones, o
   pasa a ser responsabilidad del voluntario de logística que arma el envío? Afecta si mantenemos
   un solo rol `voluntario` o si conviene diferenciar permisos. *(Sigue abierta.)*
4. **Datos ya cargados**: si en el ambiente actual (dev/staging) ya hay documentos en
   `donaciones` con el esquema viejo (`estado`, `acopio`, `responsable_id`) o en `envios` con
   `donaciones_ids`, ¿se pueden borrar/migrar sin conservar histórico? *(Sigue abierta.)*
5. **Campo `acopio`** (centro de acopio): el pedido explícito para la bitácora nueva es "solo"
   fecha/hora, donante, receptor, set entregado y notas — por eso el Anexo A **no incluye**
   `acopio` como campo. Si en la práctica manejan más de un centro de acopio y necesitan saber en
   cuál se recibió cada donación, avisar para agregarlo como campo opcional adicional.

---

## 8. Orden sugerido de implementación

1. Backend: reescribir el módulo `donaciones` completo (modelo, schema, service, router) según el
   Anexo A — bitácora sin estado.
2. Backend: ajustar `envio.py` (modelo/schema/service) para conteo directo; quitar dependencia de
   `Donacion` en `recepcion_service.py` (§2.3).
3. Frontend: reescribir `features/donaciones/*` (modal, página, hook, tipos, cliente API) según
   el Anexo A.
4. Frontend: mover `CategoryGrid` a `NuevoEnvioModal`, quitar selector de donaciones, actualizar
   `useEnvios`.
5. Documentación: actualizar `hus.md`, `ARCHITECTURE.md`, `schema.dbml` conforme a §6.
6. Verificar manualmente ambos flujos: (a) registrar donación en la bitácora, (b) crear envío con
   conteo propio → confirmar recepción → estado final `entregado`.

---

## Anexo A — Especificación del módulo Donaciones (bitácora, sin inventario)

Debe **funcionar igual que los demás módulos** (Envíos, Recepciones): misma estructura de
carpetas/archivos, mismo patrón de lista + modal de creación, mismo estilo de tarjetas, mismo
generador de código legible (`D-001`, `D-002`...). La diferencia es que **no tiene estado** — es
un registro que se crea y no cambia (igual que `Recepcion`).

Campos del formulario, tal como se pidieron:

| Campo | Origen | Detalle |
|---|---|---|
| Fecha y hora | **Automático**, editable | Se autocompleta con la fecha/hora actual al abrir el modal (mismo patrón `nowDate()`/`nowTime()` que ya usan `NuevaDonacionModal`/`NuevoEnvioModal`), pero el usuario puede corregirla si el registro se hace después del hecho |
| Persona que dona | Manual | Nombre de quien entrega la donación (no es un usuario del sistema — es un dato de texto libre) |
| Persona que recibe | Manual | Nombre de quien recibe la donación en el punto de acopio. Se puede pre-rellenar con el nombre del voluntario logueado como sugerencia, pero debe quedar editable porque puede recibirla otra persona |
| Set de lo entregado | Manual (contadores) | Mismo set de categorías ya existente (`CategoriasKits`: aseo, alimentos, mascotas, medicamentos, insumos, rescate, refugio, ropa), con el mismo componente `CategoryGrid` que ya está construido |
| Notas | Manual, libre | Textarea libre para observaciones (ej. "trajo también cobijas sueltas sin empacar") |

No lleva: estado (`pendiente/listo`), selector de destino, ni relación con `envios` —lo entregado
aquí es solo un registro histórico; el conteo que realmente arma el camión se vuelve a hacer
independientemente en el módulo de Envíos (§2.2).

### A.1 Backend — modelo y schema

```python
# app/models/donacion.py
from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from app.models.shared import CategoriasKits


class Donacion(Document):
    codigo:             Indexed(str, unique=True)   # D-001, autogenerado (next_codigo("D"))
    fecha_hora:         datetime                      # autocompletada en el form, editable
    donante_nombre:     str
    receptor_nombre:    str
    categorias:         CategoriasKits                # el "set" entregado
    total_cajas:        int = Field(default=0, ge=0)  # = categorias.total()
    comentarios:        Optional[str] = None          # notas libres
    creado_por_id:      PydanticObjectId               # snapshot del voluntario logueado (auditoría)
    creado_por_nombre:  str
    created_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "donaciones"
        indexes = [
            [("fecha_hora", -1)],
            [("donante_nombre", 1)],
        ]
```

```python
# app/schemas/donacion.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.shared import CategoriasKits


class CrearDonacionRequest(BaseModel):
    fecha_hora:      datetime
    donante_nombre:  str = Field(min_length=2)
    receptor_nombre: str = Field(min_length=2)
    categorias:      CategoriasKits
    comentarios:     Optional[str] = None


class DonacionResponse(BaseModel):
    id:                str
    codigo:            str
    fecha_hora:        datetime
    donante_nombre:    str
    receptor_nombre:   str
    categorias:        CategoriasKits
    total_cajas:       int
    comentarios:       Optional[str]
    creado_por_id:     str
    creado_por_nombre: str
    created_at:        datetime
    updated_at:        datetime
```

### A.2 Backend — service y router

```python
# app/services/donacion_service.py (equivalente a recepcion_service.py: sin máquina de estados)
async def crear_donacion(body: CrearDonacionRequest, usuario: Voluntario) -> DonacionResponse:
    codigo = await next_codigo("D")
    donacion = Donacion(
        codigo=codigo,
        fecha_hora=body.fecha_hora,
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

async def listar_donaciones(skip: int, limit: int, donante: str | None = None) -> list[DonacionResponse]:
    query = {"donante_nombre": {"$regex": donante, "$options": "i"}} if donante else {}
    docs = await Donacion.find(query).sort(-Donacion.fecha_hora).skip(skip).limit(limit).to_list()
    return [_to_response(d) for d in docs]

async def obtener_donacion(donacion_id: str) -> DonacionResponse: ...
```

```
# app/routers/donaciones.py — contrato de API final
GET  /api/donaciones          Query: donante?, page=1, limit=20   Auth: Bearer
POST /api/donaciones          Body: CrearDonacionRequest           Auth: Bearer
GET  /api/donaciones/{id}                                          Auth: Bearer
```

Sin `PATCH /donaciones/{id}/estado` — se elimina del router.

### A.3 Frontend

```typescript
// types/donacion.types.ts
export interface Donacion {
  id: string
  codigo: string
  fecha_hora: string
  donante_nombre: string
  receptor_nombre: string
  categorias: CategoriasKits
  total_cajas: number
  comentarios?: string
  creado_por_nombre: string
  created_at: string
}

export interface CrearDonacionPayload {
  fecha_hora: string
  donante_nombre: string
  receptor_nombre: string
  categorias: CategoriasKits
  comentarios?: string
}
```

`NuevaDonacionModal.tsx` — mismo patrón de `react-hook-form` + `zod` que ya existe, cambiando los
campos:

```typescript
const schema = z.object({
  fecha_hora:      z.string().min(1, 'Requerido'),   // input date, prellenado con nowDate()
  hora:            z.string().optional(),            // input time, prellenado con nowTime()
  donante_nombre:  z.string().min(2, 'Requerido'),
  receptor_nombre: z.string().min(2, 'Requerido'),
  categorias:      z.any(),                          // CategoryGrid, igual que hoy
  comentarios:     z.string().optional(),            // textarea libre
})
```

Secciones del modal (mismo estilo visual de tarjetas grises que ya usan los otros modales):

1. **Fecha y hora** — dos inputs (`date` + `time`) prellenados automáticamente.
2. **Donante y receptor** — dos inputs de texto: "Nombre de quien dona" y "Nombre de quien
   recibe" (este último puede sugerir `session.nombre` como `defaultValue`, editable).
3. **Set entregado** — reutiliza `<CategoryGrid>` tal cual está hoy.
4. **Notas** — un `<textarea>` libre, igual al que ya existe para comentarios.

`DonacionesPage.tsx` — lista de tarjetas sin badge de estado ni botón de acción, mostrando:
código, fecha/hora, `donante_nombre → receptor_nombre`, `CatPills` del set, comentarios (si hay).

`useDonaciones.ts` — se simplifica a solo `useDonaciones(filtros?)` y `useCrearDonacion()`; se
elimina `useCambiarEstado`.
