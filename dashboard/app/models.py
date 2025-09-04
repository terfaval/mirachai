from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class Ingredient(BaseModel):
    name: Optional[str] = None
    rate: Optional[str] = None


class Tea(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    tags: Optional[List[str]] = None
    mood_short: Optional[str] = None
    caffeineLevel: Optional[str] = None
    timeSeason: Optional[List[str]] = None
    serve: Optional[List[str]] = None
    tempC: Optional[str] = None
    steepMin: Optional[str] = None
    ingredients: Optional[List[Ingredient]] = None