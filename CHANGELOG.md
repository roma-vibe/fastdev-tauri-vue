# Changelog

## 1.0.0 — 2026-10-05

- Initial version: native macOS desktop app on Tauri 2.12 with a Rust core (edition 2024, Rust 1.90+) and a Vue 3.5 + TypeScript 6.0 + Vite 8 + Tailwind CSS 4 interface, Pinia 4 and Vue Router 5; macOS 14+.
- Notes example through every layer: Vue page, Pinia store, typed invoke client (src/api, the only module that calls Tauri), Tauri command, service, repository and SQLite (rusqlite 0.40, bundled) with SQL migrations tracked in PRAGMA user_version.
- Errors reach the UI as { code, message } (validation, not_found, internal); internal details are only logged (terminal and ~/Library/Logs/<APP_IDENTIFIER> via tauri-plugin-log).
- Name and settings only from .env: scripts/tauri.ts passes APP_NAME, APP_IDENTIFIER and WEB_PORT to the Tauri CLI as --config (tauri.conf.json keeps neutral placeholders); characters a bundle name cannot contain become spaces.
- The Rust package and binary are named after APP_SLUG (app- prefix for slugs Cargo rejects) in src-tauri/Cargo.toml and Cargo.lock, so dev builds keep their WebView data in ~/Library/{WebKit,Caches}/<APP_SLUG> per project; the library stays app_lib.
- scripts/env.ts reads .env with Node's built-in parser (util.parseEnv) for scripts/tauri.ts and vite.config.ts, so it also works without node_modules on the host.
- Data: debug builds use the project's data/ folder (ignored by the Vite watcher), release builds ~/Library/Application Support/<APP_IDENTIFIER>.
- Quality gate with zero warnings: ESLint 10, Prettier 3, vue-tsc, Vitest 5 (22 tests), Clippy -D warnings, rustfmt and cargo test (9 tests); npm install scripts policy recorded in allowScripts.
- Release build: optimized, ad-hoc signed .app (~6 MB) and .dmg (~3 MB); the .dmg skips the Finder AppleScript styling unless CI=false, so unattended builds never wait for a permission prompt.
- Requirements: Node.js 24+, npm 10+, Rust 1.90+ and the Xcode Command Line Tools (xcode-clt); Docker 24+ for the Docker options.
- Docker choice: No Docker, Docker for checks (default) and Toolchain in Docker; a macOS app cannot run in a container, so there is no data storage choice.
- Docker for checks: Docker check runs a clean npm ci and the full quality gate in a Linux container, like CI.
- Toolchain in Docker: npm packages, the Vite dev server with hot reload, checks, tests and the web build run in a container; the Mac compiles, runs and bundles the app and starts the Tauri CLI through npx.
- The Docker options' cleanup removes their containers, volumes and image after a verification and when a preview is deleted.
- Preview in fastDev: npm run dev opens the app window from a throwaway copy.
- Preview cleanup removes the app's Library folders (~/Library/WebKit and Caches/<APP_SLUG>, Logs/<APP_IDENTIFIER>) when the preview is deleted.
- Russian translations of all manifest texts.
- Verification runs check and build with Docker for checks (plus Docker check), Toolchain in Docker and No Docker.
- Checked on macOS arm64: verify; preview windows with Docker for checks and Toolchain in Docker, cleanup on delete; a project named Test "Shop" Магазин built into Test Shop Магазин.app, shows the exact name in the UI and starts with data in Application Support.
- Checked: two projects (Test "Shop" Магазин and 2 Desk → app-2-desk) run npm run dev with separate ~/Library/WebKit and Caches folders, and git status stays clean after the first cargo build.
- Checked by hand: Notes end to end, UI hot reload, Rust rebuild and restart, clean stop without orphans.
- The index.html title placeholder is filled by a replacer function, so $&, $$ and similar sequences in a project name are inserted as written.
