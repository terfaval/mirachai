from __future__ import annotations

from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .routes import router

BASE = Path(__file__).resolve().parent

app = FastAPI(title="Mirachai Dashboard")
app.mount("/static", StaticFiles(directory=str(BASE / "static")), name="static")
app.include_router(router)