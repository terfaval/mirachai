# Mirachai – Teadoboz Dashboard

A projekt React/Next.js és TypeScript alapokra került át. A frontend teljes egészében a `pages/` és `components/` mappákban található TSX kódon keresztül működik. A FastAPI backend csak JSON API-kat szolgál ki, HTML renderelés nélkül.

## Fejlesztés

```bash
npm install
npm run dev
```

A fejlesztői szerver alapértelmezés szerint a http://localhost:3000 címen érhető el.

## Build és futtatás

```bash
npm run build
npm start    # vagy deploy Vercelre
```

## Backend API (opcionális)

```bash
uvicorn dashboard.app.main:app --reload
```

Csak a `/api/teas` végpont érhető el, amely JSON formában szolgáltatja a teák listáját.

## Tesztek

```bash
pytest
```
