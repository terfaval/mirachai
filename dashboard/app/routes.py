from __future__ import annotations

from pathlib import Path
from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
from jinja2 import Environment, FileSystemLoader, select_autoescape

from .services import (
    filter_teas,
    get_category_colors,
    get_config,
    get_teas,
)

BASE = Path(__file__).resolve().parent
router = APIRouter()

env = Environment(
    loader=FileSystemLoader(str(BASE / "templates")),
    autoescape=select_autoescape(["html", "xml"]),
)


@router.get("/", response_class=HTMLResponse)
async def index(request: Request, lang: str | None = "hu"):
    template = env.get_template("index.html")
    return template.render(
        request=request,
        config=get_config(),
        lang=lang,
        category_colors=get_category_colors(),
    )


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