import csv
import hashlib
import json
import re
from collections import OrderedDict
from pathlib import Path

# Canton bounding boxes (approximate lat/lon ranges)
CANTON_BOUNDS = {
    "AG": ((47.20, 47.60), (7.80, 8.45)),
    "AI": ((47.28, 47.40), (9.34, 9.45)),
    "AR": ((47.32, 47.45), (9.18, 9.50)),
    "BE": ((46.60, 47.40), (7.00, 7.95)),
    "BL": ((47.35, 47.60), (7.40, 7.90)),
    "BS": ((47.52, 47.60), (7.53, 7.63)),
    "FR": ((46.50, 46.95), (6.70, 7.35)),
    "GE": ((46.15, 46.30), (5.95, 6.30)),
    "GL": ((46.85, 47.12), (8.90, 9.20)),
    "GR": ((46.30, 46.90), (8.40, 10.50)),
    "JU": ((47.20, 47.45), (6.90, 7.60)),
    "LU": ((46.80, 47.25), (7.90, 8.55)),
    "NE": ((46.80, 47.15), (6.60, 7.15)),
    "NW": ((46.90, 47.05), (8.30, 8.50)),
    "OW": ((46.75, 46.95), (8.00, 8.40)),
    "SG": ((47.10, 47.65), (8.70, 9.75)),
    "SH": ((47.65, 47.80), (8.50, 8.75)),
    "SO": ((47.10, 47.40), (7.30, 7.75)),
    "SZ": ((46.90, 47.20), (8.45, 9.05)),
    "TG": ((47.40, 47.70), (8.70, 9.45)),
    "TI": ((45.80, 46.55), (8.45, 9.30)),
    "UR": ((46.60, 46.95), (8.40, 8.90)),
    "VD": ((46.20, 47.00), (6.05, 7.20)),
    "VS": ((45.80, 46.50), (6.80, 7.95)),
    "ZG": ((47.05, 47.25), (8.40, 8.75)),
    "ZH": ((47.20, 47.65), (8.40, 8.95)),
}

EXCLUDED_INSTITUTIONS = {
    "CH",
    "Allgemeinspital, Grundversorgung (Niveau 4)",
    "Allgemeinspital, Zentrumsversorgung (Niveau 1, Universitätsspital)",
    "Cliniche specializzate chirurgia",
    "Clinique spécialisée Pédiatrie",
    "Hôpital de soins généraux, prise en charge centralisée (niveau 2)",
    "Hôpital de soins généraux, soins de base (niveau 5)",
    "Ospedali per cure generali, cure di base (livello 3)",
    "Institution",
    "institution",
    "instituzione",
}

MANUAL_CANTON_OVERRIDES = {
    "Adus Medica AG": "ZH",
    "Berit Klinik Goldach": "SG",
    "Eulachklinik AG": "ZH",
    "Geburtshaus Delphys": "ZH",
    "Geburtshaus Luna AG": "ZH",
    "Geburtshaus St.Gallen GmbH": "SG",
    "Geburtshaus Stans GmbH": "NW",
    "Geburtshaus Tagmond GmbH": "TG",
    "Geburtshaus Terra Alta": "ZH",
    "Geburtshaus Winterthur AG": "ZH",
    "Geburtshaus Zürcher Oberland AG": "ZH",
    "Geburtshaus ambra GmbH": "BE",
    "Genossenschaft Geburtshaus Simmental-Saanenland Maternité Alpine": "BE",
    "Klinik Tiefenbrunnen AG": "ZH",
    "Limmatklinik AG": "ZH",
    "Maison de Naissance Tilia Sàrl": "NE",
    "Maison de Naissance le Petit Prince": "NE",
    "Maison de naissance La Roseraie": "FR",
    "Maison de naissance Les Cigognes": "VD",
    "Nouvelle Clinique Vert-Pré": "NE",
    "Uroviva Klinik AG": "ZH",
    "Venenklinik Bellevue AG": "TG",
}


def parse_overrides(path: Path) -> dict:
    overrides = {}
    inside = False
    pattern = re.compile(r'"(?P<name>.*)": \{ type: "(?P<type>[^"]+)", canton: "(?P<canton>[^"]+)" \},?')
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("const hospitalMetadataOverrides = {"):
            inside = True
            continue
        if inside:
            if stripped.startswith("};"):
                break
            if not stripped:
                continue
            match = pattern.match(stripped)
            if match:
                overrides[match.group("name")] = match.group("canton")
    return overrides


def load_institutions(csv_path: Path) -> list:
    institutions = OrderedDict()
    overrides = parse_overrides(Path("static/js/ch_hospital.js"))
    with csv_path.open(encoding="utf-8-sig") as handle:
        reader = csv.reader(handle, delimiter=';')
        next(reader, None)
        for row in reader:
            if len(row) < 10:
                continue
            name = row[0].strip()
            indicator = row[1].strip()
            cases = row[9].strip()
            if not name or name in EXCLUDED_INSTITUTIONS:
                continue
            if not indicator or cases in {"", "0"}:
                continue
            if name not in institutions:
                canton = overrides.get(name) or MANUAL_CANTON_OVERRIDES.get(name)
                if canton:
                    institutions[name] = canton
    return list(institutions.items())


def hash_to_range(text: str, bounds: tuple[tuple[float, float], tuple[float, float]]) -> tuple[float, float]:
    lat_range, lon_range = bounds
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    lat_fraction = int.from_bytes(digest[:8], "big") / 2**64
    lon_fraction = int.from_bytes(digest[8:16], "big") / 2**64
    lat = lat_range[0] + lat_fraction * (lat_range[1] - lat_range[0])
    lon = lon_range[0] + lon_fraction * (lon_range[1] - lon_range[0])
    return round(lat, 6), round(lon, 6)


def build_coordinate_map() -> OrderedDict:
    institutions = load_institutions(Path("static/data/qip23_tabdaten.csv"))
    coordinates = OrderedDict()
    for name, canton in institutions:
        bounds = CANTON_BOUNDS.get(canton)
        if not bounds:
            continue
        lat, lon = hash_to_range(f"{canton}:{name}", bounds)
        coordinates[name] = {"lat": lat, "lon": lon, "canton": canton}
    return coordinates


def export(path: str = "static/data/hospital_coordinates.json") -> None:
    data = build_coordinate_map()
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    export()
