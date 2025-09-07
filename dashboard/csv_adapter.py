import csv
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List

from app.models import Tea, IngredientPart, ServTempModes

DEFAULT_TIME_OF_DAY = "bármikor"
DEFAULT_SEASON = "egész év"


def _parse_float(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value).strip().replace(",", ".")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _parse_bool(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    s = str(value).strip().lower()
    return s not in ("", "0", "false", "no", "nem", "n")


def convert_csv(input_path: Path) -> tuple[List[Tea], Dict[str, int]]:
    teas: List[Tea] = []
    qa_errors = 0
    default_day = 0
    default_season = 0

    with input_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            tea: Dict[str, Any] = {}
            tea["id"] = str(row.get("id") or idx + 1)
            tea["name"] = (row.get("name") or "").strip()
            tea["category"] = (row.get("category") or "").strip()
            subcat = (row.get("subcategory") or "").strip()
            if subcat:
                tea["subcategory"] = subcat
            sd = (row.get("mood_short") or row.get("shortDescription") or "").strip()
            if sd:
                tea["shortDescription"] = sd
            desc = (row.get("description") or "").strip()
            if desc:
                tea["description"] = desc

            # Ingredients
            breakdown: List[IngredientPart] = []
            for i in range(1, 7):
                name = (row.get(f"ingredient-{i}") or row.get(f"ingerdient-{i}") or "").strip()
                rate = _parse_float(row.get(f"rate-{i}"))
                if name and rate is not None:
                    breakdown.append(IngredientPart(name=name, rate=rate))
            if breakdown:
                tea["ingredientsBreakdown"] = breakdown
                tea["ingredients"] = [b.name for b in breakdown]
                total = sum(b.rate for b in breakdown)
                if not (99.9 <= total <= 100.1):
                    qa_errors += 1
            else:
                tea["ingredientsBreakdown"] = []
                tea["ingredients"] = []

            # Taste profile
            tastes = [k[len("taste_"):] for k, v in row.items() if k.startswith("taste_") and _parse_float(v) and _parse_float(v) > 0]
            tea["tastes"] = tastes
            intensity = (row.get("intensity") or "").strip().lower()
            if intensity:
                tea["intensity"] = intensity

            # Effects
            use_cases = (row.get("useCases") or "").strip()
            effects: List[str] = []
            if use_cases:
                effects = [e.strip() for e in re.split(r"[,;]", use_cases) if e.strip()]
            else:
                if (_parse_float(row.get("focus_relax")) or 0) >= 2:
                    effects.append("nyugtató")
                if (_parse_float(row.get("focus_focus")) or 0) >= 2:
                    effects.append("fókusz")
                if (_parse_float(row.get("focus_immunity")) or 0) >= 2:
                    effects.append("immunerősítő")
                if (_parse_float(row.get("focus_detox")) or 0) >= 2:
                    effects.append("tisztító")
            tea["effects"] = effects

            # Serve temperature modes
            serv = ServTempModes(
                hot=_parse_bool(row.get("serve_hot")),
                lukewarm=_parse_bool(row.get("serve_lukewarm")),
                iced=_parse_bool(row.get("serve_iced")),
                coldbrew=_parse_bool(row.get("serve_coldbrew")),
            )
            tea["servTempModes"] = serv
            if not any([serv.hot, serv.lukewarm, serv.iced, serv.coldbrew]):
                qa_errors += 1

            # Caffeine and infusion
            caf = _parse_float(row.get("caffeine_pct"))
            if caf is not None:
                tea["caffeineLevel"] = caf
                if not (0 <= caf <= 100):
                    qa_errors += 1
            temp = _parse_float(row.get("tempC"))
            tea["tempC"] = int(temp // 1) if temp is not None else 0
            steep = _parse_float(row.get("steepMin"))
            tea["steepMin"] = int(-(-steep // 1)) if steep is not None else 0
            qty = (row.get("quantity_250ml") or "").strip()
            if qty:
                m = re.search(r"\d+[\.,]?\d*", qty)
                if m:
                    tea["quantitySpoons"] = float(m.group().replace(",", "."))

            # Time of day / season
            tod = (row.get("timeDay") or "").strip().lower()
            if tod:
                tea["timeOfDay"] = tod
            else:
                tea["timeOfDay"] = DEFAULT_TIME_OF_DAY
                default_day += 1
            season = (row.get("timeSeason") or row.get("season") or "").strip().lower()
            if season:
                tea["season"] = season
            else:
                tea["season"] = DEFAULT_SEASON
                default_season += 1

            # Allergens
            allergens = [a.strip() for a in (row.get("allergens") or "").split(",") if a.strip()]
            tea["allergens"] = allergens

            # Tags
            tags: List[str] = []
            tags.extend(tastes[:2])
            if subcat:
                tags.append(subcat)
            uniq_tags: List[str] = []
            for t in tags:
                if t not in uniq_tags:
                    uniq_tags.append(t)
                if len(uniq_tags) == 3:
                    break
            tea["tags"] = uniq_tags

            teas.append(Tea(**tea))

    summary = {
        "records": len(teas),
        "qa_errors": qa_errors,
        "default_timeOfDay": default_day,
        "default_season": default_season,
    }
    return teas, summary


def main():
    if len(sys.argv) < 3:
        print("Usage: python csv_adapter.py <input.csv> <output.json>")
        raise SystemExit(1)
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    teas, summary = convert_csv(input_path)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump([t.model_dump() for t in teas], f, ensure_ascii=False, indent=2)
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()