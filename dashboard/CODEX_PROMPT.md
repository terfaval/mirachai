You are an expert Python + FastAPI + Jinja developer. Build the following features incrementally.

### Context
- Data: `data/teas.json` (normalized, includes `ingredients[]`, tags, category, mood, etc.)
- Mapping/config: `config/dashboard_mapping.json` (typography, colors, labels, filters)
- Current UI: Jinja template `app/templates/index.html`
- API: `/api/teas` supports query-params for filters and search.

### Tasks
1) Filters
   - Query params: `q`, `category`, `subcategory`, `mood`, `caffeine`, `season`, `serve` (multi).
   - Server-side filter function matches partials and is accent-insensitive for `q` across `name`, `ingredients[].name`, `tags`.
   - Return filtered list + counts per category for facet UI.

2) UI
   - Top bar: logo (if provided in mapping), search input, reset button.
   - Filter bar: generated from `config.filters` with friendly labels.
   - Cards: name, mood_short/labels, chips (category, caffeine, season), 'Részletek' button to toggle details (htmx or minimal JS).

3) Theming
   - Fonts from mapping.typography (Caveat Brush + Lato), Tailwind via CDN.
   - CSS variables populated from mapping.colors on load.

4) URL state
   - Read filters from URL on load, update URL on change, preserve back/forward navigation.

5) Performance
   - Lazy render (server-side pagination, e.g., `page`, `per_page`), default 24 per page.
   - Provide `X-Total-Count` header on `/api/teas`.

6) WordPress embed
   - No third-party cookies, sandbox-safe headers.
   - Provide `?lang=hu|en` param to swap labels (prepare `labels_en` fallback).

Deliver clean, documented code.
