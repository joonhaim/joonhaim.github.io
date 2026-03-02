#!/usr/bin/env python3
"""Extract F-coded procedure metrics from the raw QIP dataset.

This utility trims the heavy ``qip23_tabdaten.csv`` export down to the
numerical fields that power the CH-IQI dashboard.  The resulting file keeps
only F-coded procedures (the ones surfaced in the public interface) and writes
minified JSON for quick loading in the browser.
"""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List

EXCLUDED_INSTITUTIONS = {
    "CH",
    "Allgemeinspital, Grundversorgung (Niveau 4)",
    "Allgemeinspital, Zentrumsversorgung (Niveau 1, Universitätsspital)",
    "Cliniche specializzate chirurgia",
    "Clinique spécialisée Pédiatrie",
    "Hôpital de soins généraux, prise en charge centralisée (niveau 2)",
    "Hôpital de soins généraux, soins de base (niveau 5)",
    "Ospedali per cure generali, cure di base (livello 3)",
}

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE = REPO_ROOT / "static" / "data" / "qip23_tabdaten.csv"
DEFAULT_TARGET = REPO_ROOT / "static" / "data" / "qip23_f_procedures.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help="Path to the raw qip23_tabdaten.csv export.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_TARGET,
        help="Destination for the filtered JSON dataset.",
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=None,
        help="Pretty-print the JSON with the supplied indentation (default: minified).",
    )
    return parser.parse_args()


def _clean_numeric(value: str) -> str:
    return (
        value.replace("\u00a0", "")
        .replace("'", "")
        .replace("%", "")
        .replace(" ", "")
        .strip()
    )


def parse_integer(value: str) -> int:
    if value is None:
        return 0
    cleaned = _clean_numeric(str(value))
    if not cleaned or cleaned in {"*", "-"}:
        return 0
    try:
        return int(cleaned)
    except ValueError:
        return 0


def parse_float(value: str) -> float | None:
    if value is None:
        return None
    cleaned = _clean_numeric(str(value)).replace(",", ".")
    if not cleaned or cleaned in {"*", "-"}:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def normalise_code(indicator: str) -> str:
    if not indicator:
        return ""
    return indicator.split(" ", 1)[0].strip()


def extract_rows(source: Path) -> List[dict]:
    rows: List[dict] = []
    with source.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle, delimiter=";")
        next(reader, None)  # discard header
        for raw in reader:
            if not raw or len(raw) < 10:
                continue
            institution = raw[0].strip()
            indicator = raw[1].strip()
            if not institution or institution in EXCLUDED_INSTITUTIONS or not indicator:
                continue
            code = normalise_code(indicator)
            if not code or not code.endswith(".F"):
                continue
            cases2023 = parse_integer(raw[9])
            if cases2023 <= 0:
                continue
            entry = {
                "institution": institution,
                "code": code,
                "cases2023": cases2023,
                "observedHistorical": parse_float(raw[2]),
                "expectedHistorical": parse_float(raw[3]),
                "smrHistorical": parse_float(raw[4]),
                "casesHistorical": parse_integer(raw[5]),
                "observed2023": parse_float(raw[6]),
                "expected2023": parse_float(raw[7]),
                "smr2023": parse_float(raw[8]),
            }
            rows.append(entry)
    rows.sort(key=lambda item: (item["code"], item["institution"]))
    return rows


def write_output(rows: Iterable[dict], destination: Path, indent: int | None, source: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    rows_list = list(rows)
    try:
        source_rel = source.resolve().relative_to(REPO_ROOT)
    except ValueError:
        source_rel = source
    payload = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": str(source_rel),
        "rowCount": len(rows_list),
        "rows": rows_list,
    }
    with destination.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=indent, separators=None if indent else (",", ":"))


def main() -> None:
    args = parse_args()
    rows = extract_rows(args.source)
    write_output(rows, args.output, args.indent, args.source)


if __name__ == "__main__":
    main()
