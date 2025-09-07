# Codex Prompt – Dashboard fejlesztés

## Cél

Kérlek, készítsd el a `dashboard/` mappán belüli FastAPI + Jinja2 alapú dashboard rendszert, amely:

- betölti a `data/teas.json` adatbázist
- alkalmazza a `final_dashboard_mapping.json` alapján a szűrőmezőket
- frontend oldalon megjeleníti az összes tea kártyát (fantázianév, mood, funkció, összetevők, stb.)
- lehetővé teszi az adatbázis szűrését query paraméterekkel
- használja a `templates/index.html` sablont
- használja a `mirachai_logo.svg` logót a fejlécben

## Megkötések

- Betűtípus: Titan One (fantázianév), Lato (szövegtörzs)
- Színek és UI részletek: `final_dashboard_mapping.json` alapján
- Szűrők: mood, season, intensity, tags, time_of_day stb.

## Elvárt működés

- A dashboard indítható `uvicorn dashboard.main:app --reload` paranccsal
- A lekérdezések történhetnek pl. `/dashboard?mood=relax&season=tavasz` formában
- A frontend jelenítse meg a találatokat vizuálisan (nem nyers JSON)

## Extra

A cél, hogy a kész dashboard beágyazható legyen egy WordPress oldalba `<iframe>` segítségével.
