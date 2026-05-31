# Swiss Hospital Insights

This directory is the self-contained source for the Swiss Hospital Insights
(CH-IQI) dashboard. Copying this directory preserves the dashboard pages,
styles, browser logic, datasets, images, favicon assets, and dataset preparation
tools without requiring files from the portfolio site's shared `static/` or
`scripts/` directories.

## Directory layout

- `index.html` — English dashboard entry point.
- `de/`, `fr/`, `it/` — translated dashboard entry points.
- `methodology/` — methodology page.
- `assets/css/` — dashboard-only styles.
- `assets/js/` — dashboard-only browser logic.
- `assets/data/` — source and browser-ready CH-IQI datasets.
- `assets/images/` — canton graphics and CH-IQI preview assets.
- `assets/favicons/` — dashboard favicon and web-manifest assets.
- `tools/` — scripts for rebuilding browser-ready data assets.

## Exporting the dashboard

Copy the project directory and serve the exported directory over HTTP:

```bash
cp -R projects/swiss-hospital-insights /path/to/export/swiss-hospital-insights
cd /path/to/export
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/swiss-hospital-insights/`.

The dashboard entry points and internal assets use relative paths, so the
exported directory can be hosted below any URL prefix. The portfolio-home links
in the page chrome intentionally navigate outside the dashboard and can be
updated or removed when embedding it in another site.

## Runtime dependencies

The interactive map loads Leaflet 1.9.4 from `unpkg.com`. Map tiles load from
OpenStreetMap's tile service. The dashboard's own code and data remain local to
this directory.

## Rebuilding datasets

Run the tools from any working directory. Their default paths resolve against
this project directory:

```bash
python3 projects/swiss-hospital-insights/tools/generate_f_procedure_dataset.py
python3 projects/swiss-hospital-insights/tools/hospital_coordinates_builder.py
```
