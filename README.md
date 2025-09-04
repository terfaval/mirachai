# Mirachai – Teadoboz Dashboard

Ez a projekt egy FastAPI-alapú dashboard, amely a Mirachai 84-féle tea adatbázisát kezeli és vizualizálja.
Célja egy WordPress oldalba ágyazható, kereshető és szűrhető teaválasztó felület kialakítása.

## Telepítés

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r dashboard/requirements.txt
```

## Futtatás

```bash
uvicorn dashboard.app.main:app --reload
# Böngészőben: http://127.0.0.1:8000/
```

## Fejlesztés

- Adatforrás: `84_teadoboz.csv` → `dashboard/data/teas.json`
- Konfiguráció: `final_dashboard_mapping.json`
- Alkalmazás modulok a `dashboard/app/` mappában: `main.py`, `routes.py`, `services.py`, `models.py`
- Frontend sablon: `dashboard/app/templates/index.html`
- Statikus fájlok: `dashboard/app/static/`

### Tesztek

```bash
pytest
```

## TODO / Fejlesztendők

- Szűrők teljes körű implementálása
- Mobilbarát reszponzív frontend
- WordPress beágyazás iframe-ként
- CI integráció
