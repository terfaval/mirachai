import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from dashboard.app import services


def test_load_teas():
    teas = services.get_teas()
    assert len(teas) == 84
    assert teas[0].name


def test_filter_by_category():
    teas = services.get_teas()
    filtered = services.filter_teas(teas, category="Immunitás & Tisztulás")
    assert all(t.category == "Immunitás & Tisztulás" for t in filtered)


def test_get_category_colors():
    colors = services.get_category_colors()
    assert colors["Immunitás & Tisztulás"] == "#467209"