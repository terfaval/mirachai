# Fájlstruktúra leírás

Az alábbi dokumentum a projekt teljes könyvtárszerkezetét ismerteti. Minden elemhez 1-2 mondatos leírás tartozik a szerepéről és a kapcsolódó fájlokról.

## Gyökér
- `.eslintrc.json` – ESLint szabályok a TypeScript és React kód ellenőrzéséhez; a `npm run lint` parancs használja.
- `.gitignore` – Verziókezelésből kizárt fájlok listája, például a `node_modules` könyvtár.
- `.npmrc` – NPM kliens beállításai, hatással van a csomagtelepítésre.
- `.vercelignore` – Vercel deploy során figyelmen kívül hagyott fájlok.
- `84_teadoboz.csv` – Teainformációkat tartalmazó CSV, a `data/teas.json` előállításának alapja.
- `CATEGORY_GUIDE.md` – Kategóriákhoz tartozó útmutató, a `data` mappában lévő adatok értelmezését segíti.
- `CODEX_PROMPT.md` – A Codex prompt dokumentációja, a `dashboard/CODEX_PROMPT.md`-hez kapcsolódóan.
- `FILE_STRUCTURE.md` – Jelen fájl, a teljes projektstruktúra részletes ismertetése.
- `PROJECT_MAP.md` – Rövidebb projektáttekintés; minden módosítás esetén frissítendő.
- `README.md` – Fő projektleírás, hivatkozva a további dokumentumokra.
- `TeaDetailPage.tsx` – Összetett teainformációs oldal, több `components` elem összeállításával.
- `app/` – Next.js útvonalak; komponenseket és `data` állományokat használ a megjelenítéshez.
- `components/` – Újrafelhasználható React komponensek gyűjteménye, amelyeket több oldal és a `TeaDetailPage` is importál.
- `dashboard/` – Python alapú backend szolgáltatás a dashboardhoz; a `tests/test_services.py` ellenőrzi.
- `data/` – JSON formátumú adatkészletek, amelyeket a `lib` segédfüggvények és `src` modulok olvasnak.
- `eslint.config.mjs` – Alternatív ESLint konfiguráció, a `lint` szkripthez társítva.
- `final_dashboard_mapping.json` – Dashboard specifikus hozzárendelések, a `dashboard` modul használja.
- `global.d.ts` – Globális TypeScript deklarációk; a `tsconfig.json` importálja.
- `ingredients.xlsx` – Alapvető hozzávaló-lista, amelyből a `data/ingredients.json` készült.
- `lib/` – Segédfüggvények TypeScriptben; például a `app/teabox/page.tsx` importálja.
- `mirachai/` – Git belső mentés (`__GIT_INTERNAL__backup`), futás közben nem használt.
- `node_modules/` – Telepített csomagok könyvtára, a `package.json`-ban szereplő függőségek kerülnek ide.
- `package-lock.json` – A telepített csomagok zárolt verziói, a `npm install` generálja.
- `package.json` – NPM metaadatok és szkriptek, összefügg a `package-lock.json`-nal és a build folyamatokkal.
- `pages/` – Next.js oldalgyökér; a `_app.tsx` és `index.tsx` fájlokat tartalmazza.
- `postcss.config.js` – PostCSS beállítások, a `tailwind.config.js`-sel együtt a CSS feldolgozását szabályozza.
- `public/` – Statikus fájlok (képek, ikonok, betűkészletek), melyeket a frontend közvetlenül szolgál ki.
- `styles/` – CSS modulok és globális stílusok, melyeket a komponensek importálnak.
- `tailwind.config.js` – Tailwind CSS konfiguráció, a `styles/globals.css` és a PostCSS együtt használja.
- `tests/` – Vitest és Python tesztek gyűjteménye; a `npm test` parancs futtatja őket.
- `tsconfig.json` – TypeScript konfigurációs fájl, minden `.ts` és `.tsx` állományra hatással van.
- `types/` – Projekt szintű típusdefiníciók, amelyeket a `src` modulok használnak.
- `utils/` – Segédfüggvények a gyökérszinten; többek közt a `tests` és `TeaDetailPage.tsx` is hivatkozik rájuk.
- `vercel/` – Vercel deploy scriptek; a `vercel.json` kiegészítője.
- `vercel.json` – Vercel konfiguráció, a deploy beállításait tartalmazza.
- `vitest.config.js` – Vitest tesztkonfiguráció, a `npm test` használja.

## app
- `teabox/page.tsx` – Teabox útvonal, a `src/ui/TeaSearchWithFilters` komponenssel és a `data/teas.json` adataival dolgozik.

## components
- `CategoryPills.tsx` – Kategória jelvényeket jelenít meg; a `TeaDetailPage.tsx` használja.
- `CategorySidebar.tsx` – Oldalsáv kategóriákhoz; együttműködik a `sortOptions.ts` állománnyal.
- `ColorCup.tsx` – Csészét színez a tea alapján, a `TeaDetailPage.tsx` egyik eleme.
- `DayDonut.tsx` – Napi beosztást megjelenítő donut diagram; a `panels` modulokhoz kapcsolódik.
- `FilterPanel.tsx` – Szűrőpanel komponens; a `src/ui/filters` almodullal működik.
- `Header.tsx` – Fejléc komponens, több oldal is importálja.
- `InfoPanelSidebar.tsx` – Információs oldalsáv; a `panels` komponensek adatait jeleníti meg.
- `QuarterDonut.tsx` – Negyedkör diagram; a `DayDonut.tsx` kiegészítője.
- `SearchBar.tsx` – Keresősáv komponens, a `src/search` modulokra támaszkodik.
- `ServeModes.tsx` – Tálalási módokat ismertető elem; a `TeaDetailPage.tsx` része.
- `SimpleProgress.tsx` – Egyszerű előrehaladás sáv; a `TeaDetailPage.tsx` importálja.
- `TeaCard.tsx` – Egyedi tea kártya, a `TeaGrid.tsx` és `TeaModal.tsx` is felhasználja.
- `TeaGrid.tsx` – Teák rácselrendezésben való megjelenítése, a `TeaCard.tsx`-re épít.
- `TeaModal.tsx` – Modal ablak tea részletekkel; a `TeaCard.tsx`-ból nyílik.
- `TeaTitle.tsx` – Tea címének megjelenítése, a `TeaDetailPage.tsx` része.
- `ingredients/` – Hozzávalókkal kapcsolatos komponensek.
- `panels/` – Grafikus panelek a tea jellemzőinek szemléltetéséhez.
- `sortOptions.ts` – Kategóriaszortírozási beállítások; a `CategorySidebar.tsx` használja.

### components/ingredients
- `CaffeineBar.tsx` – Koffeintartalmat jelző sáv, a `IngredientsStack.tsx`-szel együtt működik.
- `IngredientsStack.tsx` – Hozzávalók listáját rendezi, a `TeaDetailPage.tsx` használja.

### components/panels
- `DescPanel.module.css` – Leírás panel stílusai, a `DescPanel.tsx`-hez kapcsolódik.
- `DescPanel.tsx` – Tea leírását megjelenítő panel, a `TeaDetailPage.tsx` része.
- `DonutPercent.tsx` – Százalékos donut diagram, a `TeaDetailPage.tsx` használja.
- `FocusChart.tsx` – Fókusz pontdiagram, a `TeaDashboard.tsx`-ban jelenik meg.
- `FunctionRadialSteps.tsx` – Funkciók radiális lépéseit mutató panel, a `TeaDetailPage.tsx`-hez kapcsolódik.
- `HeaderPanel.tsx` – Panel fejrész, más panel komponensek importálják.
- `IngredientCaffeinePanel.tsx` – Hozzávalók koffein-összetételét mutatja, a `IngredientsStack.tsx`-hez kötődik.
- `IntensityDots.tsx` – Intenzitást jelző pontok, a `TeaDetailPage.tsx` része.
- `MandalaBackground.tsx` – Mandala háttér megjelenítés, `public/Mandala*.svg` erőforrásokra támaszkodik.
- `MoreInfoPanel.tsx` – További információkat nyit meg, `InfoPanelSidebar.tsx` használja.
- `PrepInfo.tsx` – Elkészítési információk, a `PrepServePanel.tsx`-ben jelenik meg.
- `PrepServePanel.tsx` – Elkészítési és tálalási adatokat egyesítő panel.
- `TasteChart.tsx` – Ízdiagram panel, a `TasteFocusPanel.tsx` és `TeaDetailPage.tsx` is felhasználja.
- `TasteFocusPanel.tsx` – Ízösszpontosító panel, a `TeaDashboard.tsx` része.
- `TeaDashboard.tsx` – Teljes áttekintő panel, több más panelt komponál össze.

## dashboard
- `CODEX_PROMPT.md` – A dashboardhoz készült prompt leírása.
- `README.md` – A dashboard komponens használati útmutatója.
- `__init__.py` – Python csomag inicializáló; exportálja a modulokat.
- `csv_adapter.py` – CSV adatok betöltését végzi, a `data` fájlokkal dolgozik.
- `requirements.txt` – Python függőségek listája, a dashboard futtatásához szükséges.
- `app/` – A FastAPI alkalmazás kódja.

### dashboard/app
- `__init__.py` – Alkalmazás csomag inicializáló.
- `main.py` – Belépési pont a FastAPI szerverhez.
- `models.py` – Adatmodellek, amelyeket a `routes.py` használ.
- `routes.py` – API végpontok, a `services.py`-re támaszkodnak.
- `services.py` – Üzleti logika réteg; a `csv_adapter.py`-vel működik.
- `__pycache__/main.cpython-313.pyc` – Fordított Python bájtkód a `main.py`-hoz.

## data
- `brew_profiles.json` – Főzési profilok; a `lib/brew.*` és `src/brewing` modulok olvassák.
- `colorScale.json` – Színskála definíciók, a `src/utils/colorMap.ts` használja.
- `equipment_guide.json` – Eszköz útmutató, a `dashboard` szolgáltatások hivatkoznak rá.
- `ingredients.json` – Hozzávalók listája, az `IngredientsStack.tsx` dolgozza fel.
- `teaColorLabels.json` – Tea színek címkéi, a `utils/colorMap.ts`-hez kapcsolódik.
- `teas.json` – Fő teaadatbázis, a `src/ui/TeaSearchWithFilters.tsx` és `app/teabox/page.tsx` használja.
- `teas_descriptions.json` – Tealeírások, a `TeaDetailPage.tsx` egészíti ki vele az adatokat.

## lib
- `brew.data.server.ts` – Szerveroldali főzési adatok betöltése; a `src/brewing` modul használja.
- `brew.finishing.ts` – Főzési folyamat befejező lépései, a `brew.math.ts` és `src/brewing` kapcsolódik.
- `brew.math.ts` – Matematikai segédfüggvények a főzéshez, a `brew.finishing.ts` hívja.
- `toStringArray.ts` – Segédfüggvény sztring tömbbé alakításra; az `app/teabox/page.tsx` importálja.

## mirachai/__GIT_INTERNAL__backup
- `HEAD` – Git referencia a legutóbbi commitra.
- `config` – Git konfigurációs fájl.
- `description` – A repó rövid leírása.
- `hooks/*.sample` – Mintafájlok Git hookokhoz, fejlesztési referencia.
- `info/exclude` – Git kizárási lista, a `.gitignore`-hoz hasonlóan működik.

## pages
- `_app.tsx` – Next.js alkalmazás belépési pontja, inicializálja a globális stílusokat.
- `index.tsx` – Kezdőoldal, amely a `components` gyűjteményből építkezik.

## public
- `Mandala.svg` – Alap mandala grafika, háttérként szolgál.
- `Mandala_Alom_Kapu.svg` – Álomtémájú mandala, a `table_background` megfelelő képével párosítva.
- `Mandala_Andoki_Lendulet.svg` – Andok ihlette mandala, a `table_background/table_andoki_lendulet.png`-hez kapcsolódik.
- `Mandala_Csendes_Ido.svg` – Nyugodt időt ábrázoló mandala, a `table_background/table_csendes_ido.png`-val együtt használva.
- `Mandala_Europai_Gyogyfuvek.svg` – Gyógyfüves mandala, azonos témájú háttérképpel.
- `Mandala_Evszakok_Zamata.svg` – Évszakok ízét megjelenítő mandala, megfelelő `table_background` képpel.
- `Mandala_Finom_Vedelem.svg` – Védelmet szimbolizáló mandala.
- `Mandala_Husito_Kortyok.svg` – Hűsítő kortyokat jelképező mandala.
- `Mandala_Indiai_Chai.svg` – Indiai chai témájú mandala.
- `Mandala_Japan_Zold.svg` – Japán zöld teát idéző mandala.
- `Mandala_Kinai_Klasszikusok.svg` – Kínai klasszikusokat ábrázoló mandala.
- `Mandala_Kozel-Kelet_Illata.svg` – Közel-keleti illatokat megidéző mandala.
- `Mandala_Szavannai_Frissesseg.svg` – Szavannai frissességet tükröző mandala.
- `Mandala_Tiszta_Fokusz.svg` – Tiszta fókuszt szimbolizáló mandala.
- `apro_zaras.png` – Apró zárás grafikája, dekorációs elem.
- `backgroundX.png` – Általános háttérkép.
- `background_afternoon.png` – Délutáni témájú háttér.
- `background_backup.png` – Tartalék háttérkép.
- `background_dawn.png` – Hajnalban használt háttér.
- `background_evening.png` – Esti háttérkép.
- `background_morning.png` – Reggeli háttérkép.
- `background_night.png` – Éjszakai háttérkép.
- `background_noon.png` – Délidőhöz tartozó háttér.
- `baratsagos_kod.png` – Barátságos köd grafikája.
- `colorCup.png` – Színezett csésze ikon, a `components/ColorCup.tsx` használja.
- `feher_holdfeny.png` – Fehér holdfény ábra.
- `filter.svg` – Szűrő ikon, a `FilterPanel.tsx` és `SearchBar.tsx` is hivatkozhat rá.
- `finom_hnagulat.png` – Finom hangulatot ábrázoló grafika.
- `fonts/.gitkeep` – Üres mappa fenntartására szolgáló fájl.
- `icon_category.svg` – Kategória ikon, a `CategorySidebar.tsx` használja.
- `icon_csipos.svg` – Csípős íz ikon.
- `icon_edes.svg` – Édes íz ikon.
- `icon_foldes.svg` – Földes íz ikon.
- `icon_friss.svg` – Friss íz ikon.
- `icon_fuszeres.svg` – Fűszeres íz ikon.
- `icon_gyumolcsos.svg` – Gyümölcsös íz ikon.
- `icon_info.svg` – Információ ikon, modálokban használható.
- `icon_keseru.svg` – Keserű íz ikon.
- `icon_prep.svg` – Elkészítési ikon, a `PrepServePanel.tsx`-ben jelenik meg.
- `icon_savanyu.svg` – Savanyú íz ikon.
- `icon_taste.svg` – Íz ikon főcsoport, több íz-ikonhoz kapcsolódik.
- `icon_timing.svg` – Időzítést jelző ikon.
- `icon_umami.svg` – Umami íz ikon.
- `icon_viragos.svg` – Virágos íz ikon.
- `kompakt_deru.png` – Kompakt derű hangulatképe.
- `mini_unnep.png` – Mini ünnep hangulat grafika.
- `mirachai_logo.svg` – A projekt logója, több oldal fejlécében megjelenik.
- `search.svg` – Keresés ikon, a `SearchBar.tsx` használja.
- `serve_coldbrew.svg` – Hideg áztatás ikon, a `ServeModes.tsx`-ben jelenik meg.
- `serve_hot.svg` – Forró tálalás ikon.
- `serve_iced.svg` – Jeges tálalás ikon.
- `serve_lukewarm.svg` – Langyos tálalás ikon.
- `sort.svg` – Rendezés ikon, a `CategorySidebar.tsx`-szel kapcsolódik.
- `table_background/` – Különböző teákhoz illő asztalfelszíni háttérképek.
- `tea-sample-1.png` – Minta teafotó.

### public/table_background
- `table_afrika_frissessegei.png` – Afrikai frissességet idéző háttér a megfelelő mandalával párosítva.
- `table_alom_kapu.png` – Álomtémájú asztal háttér.
- `table_andoki_lendulet.png` – Andoki lendületet idéző asztal.
- `table_csendes_ido.png` – Nyugalmat sugárzó asztal.
- `table_default.png` – Alapértelmezett háttér.
- `table_europai_gyogyfuvek.png` – Európai gyógynövényekhez kapcsolódó háttér.
- `table_evszakok_zamata.png` – Évszakok zamata témájú asztal.
- `table_finom_vedelem.png` – Védelmet jelképező asztal.
- `table_hus_kortyok.png` – Hűsítő kortyokhoz illő háttér.
- `table_indiai_chai.png` – Indiai chai témájú asztal.
- `table_japan_zold.png` – Japán zöld tea asztalháttér.
- `table_kinai_klasszikus.png` – Kínai klasszikusokhoz illő háttér.
- `table_kozel_kelet_illata.png` – Közel-keleti illatokat tükröző asztal.
- `table_tiszta_fokusz.png` – Tiszta fókuszt jelképező asztal.

## src
- `brewing/` – Főzési logikát tartalmazó modul, `lib/brew.*` függvényekre épít.
- `demo/` – Bemutató kódok; a `demo.ts` futtatható script.
- `search/` – Keresőmotor logika TypeScriptben, több komponens is importálja.
- `types/` – Kifejezetten a `src` alá tartozó típusdefiníciók.
- `ui/` – Felhasználói felület elemei, köztük a szűrőrendszer és alap komponensek.
- `utils/` – Kifejezetten `src`-hez tartozó segédfüggvények, pl. `colorMap.ts`.

### src/brewing
- `index.ts` – Főzési függvények aggregátora, a `lib/brew.*` modulokra épít.

### src/demo
- `demo.ts` – Példa script a keresési funkció bemutatására; a `search` modulra hivatkozik.

### src/search
- `engine.ts` – Keresőmotor implementáció, a `normalize.ts`, `score.ts` és `synonyms.ts` modulokat használja.
- `index.ts` – Kereső modul belépési pont, amely újraexportálja az `engine` funkcióit.
- `normalize.ts` – Keresési kifejezések normalizálása, az `engine.ts` hívja.
- `query.ts` – Lekérdezések összeállítása, a `buildQueryFromFilters.ts`-szel működik együtt.
- `score.ts` – Találatok pontozása, az `engine.ts` és a `tests/relevance.spec.ts` is használja.
- `synonyms.ts` – Szinonimák listája a rugalmas kereséshez, a `query.ts`-hez kapcsolódva.
- `types.ts` – A keresőmotor típusdefiníciói, több `src/search` fájl importálja.

### src/types
- `external.d.ts` – Külső modulok típusdeklarációja.
- `shadcn-ui.d.ts` – Shadcn UI könyvtár deklarációi.
- `tea.ts` – Tea objektum típusdefiníció, a `TeaDetailPage.tsx` és `src/ui` modulok használják.

### src/ui
- `TeaSearchWithFilters.tsx` – Összetett keresőkomponens szűrőkkel, a `app/teabox/page.tsx` használja.
- `badge.tsx` – Jelvény komponens, más `src/ui` elemekkel kombinálható.
- `button.tsx` – Gomb komponens; a `filters` almodul is használja.
- `card.tsx` – Kártya komponens, a keresési találatokat jeleníti meg.
- `checkbox.tsx` – Jelölőnégyzet komponens, a `filters` modul része.
- `input.tsx` – Input mező, a `SearchBar.tsx`-hez kapcsolódik.
- `label.tsx` – Címke komponens, űrlapelemekhez.
- `scroll-area.tsx` – Görgethető terület; hosszabb listák megjelenítéséhez.
- `select.tsx` – Legördülő választó komponens, a `filters` modul használja.
- `separator.tsx` – Elválasztó elem, felületi struktúrához.
- `slider.tsx` – Csúszka komponens, a `filters/Slider.tsx`-szel dolgozik.
- `filters/` – Szűrőspecifikus UI elemek és logika.

#### src/ui/filters
- `Chip.tsx` – Szűrőcímke, a `FilterPanel.tsx`-ben jelenik meg.
- `Dropdown.tsx` – Legördülő szűrő, a `MultiSelectDropdown.tsx` és `FilterPanel.tsx` együttműködik vele.
- `FilterPanel.tsx` – Szűrőpanel UI, a `src/ui/TeaSearchWithFilters.tsx` komponens része.
- `MultiSelectDropdown.tsx` – Többértékű legördülő szűrő.
- `Slider.tsx` – Számtartományt választó csúszka.
- `buildQueryFromFilters.ts` – Szűrőkből keresési lekérdezést készít, a `tests/buildQueryFromFilters.spec.ts` ellenőrzi.
- `collectFacets.ts` – Szűrők facettjeit gyűjti, a `FilterPanel.tsx` hívja.
- `types.ts` – A szűrőrendszer típusai.

### src/utils
- `colorMap.ts` – Színek hozzárendelése teákhoz, a `components/ColorCup.tsx` használja.
- `teaTransforms.ts` – Tea adatok átalakító függvényei, a `app/teabox/page.tsx`-szal együttműködik.

## styles
- `FilterPanel.module.css` – A `FilterPanel.tsx` stílusai.
- `Header.module.css` – A `Header.tsx` komponens stíluslapja.
- `InfoPanelSidebar.module.css` – Oldalsáv stílusai, azonos nevű komponenshez.
- `SearchBar.module.css` – Keresősáv stílusok.
- `TasteChart.module.css` – Ízdiagram stílusok, a `components/panels/TasteChart.tsx`-hez.
- `TeaCard.module.css` – Tea kártya stíluslap.
- `TeaGrid.module.css` – Rácselrendezés stílusai.
- `TeaModal.module.css` – Modal ablak stílusai.
- `globals.css` – Globális stílusok, a `pages/_app.tsx` importálja.

## tests
- `brewing.api.spec.ts` – A főzési API-k tesztje, a `src/brewing` modulra épít.
- `buildQueryFromFilters.spec.ts` – Szűrőkből épített lekérdezések tesztje.
- `category-distribution.spec.ts` – Kategóriaeloszlás ellenőrzése, a `utils/category-distribution.ts`-hez kapcsolódik.
- `engine.spec.ts` – Keresőmotor tesztek, a `src/search/engine.ts` funkcióit vizsgálja.
- `ingredientsStack.spec.tsx` – Hozzávaló stack komponens tesztje.
- `relevance.spec.ts` – Keresési relevanciát ellenőrző tesztek.
- `test_services.py` – Python szolgáltatás teszt a `dashboard` modulhoz.

## types
- `brew.ts` – Főzési típusdefiníciók, a `lib/brew.*` és `tests/brewing.api.spec.ts` is importálja.

## utils
- `category-distribution.ts` – Kategóriaeloszlás számítása, a `tests/category-distribution.spec.ts` hivatkozik rá.
- `colorMap.ts` – Színleképezések, a `components/ColorCup.tsx` és `public/colorCup.png` asset kapcsolódik.
- `filter.ts` – Általános szűrési segédfüggvények, több `components` fájl használja.
- `mandala.ts` – Mandala erőforrások kezelését végzi, a `components/panels/MandalaBackground.tsx` hívja.

## vercel
- `ignored-build.sh` – Build lépések figyelmen kívül hagyására szolgáló script; a `vercel.json`-nal együtt működik.
