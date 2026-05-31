# Personal Website

This repository contains the source code for my personal website: [joonhaim.github.io](https://joonhaim.github.io).

## About

This site is a simple portfolio space where I share:

- A short introduction
- Selected projects
- Writing and updates
- Contact information

## Tech Stack

- HTML
- CSS
- JavaScript

## Running Locally

To preview the website on your machine:

```bash
npm install
npm run dev
```

Then open: `http://127.0.0.1:8000`

Local preview (`npm run dev`) and Playwright tests (`npm test`) both use the same server stack: `python3 scripts/dev_server.py`.

## Project Structure

- `index.html` – homepage
- `about/` – about page
- `projects/` – project pages; `projects/swiss-hospital-insights/` is a self-contained, exportable dashboard
- `static/` – shared assets (CSS, JS, images)
- `scripts/` – utility scripts

## Git Hooks

This repo uses a custom `pre-commit` hook for staged-file checks.

- On each commit, only **staged files** are formatted with Prettier and checked with file-scoped linters.
- Full-repo checks (including `prettier --check` for non-staged files) run in CI.
- Run `npm install` once to automatically configure Git to use repo hooks via `.githooks/`.
- You can also configure it manually with `git config core.hooksPath .githooks`.

## Deployment

This site is deployed with GitHub Pages.

## License

This project is for personal use and portfolio display.
