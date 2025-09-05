# Mirachai Dashboard Backend

Ez a mappa a FastAPI-alapú hátéralkalmazást tartalmazza, amely a teákhoz kapcsolódó JSON API-kat szolgálja ki. Nincs többé Jinja2 sablon vagy statikus frontend; a React/Next.js felület a gyökérprojektben található.

## Fut tatás lokálban

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# Megnyitás: http://127.0.0.1:8000/api/teas
```

## Struktúra

- `app/main.py` – FastAPI indítás
- `app/routes.py` – API végpontok
- `app/services.py` – adatbetöltés és szűrés
- `app/models.py` – típusdefiníciók
- `data/` – backendhez használt adatok (pl. `tea_app_colors.csv`)