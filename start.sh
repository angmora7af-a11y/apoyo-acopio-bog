#!/usr/bin/env bash
# ============================================================
#  start.sh — Inicia backend FastAPI + frontend React en local
#  Requiere: MongoDB Atlas URI configurada en backend/.env
#  Uso: ./start.sh
# ============================================================

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[start]${NC} $*"; }
ok()   { echo -e "${GREEN}[  ok ]${NC} $*"; }
warn() { echo -e "${YELLOW}[ warn]${NC} $*"; }
err()  { echo -e "${RED}[error]${NC} $*"; exit 1; }

log "=== Ayuda Logística BOG — arranque local ==="

# 1. Verificar Python 3.12+
PYTHON=""
for p in python3.12 python3 python; do
  if command -v "$p" &>/dev/null; then
    VER=$("$p" -c 'import sys; print(sys.version_info >= (3,12))' 2>/dev/null)
    [[ "$VER" == "True" ]] && PYTHON="$p" && break
  fi
done
[[ -z "$PYTHON" ]] && err "Python 3.12+ no encontrado. Instálalo con: brew install python@3.12"
ok "Python: $($PYTHON --version)"

# 2. Verificar Node
command -v node &>/dev/null || err "Node.js no encontrado. Instálalo con: brew install node"
ok "Node: $(node --version)"

# 3. Verificar que .env tiene URI de Atlas
ENV_FILE="$BACKEND/.env"
[[ -f "$ENV_FILE" ]] || err "No existe $ENV_FILE — crea el archivo con MONGODB_URI=mongodb+srv://..."
grep -q "MONGODB_URI" "$ENV_FILE" || err "MONGODB_URI no encontrada en .env"
URI=$(grep "^MONGODB_URI=" "$ENV_FILE" | cut -d= -f2-)
[[ -z "$URI" ]] && err "MONGODB_URI está vacía en .env"
ok "MongoDB URI: ${URI:0:40}..."

# 4. Virtualenv + dependencias backend
log "Preparando entorno Python..."
if [[ ! -f "$BACKEND/.venv/bin/activate" ]]; then
  $PYTHON -m venv "$BACKEND/.venv"
fi
source "$BACKEND/.venv/bin/activate"
pip install -q -r "$BACKEND/requirements.txt"
ok "Dependencias backend instaladas"

# 5. Dependencias frontend
log "Preparando dependencias frontend..."
if [[ ! -d "$FRONTEND/node_modules" ]]; then
  cd "$FRONTEND" && npm install --silent
fi
ok "Dependencias frontend instaladas"

# 6. Liberar puertos anteriores
for PORT in 8000 5173; do
  PID=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  [[ -n "$PID" ]] && kill -9 $PID 2>/dev/null && warn "Puerto $PORT liberado"
done

# 7. Arrancar backend
log "Iniciando FastAPI en http://localhost:8000 ..."
cd "$BACKEND"
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
ok "Backend PID=$BACKEND_PID"

# Esperar a que FastAPI levante (máx 20s)
for i in {1..20}; do
  sleep 1
  if curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
    ok "FastAPI respondiendo en http://localhost:8000/api/health"
    break
  fi
  [[ $i -eq 20 ]] && err "FastAPI no levantó en 20s. Revisa los logs arriba."
done

# 8. Arrancar frontend
log "Iniciando React en http://localhost:5173 ..."
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!
ok "Frontend PID=$FRONTEND_PID"

sleep 2

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Ayuda Logística BOG — CORRIENDO             ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Frontend:  http://localhost:5173             ║${NC}"
echo -e "${GREEN}║  Backend:   http://localhost:8000/api/docs    ║${NC}"
echo -e "${GREEN}║  Health:    http://localhost:8000/api/health  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  Para detener todo: ./stop.sh  (o Ctrl+C)"

trap 'echo ""; log "Deteniendo..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM
wait
