from __future__ import annotations

import json
import unicodedata
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable, List

from .models import Tea

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


def _normalize_list(val: Any) -> List[str]:
    if isinstance(val, str):
        return [v.strip() for v in val.split(",") if v.strip()]
    if isinstance(val, list):
        return [str(v).strip() for v in val if str(v).strip()]
    return []


@lru_cache(maxsize=1)
def _load_teas() -> List[Tea]:
    data = load_json(DATA_FILE)
    teas: List[Tea] = []
    for t in data:
        t = dict(t)
        t["season_recommended"] = _normalize_list(t.get("season_recommended"))
        t["daypart_recommended"] = _normalize_list(t.get("daypart_recommended"))
        allergens = t.get("allergens")
        if isinstance(allergens, str):
            t["allergens"] = [a.strip() for a in allergens.replace("|", ",").split(",") if a.strip()]
        elif isinstance(allergens, list):
            t["allergens"] = [str(a).strip() for a in allergens if str(a).strip()]
        else:
            t["allergens"] = []
        teas.append(Tea(**t))
    return teas


def get_teas(refresh: bool = False) -> List[Tea]:
    if refresh:
        _load_teas.cache_clear()
    return _load_teas()


@lru_cache(maxsize=1)
def get_config() -> dict:
    return load_json(CONFIG_FILE)


@lru_cache(maxsize=1)
def get_category_colors() -> dict[str, str]:
    data = load_json(COLORS_FILE)
    return {entry["category"]: entry["main"] for entry in data if "category" in entry}
    

def matches_query(item: Any, q: str | None) -> bool:
    if not q:
        return True
    qn = norm(q)
    fields: List[str] = []
    for k in ("name", "description", "category", "subcategory", "taste", "color"):
        v = getattr(item, k, None) or ""
        fields.append(str(v))
    for ing in getattr(item, 'ingredients', []) or []:
        name = getattr(ing, 'name', ing)
        if name:
            fields.append(str(name))
    for t in getattr(item, 'tags', []) or []:
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
    teas: Iterable[Tea],
    q: str | None = None,
    category: str | None = None,
    subcategory: str | None = None,
    mood: str | None = None,
    caffeine: str | None = None,
    season: List[str] | None = None,
    daypart: List[str] | None = None,
) -> List[Tea]:
    filtered: List[Any] = []
    for t in teas:
        if not matches_query(t, q):
            continue
        if category and not in_filter(getattr(t, 'category', None), category):
            continue
        if subcategory and not in_filter(getattr(t, 'subcategory', None), subcategory):
            continue
        mood_ok = True
        if mood:
            ms = getattr(t, 'mood_short', '') or ""
            tags = getattr(t, 'tags', []) or []
            mood_ok = (norm(mood) in norm(ms)) or any(norm(mood) in norm(x) for x in tags)
        if not mood_ok:
            continue
        if caffeine:
            cval = getattr(t, 'caffeineLevel', '') or ""
            if norm(caffeine) not in norm(str(cval)):
                continue
        if season:
            seasons = [norm(s) for s in getattr(t, 'season_recommended', [])]
            if not any(norm(s) in seasons for s in season):
                continue
        if daypart:
            parts = [norm(s) for s in getattr(t, 'daypart_recommended', [])]
            if not any(norm(d) in parts for d in daypart):
                continue
        filtered.append(t)
    return filtered