from __future__ import annotations

import json
import unicodedata
from functools import lru_cache
from pathlib import Path
from types import SimpleNamespace
from typing import Iterable, List

DASHBOARD_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = DASHBOARD_DIR.parent
DATA_FILE = ROOT_DIR / "data" / "teas.json"
CONFIG_FILE = ROOT_DIR / "final_dashboard_mapping.json"
COLORS_FILE = ROOT_DIR / "data" / "colorScale.json"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def norm(s: str) -> str:
    return strip_accents(s).lower()


@lru_cache(maxsize=1)
def get_teas() -> List[SimpleNamespace]:
    data = load_json(DATA_FILE)
    return [SimpleNamespace(**t) for t in data]


@lru_cache(maxsize=1)
def get_config() -> dict:
    return load_json(CONFIG_FILE)


@lru_cache(maxsize=1)
def get_category_colors() -> dict[str, str]:
    data = load_json(COLORS_FILE)
    return {entry["category"]: entry["main"] for entry in data}
    

def matches_query(item: SimpleNamespace, q: str | None) -> bool:
    if not q:
        return True
    qn = norm(q)
    fields: List[str] = []
    for k in ("name", "description", "category", "subcategory", "taste", "color"):
        v = getattr(item, k, None) or ""
        fields.append(str(v))
    for ing in item.ingredients or []:
        fields.append(ing.name or "")
    for t in item.tags or []:
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


def filter_teas(
    teas: Iterable[SimpleNamespace],
    q: str | None = None,
    category: str | None = None,
    subcategory: str | None = None,
    mood: str | None = None,
    caffeine: str | None = None,
    season: List[str] | None = None,
    serve: List[str] | None = None,
) -> List[SimpleNamespace]:
    filtered: List[SimpleNamespace] = []
    for t in teas:
        if not matches_query(t, q):
            continue
        if category and not in_filter(t.category, category):
            continue
        if subcategory and not in_filter(t.subcategory, subcategory):
            continue
        mood_ok = True
        if mood:
            ms = t.mood_short or ""
            tags = t.tags or []
            mood_ok = (norm(mood) in norm(ms)) or any(norm(mood) in norm(x) for x in tags)
        if not mood_ok:
            continue
        if caffeine:
            cval = t.caffeineLevel or ""
            if norm(caffeine) not in norm(str(cval)):
                continue
        if season:
            seasons = t.timeSeason or []
            if not any(s in seasons for s in season):
                continue
        if serve:
            serves = t.serve or []
            if not any(s in serves for s in serve):
                continue
        filtered.append(t)
    return filtered