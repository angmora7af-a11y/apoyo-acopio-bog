from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from beanie import PydanticObjectId

from app.config import settings
from app.models.voluntario import Voluntario
from app.models.shared import RolUsuario

bearer = HTTPBearer()

ALGORITHM = "HS256"


def create_access_token(data: dict) -> str:
    from datetime import datetime, timezone, timedelta
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_min)
    return jwt.encode({**data, "exp": expire}, settings.jwt_secret, algorithm=ALGORITHM)


async def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
) -> Voluntario:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(creds.credentials, settings.jwt_secret, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise exc
    except JWTError:
        raise exc

    user = await Voluntario.get(PydanticObjectId(user_id))
    if not user:
        raise exc
    return user


def require_role(role: RolUsuario):
    async def _check(user: Voluntario = Depends(get_current_user)):
        if user.rol != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos")
        return user
    return _check
