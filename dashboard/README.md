# Mirachai Dashboard (Python/FastAPI, WordPress-embed ready)

Local-first dashboard a Mirachai teák böngészésére. Python-only szűrés, Jinja UI, Tailwind CDN.

## Fut tatás lokálban

```bash
# Python 3.10+
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# Megnyitás: http://127.0.0.1:8000/
```

## WordPress beágyazás (iframe)
```html
<div style="max-width:1200px;margin:0 auto;">
  <iframe src="http://127.0.0.1:8000/?lang=hu"
          style="width:100%;height:85vh;border:0;overflow:hidden;"
          loading="lazy" referrerpolicy="no-referrer"></iframe>
</div>
```

## Struktúra
- `app/main.py` – FastAPI indítás
- `app/routes.py` – végpontok
- `app/services.py` – adatbetöltés és szűrés
- `app/models.py` – típusdefiníciók
- `app/templates/index.html` – Jinja UI (Tailwind CDN, Caveat Brush + Lato)
- `app/static/` – CSS és JS
- `data/teas.json` – normalizált teák
- `../final_dashboard_mapping.json` – globális mapping (tipó, színek, label-ek, szűrők)

## Codex prompt (fejlesztési feladatlista)
Lásd: `CODEX_PROMPT.md`
