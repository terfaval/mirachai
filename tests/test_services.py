import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from dashboard.app import services
from dashboard.app.models import Tea


def test_load_teas():
    teas = services.get_teas(refresh=True)
    assert len(teas) == 117
    assert isinstance(teas[0], Tea)
    assert teas[0].name


def test_filter_by_category():
    teas = services.get_teas(refresh=True)
    filtered = services.filter_teas(teas, category="Finom Védelem")
    assert filtered
    assert all(t.category == "Finom Védelem" for t in filtered)


def test_filter_by_season():
    teas = services.get_teas(refresh=True)
    filtered = services.filter_teas(teas, season=["tavasz"])
    assert filtered
    assert all("tavasz" in [s.lower() for s in t.season_recommended] for t in filtered)


def test_filter_by_daypart():
    teas = services.get_teas(refresh=True)
    filtered = services.filter_teas(teas, daypart=["reggel"])
    assert filtered
    assert all("reggel" in [s.lower() for s in t.daypart_recommended] for t in filtered)


def test_get_category_colors():
    colors = services.get_category_colors()
    assert colors["Álom Kapu"] == "#C8B8DB"


def test_get_teas_refresh(tmp_path, monkeypatch):
    orig = services.DATA_FILE
    tmp = tmp_path / "teas.json"
    tmp.write_text('[{"id":1,"name":"A","category":"X","season_recommended":[],"daypart_recommended":[]}]', encoding="utf-8")
    monkeypatch.setattr(services, "DATA_FILE", tmp)
    teas = services.get_teas(refresh=True)
    assert teas[0].name == "A"
    tmp.write_text('[{"id":1,"name":"B","category":"X","season_recommended":[],"daypart_recommended":[]}]', encoding="utf-8")
    teas = services.get_teas()
    assert teas[0].name == "A"
    teas = services.get_teas(refresh=True)
    assert teas[0].name == "B"
    monkeypatch.setattr(services, "DATA_FILE", orig)
    services.get_teas(refresh=True)
    