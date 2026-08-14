from pydantic import BaseModel, Field
from fastapi import Query


class PaginationParams(BaseModel):
    page:  int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.limit


async def get_pagination(
    page:  int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> PaginationParams:
    return PaginationParams(page=page, limit=limit)
