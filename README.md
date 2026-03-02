# 🌐 Personal Website

Welcome to the source code of my personal website, [joonhaim.github.io](https://joonhaim.github.io), a minimalist portfolio showcasing some of my main projects.

## Development Notes
- Shared styles live under `static/css/shared`, and page-specific styles live under `static/css/pages`.
- Pages use folder-based routes (for example, `/about/` and `/projects/edupace/`) instead of flat root-level `.html` files.
- CH-IQI data-prep scripts live under `scripts/ch_hospital`.

## Local Preview
Use the repo-local dev server instead of IDE previews so links, includes, and assets resolve the same way every time:

```bash
npm run dev
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000).

Optional flags:
- `npm run dev -- --port 8080`
- `npm run dev -- --host 0.0.0.0 --port 8000`
