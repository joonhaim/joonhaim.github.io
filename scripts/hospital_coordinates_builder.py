import csv
import json
import re
from collections import OrderedDict
from pathlib import Path

import sys

sys.path.append(str(Path(__file__).parent))

from hospital_coordinates_manual import UPDATED_COORDS

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


def build_coordinate_map() -> OrderedDict:
    institutions = load_institutions(Path("static/data/qip23_tabdaten.csv"))
    coordinates = OrderedDict()
    missing = []
    for name, canton in institutions:
        if name not in UPDATED_COORDS:
            missing.append(name)
            continue
        lat, lon = UPDATED_COORDS[name]
        coordinates[name] = {"lat": lat, "lon": lon, "canton": canton}
    if missing:
        raise RuntimeError(f"Missing coordinates for {len(missing)} institutions: {', '.join(missing)}")
    return coordinates


def export(path: str = "static/data/hospital_coordinates.json") -> None:
    data = build_coordinate_map()
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


if __name__ == "__main__":
    export()
