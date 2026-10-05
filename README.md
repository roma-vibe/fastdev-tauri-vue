# Tauri + Vue

A [fastDev](https://github.com/roma-vibe/fastDev) skeleton (`tauri-vue`) for **native macOS desktop apps**: Tauri 2 with a Rust core and SQLite, and a Vue 3 + TypeScript + Tailwind CSS 4 interface in the system WebView — the same stack as fastDev itself. A new project opens its app window on the first `npm run dev` and builds a `.app` and a `.dmg` with `npm run build`.

Choose it for small, fast desktop tools and local-first apps for the Mac: a ~6 MB app instead of a bundled browser, business logic in Rust, a web UI with hot reload.

## Stack

| Layer | What | Version |
| --- | --- | --- |
| Desktop shell | Tauri (window, IPC, bundler), `tauri-plugin-log` | 2.12 |
| Core | Rust, edition 2024; `rusqlite` with bundled SQLite; `thiserror` | 1.90+; 0.40 |
| UI | Vue, Vue Router, Pinia, Tailwind CSS | 3.5, 5, 4, 4.3 |
| Build | Vite, TypeScript, vue-tsc | 8, 6.0, 3 |
| Quality | ESLint + typescript-eslint + eslint-plugin-vue, Prettier, Vitest + happy-dom, Clippy, rustfmt | 10, 3, 5 |
| Runtime tools | Node.js (scripts, Tauri CLI), npm | 24+, 10+ |
| Docker image | `rust:1.98-slim-trixie` + Node.js 24 + WebKitGTK dev libraries | — |

Lockfiles (`package-lock.json`, `src-tauri/Cargo.lock`) pin every dependency.

## What a new project gets

- **An app window** with a macOS look: transparent title bar with traffic lights, a sidebar, light and dark appearance, system font; the window title, menu bar, Dock and `.app`/`.dmg` names come from `APP_NAME` in `.env`.
- **The Notes example through every layer:** Vue page → Pinia store → typed API client (`src/api`, the only module calling `invoke`) → Tauri command → service (rules) → repository (SQL) → SQLite with migrations (`PRAGMA user_version`). Errors reach the UI as `{ code, message }`; internal details are only logged.
- **A Home page** showing the name, version, build type and data folder reported by Rust.
- **Data in the right place:** development builds use the project's `data/` folder, release builds `~/Library/Application Support/<APP_IDENTIFIER>`; logs in `~/Library/Logs/<APP_IDENTIFIER>`.
- **Configuration in `.env` only:** `scripts/tauri.ts` applies `APP_NAME`, `APP_IDENTIFIER` and `WEB_PORT` to every Tauri CLI run (`tauri.conf.json` keeps placeholders); Vite reads the same `.env` with Node's built-in parser.
- **Tests on both sides** (9 Rust, 22 TypeScript) and a quality gate with zero warnings: `npm run check` = ESLint + Clippy + Prettier + rustfmt + vue-tsc + Vitest + cargo test.
- **Release build:** optimized, ad-hoc signed `.app` (~6 MB) and `.dmg` (~3 MB), minimum macOS 14.
- `AGENTS.md` (architecture, how to add a feature, command, page, migration or plugin, definition of done), `SPEC.md` for the product, `README.md`, an app icon source (`app-icon.svg`) and generated icons.

## Options

**Docker** (`choices.docker`). A macOS app cannot run in a Linux container: the app window, the Rust build and the `.app`/`.dmg` always stay on the Mac. Docker takes over what runs in Linux.

| Option | Where things run | Adds |
| --- | --- | --- |
| `none` — No Docker | Everything on the Mac (Node.js, Rust). | — |
| `run` — Docker for checks (**default**) | Development and builds on the Mac. `docker compose run --rm --build check` runs `npm ci` + the full quality gate (UI and Rust, Clippy on Linux) in a clean container, like CI. | `Dockerfile`, `docker-compose.yml` (`check` service), `.dockerignore`; commands Docker check / Docker clean |
| `full` — Toolchain in Docker | npm packages are installed and run only in the `dev` container: Vite dev server with hot reload, lint, format, types, UI and Rust tests, web build. The Mac compiles, runs and bundles the app with Rust; Node.js there only starts the Tauri CLI (npx, locked version). | Same files (`dev` service), `WEB_TOOLCHAIN=docker`, setup in the container, commands routed through `docker compose run --rm dev …` |

There is no data storage choice: the app keeps its data on the Mac, never in containers.

## Commands of a new project

| Command | What it does |
| --- | --- |
| `npm run dev` | App window; UI hot reload, Rust rebuild and restart (primary) |
| `npm run build` | `.app` + `.dmg` in `src-tauri/target/release/bundle/` |
| `open src-tauri/target/release/bundle/macos/*.app` | Start the built app (“Open built app”) |
| `npm test` / `npm run check` | Tests / the full quality gate |
| `npm run lint` / `npm run format` | ESLint + Clippy / Prettier + rustfmt |
| `docker compose run --rm --build check` | (run) the quality gate in a clean Linux container |

Setup: `npm install` and `cargo fetch` (in `full`: build the image, `npm install` in the container, `cargo fetch`). Requirements: Node.js 24+, npm 10+, Rust (cargo) 1.90+, Xcode Command Line Tools; Docker 24+ for `run`/`full`.

## Preview

`fastdev-cli preview tauri-vue` (or “Preview without creating” in fastDev) sets up a throwaway copy and runs `npm run dev`: the app window opens on the Mac after the first Rust compile (about a minute). Try Notes (add with ⌘↩, delete, restart — the notes persist in the preview's `data/`), edit `src/pages/HomePage.vue` for hot reload. Stopping the preview closes the window.

## Repository

- `template.toml` — the manifest: requirements, options, env, setup steps, commands, verification and preview.
- `files/` — the files of a new project (`*.tmpl` files are rendered with the project name and options).
- `CHANGELOG.md` — what changed in every version.

Versions are the `vX.Y.Z` tags of this repository and never change once published.
