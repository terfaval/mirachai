from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
import json, unicodedata

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data" / "teas.json"
CONF = BASE / "config" / "dashboard_mapping.json"

def load_json(p: Path):
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)

def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")

def norm(s: str) -> str:
    return strip_accents(s).lower()

teas = load_json(DATA)
config = load_json(CONF)

env = Environment(
    loader=FileSystemLoader(str(BASE / "app" / "templates")),
    autoescape=select_autoescape(["html", "xml"]),
)
app = FastAPI(title="Mirachai Dashboard")
app.mount("/static", StaticFiles(directory=str(BASE / "app" / "static")), name="static")

def matches_query(item, q):
    if not q:
        return True
    qn = norm(q)
    fields = []
    for k in ("name","description","category","subcategory","taste","color"):
        v = item.get(k) or ""
        fields.append(str(v))
    # ingredients
    for ing in item.get("ingredients") or []:
        fields.append(str(ing.get("name") or ""))
    # tags
    for t in item.get("tags") or []:
        fields.append(str(t))
    corpus = " ".join(fields)
    return qn in norm(corpus)

def in_filter(val, selected):
    if not selected:
        return True
    if val is None:
        return False
    if isinstance(selected, list):
        return any(str(v).lower() == str(val).lower() for v in selected)
    return str(val).lower() == str(selected).lower()

@app.get("/", response_class=HTMLResponse)
async def index(request: Request, lang: str | None = "hu"):
    template = env.get_template("index.html")
    return template.render(
        request=request,
        config=config,
        lang=lang,
    )

@app.get("/api/teas")
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
    # filter
    filtered = []
    for t in teas:
        if not matches_query(t, q):
            continue
        if category and not in_filter(t.get("category"), category):
            continue
        if subcategory and not in_filter(t.get("subcategory"), subcategory):
            continue
        # mood: we match mood_short OR tags
        mood_ok = True
        if mood:
            ms = (t.get("mood_short") or "")
            tags = t.get("tags") or []
            mood_ok = (norm(mood) in norm(ms)) or any(norm(mood) in norm(x) for x in tags)
        if not mood_ok:
            continue
        # caffeineLevel may live elsewhere in your CSV; we try t['caffeineLevel'] or tag match
        if caffeine:
            cval = t.get("caffeineLevel") or ""
            if norm(caffeine) not in norm(str(cval)):
                continue
        if season:
            seasons = t.get("timeSeason") or []
            if not any(s in seasons for s in season):
                continue
        if serve:
            serves = t.get("serve") or []
            if not any(s in serves for s in serve):
                continue
        filtered.append(t)

    total = len(filtered)
    start = max(0, (page - 1) * per_page)
    end = start + per_page
    out = filtered[start:end]
    resp = JSONResponse(out)
    resp.headers["X-Total-Count"] = str(total)
    return resp
