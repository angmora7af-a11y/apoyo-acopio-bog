#!/usr/bin/env bash
# ============================================================
#  stop.sh — Detiene backend FastAPI y frontend React
#  Uso: ./stop.sh
# ============================================================

ROOT="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[stop]${NC} $*"; }
ok()   { echo -e "${GREEN}[  ok ]${NC} $*"; }
warn() { echo -e "${YELLOW}[ warn]${NC} $*"; }

KILLED=0

# ── Detener uvicorn / FastAPI ─────────────────────────────────
PIDS=$(pgrep -f "uvicorn app.main:app" 2>/dev/null || true)
if [[ -n "$PIDS" ]]; then
  kill $PIDS 2>/dev/null && ok "FastAPI detenido (PIDs: $PIDS)"
  KILLED=$((KILLED + 1))
else
  warn "FastAPI no estaba corriendo"
fi

# ── Detener Vite / frontend React ────────────────────────────
PIDS=$(pgrep -f "vite" 2>/dev/null || true)
if [[ -n "$PIDS" ]]; then
  kill $PIDS 2>/dev/null && ok "Frontend (Vite) detenido (PIDs: $PIDS)"
  KILLED=$((KILLED + 1))
else
  warn "Frontend no estaba corriendo"
fi

# ── Liberar puertos residuales ───────────────────────────────
for PORT in 8000 5173; do
  PID=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [[ -n "$PID" ]]; then
    kill -9 $PID 2>/dev/null
    warn "Puerto $PORT liberado forzosamente (PID $PID)"
  fi
done

echo ""
if [[ $KILLED -gt 0 ]]; then
  echo -e "${GREEN}Todo detenido.${NC}"
else
  echo -e "${YELLOW}No había procesos activos.${NC}"
fi
