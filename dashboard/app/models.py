from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class IngredientPart(BaseModel):
    name: str
    rate: float


class ServTempModes(BaseModel):
    hot: Optional[bool] = None
    lukewarm: Optional[bool] = None
    iced: Optional[bool] = None
    coldbrew: Optional[bool] = None


class Tea(BaseModel):
    id: str
    name: str
    category: str
    subcategory: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    shortDescription: Optional[str] = None
    description: Optional[str] = None
    tastes: List[str] = Field(default_factory=list)
    effects: List[str] = Field(default_factory=list)
    ingredients: List[str] = Field(default_factory=list)
    ingredientsBreakdown: List[IngredientPart] = Field(default_factory=list)
    timeOfDay: str
    season: str
    tempC: int
    steepMin: int
    quantitySpoons: Optional[float] = None
    caffeineLevel: Optional[float] = None
    servTempModes: Optional[ServTempModes] = None
    allergens: List[str] = Field(default_factory=list)
    intensity: Optional[str] = None