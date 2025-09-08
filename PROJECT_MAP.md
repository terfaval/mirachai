# Projekt térkép

**PROMPT**: Minden szerkesztőnek el kell olvasnia ezt a fájlt a szerkesztés előtt. Bármilyen módosítás a projektben kötelezően jár ennek a térképnek a frissítésével is.

## Gyökér
- `.gitignore` – Git kizárási szabályok.
- `84_teadoboz.csv` – Teaadatokat tartalmazó CSV.
- `CATEGORY_GUIDE.md` – Kategória útmutató.
- `CODEX_PROMPT.md` – A Codex prompt leírása.
- `PROJECT_MAP.md` – Jelen projekt térkép.
- `README.md` – Fő projektleírás.
- `final_dashboard_mapping.json` – Dashboard hozzárendelések.
- `next-env.d.ts` – Next.js típusdefiníciók.
- `next.config.mjs` – Next.js konfiguráció.
- `package.json` – NPM csomagok és scriptek.
- `package-lock.json` – Függőségek zárolt verziói.
- `tsconfig.json` – TypeScript beállítások.
- `vitest.config.js` – Vitest tesztkonfiguráció.

## app
- `teabox/page.tsx` – Teabox oldal a Next.js alkalmazásban.

## components
- `FilterPanel.tsx` – Szűrőpanel komponens.
- `Header.tsx` – Fejléc komponens.
- `SearchBar.tsx` – Keresősáv komponens.
- `TasteChart.tsx` – Ízdiagram komponens.
- `TeaCard.tsx` – Tea kártya komponens.
- `TeaGrid.tsx` – Teák rácselrendezése.
- `TeaModal.tsx` – Tea részleteit megjelenítő modal.

## dashboard
- `CODEX_PROMPT.md` – Prompt leírás a dashboardhoz.
- `README.md` – Dashboard dokumentáció.
- `__init__.py` – Python csomag inicializáló.
- `csv_adapter.py` – CSV adatok betöltése.
- `requirements.txt` – Python függőségek.
- `app/__init__.py` – Alkalmazás csomag inicializáló.
- `app/main.py` – Fő belépési pont.
- `app/models.py` – Adatmodellek.
- `app/routes.py` – API útvonalak.
- `app/services.py` – Szolgáltatás réteg.
- `app/__pycache__/main.cpython-313.pyc` – Python gyorsítótár fájl.

## data
- `colorScale.json` – Színskála adatok.
- `teas.json` – Tea metaadatok.

## mirachai/__GIT_INTERNAL__backup
- `HEAD` – Git HEAD referencia.
- `config` – Git konfiguráció.
- `description` – Repo leírása.
- `info/exclude` – Git kizárások.
- `hooks/applypatch-msg.sample` – Minta hook.
- `hooks/commit-msg.sample` – Minta hook.
- `hooks/fsmonitor-watchman.sample` – Minta hook.
- `hooks/post-update.sample` – Minta hook.
- `hooks/pre-applypatch.sample` – Minta hook.
- `hooks/pre-commit.sample` – Minta hook.
- `hooks/pre-merge-commit.sample` – Minta hook.
- `hooks/pre-push.sample` – Minta hook.
- `hooks/pre-rebase.sample` – Minta hook.
- `hooks/pre-receive.sample` – Minta hook.
- `hooks/prepare-commit-msg.sample` – Minta hook.
- `hooks/push-to-checkout.sample` – Minta hook.
- `hooks/sendemail-validate.sample` – Minta hook.
- `hooks/update.sample` – Minta hook.

## public
- `Mandala.svg` – Mandala grafika.
- `Mandala _Finom_Vedelem.svg` – Mandala grafika.
- `Mandala_Alom_Kapu.svg` – Mandala grafika.
- `Mandala_Andoki _Lendulet.svg` – Mandala grafika.
- `Mandala_Csendes_Ido.svg` – Mandala grafika.
- `Mandala_Europai_Gyogyfuvek.svg` – Mandala grafika.
- `Mandala_Evszakok_Zamata.svg` – Mandala grafika.
- `Mandala_Husito_Kortyok.svg` – Mandala grafika.
- `Mandala_Indiai_Chai.svg` – Mandala grafika.
- `Mandala_Japan_Zold.svg` – Mandala grafika.
- `Mandala_Kinai_Klasszikusok.svg` – Mandala grafika.
- `Mandala_Kozel-Kelet_Illata.svg` – Mandala grafika.
- `Mandala_Szavannai_Frissesseg.svg` – Mandala grafika.
- `Mandala_Tiszta_Fokusz.svg` – Mandala grafika.
- `apro_zaras.png` – Képi erőforrás.
- `backgroundX.png` – Háttérkép.
- `background_afternoon.png` – Háttérkép.
- `background_backup.png` – Háttérkép.
- `background_dawn.png` – Háttérkép.
- `background_evening.png` – Háttérkép.
- `background_morning.png` – Háttérkép.
- `background_night.png` – Háttérkép.
- `background_noon.png` – Háttérkép.
- `baratsagos_kod.png` – Képi erőforrás.
- `feher_holdfeny.png` – Képi erőforrás.
- `filter.svg` – Ikon.
- `finom_hnagulat.png` – Képi erőforrás.
- `kompakt_deru.png` – Képi erőforrás.
- `mini_unnep.png` – Képi erőforrás.
- `mirachai_logo.svg` – Logó.
- `search.svg` – Keresés ikon.
- `fonts/.gitkeep` – Üres mappát tart fenn.

## src
- `demo/demo.ts` – Demó szkript.
- `search/engine.ts` – Keresési motor.
- `search/index.ts` – Keresési modul belépési pont.
- `search/normalize.ts` – Normalizálási segédfüggvények.
- `search/query.ts` – Lekérdezés összeállító.
- `search/score.ts` – Pontozási logika.
- `search/synonyms.ts` – Szinonima lista.
- `search/types.ts` – Típusdefiníciók.
- `types/external.d.ts` – Külső típusok.
- `types/shadcn-ui.d.ts` – Shadcn UI típusok.
- `ui/TeaSearchWithFilters.tsx` – Összetett kereső komponens.
- `ui/filters/FilterPanel.tsx` – Szűrőpanel.
- `ui/filters/buildQueryFromFilters.ts` – Szűrőkből lekérdezés.
- `ui/filters/collectFacets.ts` – Facet gyűjtés.
- `ui/filters/types.ts` – Szűrőtípusok.

## pages
- `_app.tsx` – Next.js alkalmazásgyökér.
- `index.tsx` – Kezdőoldal.

## styles
- `globals.css` – Globális stílusok.
- `Header.module.css` – Fejléc stílusai.
- `SearchBar.module.css` – Keresősáv stílusai.
- `TasteChart.module.css` – Ízdiagram stílusai.
- `TeaCard.module.css` – Tea kártya stílusai.
- `TeaGrid.module.css` – Rácselrendezés stílusai.
- `TeaModal.module.css` – Modal stílusai.

## utils
- `colorMap.ts` – Szín leképezések.
- `filter.ts` – Szűrési segédfüggvények.
- `mandala.ts` – Mandala erőforráskezelés.

## tests
- `buildQueryFromFilters.spec.ts` – Szűrő lekérdezés tesztjei.
- `engine.spec.ts` – Keresőmotor tesztek.
- `test_services.py` – Dashboard szolgáltatás tesztek.