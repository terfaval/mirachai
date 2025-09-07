
# Új kategória hozzáadása

Ez a projekt több helyen is használja a teák kategóriáit. Ha új kategória kerül be vagy módosul a lista, az alábbi fájlokban kell frissítést végezni:

1. **`data/teas.json`** – minden teánál állítsd be az új `category` értéket. Érdemes egy scriptet írni, ami az `origin` vagy más mezők alapján végzi a tömeges cserét.
2. **`data/colorScale.json`** – add hozzá az új kategóriát a színkódjaival, hogy a felület tudja használni.
3. **`tests/test_services.py`** – frissítsd a teszteket, hogy az új vagy módosított kategóriát használják.


A módosítások után futtasd a teszteket:

```bash
pytest
```

Ha más adathalmaz vagy dokumentáció is hivatkozik a kategóriákra, azokat is igazítsd az új elnevezésekhez.

## Jelenlegi kategóriák és színkódjaik

| Kategória | Szín | Hex |
| --- | --- | --- |
| Álom Kapu | halvány levendula lila | `#C8B8DB` |
| Afrika Frissességei | terrakotta narancs | `#E26B39` |
| Évszakok Zamata | közép zöld | `#6DA544` |
| Európai Gyógyfüvek | zsályazöld | `#8AA88A` |
| Andoki Lendület | mélykék türkiz | `#2A9DAF` |
| Finom Védelem | mély vörös | `#B23A48` |
| Csendes Idő | világos szürke-kék | `#AAB9C3` |
| Tiszta Fókusz | citromsárga | `#EBCB4A` |
| Indiai Chai | fűszeres barna | `#A0522D` |
| Hűs Kortyok | jégkék | `#7EC8E3` |
| Japán Zöld | matcha zöld | `#5A8F3B` |
| Közel-Kelet Illata | sivatagi arany | `#C89B3C` |
| Kínai Klasszikus | mély jade zöld | `#317873` |

Frissítsd ezt a táblázatot is, ha új kategória vagy szín kerül be a rendszerbe.