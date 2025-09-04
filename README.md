# Mirachai – Teadoboz Dashboard

Ez a projekt egy FastAPI-alapú dashboard, amely a Mirachai 84-féle tea adatbázisát kezeli és vizualizálja.
A cél: egy WordPress oldalba ágyazható, kereshető és szűrhető teaválasztó felület kialakítása, egyedi designnal.

## Főbb fájlok és mappák

- `84_teadoboz.csv` – Nyers teaadatbázis
- `final_dashboard_mapping.json` – Dashboard szűrők, címkék, színek, label‑ek
- `data/teas.json` – Normalizált adatbázis (backendhez)
- `dashboard/` – Python + FastAPI + Jinja alapú megjelenítő
- `config/dashboard_mapping.json` – Régi mapping (javasolt törölni vagy egységesíteni)
- `mirachai_logo.svg` – Projekt logó
- `requirements.txt` – Python könyvtárak
- `CODEX_PROMPT.md` – Fejlesztési utasítás Codex számára

## TODO / Fejlesztendők

- Szűrők teljes körű implementálása
- Mobilbarát reszponzív frontend
- WordPress beágyazás iframe-ként
- `.gitignore`, tesztek, CI integráció
