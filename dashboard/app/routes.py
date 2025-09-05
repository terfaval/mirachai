from __future__ import annotations

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from .services import filter_teas, get_teas

router = APIRouter()

@router.get("/api/teas")
async def api_teas(
    q: str | None = None,
    category: str | None = None,
    subcategory: str | None = None,
    mood: str | None = None,
    caffeine: str | None = None,
    season: list[str] | None = Query(default=None),
    serve: list[str] | None = Query(default=None),
    page: int = 1,
    per_page: int = 24,
):
    teas = get_teas()
    filtered = filter_teas(
        teas,
        q=q,
        category=category,
        subcategory=subcategory,
        mood=mood,
        caffeine=caffeine,
        season=season,
        serve=serve,
    )
    total = len(filtered)
    start = max(0, (page - 1) * per_page)
    end = start + per_page
    out = [t.model_dump() for t in filtered[start:end]]
    resp = JSONResponse(out)
    resp.headers["X-Total-Count"] = str(total)
    return resp