# Tauri + Vue skeleton — instructions for AI agents

This repository is a fastDev skeleton (`tauri-vue`). It is not a project: fastDev copies `files/` into
new projects and renders `*.tmpl` files. Read the fastDev skeleton authoring guide first
(MCP tool `get_authoring_guide`, or `docs/skeleton-authoring.md` in the fastDev repository).

- Change `template.toml` and `files/` only; `files/AGENTS.md.tmpl` and `files/SPEC.md.tmpl` are the
  instructions of the future projects, not of this repository.
- Do not commit, tag or edit `CHANGELOG.md` by hand: validate, verify and publish through fastDev
  (`validate_skeleton`, `verify_skeleton`, `publish_skeleton`). Publishing commits, creates the
  `vX.Y.Z` tag, pushes and updates the registry.
- Never move or delete a published tag.
- Everything is written in English.

## Things specific to this skeleton

- **The name comes from `.env` through `files/scripts/tauri.ts`.** `src-tauri/tauri.conf.json`
  (`productName: "app"`, `identifier: "com.example.app"`) keeps neutral placeholders on purpose: the
  Tauri CLI gets the real values as `--config`.
- **The Rust package is named per project.** `files/src-tauri/Cargo.toml` and the root entry of
  `files/src-tauri/Cargo.lock` keep the name `app`; `[[set]]` renames both to `APP_SLUG`, because
  macOS keeps the WebView data of unbundled dev builds in `~/Library/{WebKit,Caches}/<binary name>`.
  The library stays `app_lib`. Before copying `Cargo.toml`/`Cargo.lock` back from a scratch copy,
  rename the package to `app` again.
- **Keep Tauri versions aligned:** the `tauri` crate, `@tauri-apps/api` and `@tauri-apps/cli` on the
  same minor version. `check_skeleton_updates` covers npm only; update Rust crates by hand
  (`cargo update` in a scratch copy, then copy `Cargo.toml`/`Cargo.lock` back) and check versions with
  `cargo search` / crates.io.
- **Docker image versions** live in `files/Dockerfile` (`node:24.x-trixie-slim`, `rust:1.xx-slim-trixie`);
  bump them with the toolchain and keep the Rust version ≥ `rust-version` in `Cargo.toml`.
- **Verification is heavy:** `check` and `build` compile Rust in debug and release (a few minutes each);
  the default variant also runs `docker-check` and the `full` variant the checks in the container: both
  build a ~2.4 GB Linux toolchain image and compile the crate for Linux. The options' `cleanup`
  removes their containers, volumes and image (after verification and when a preview is deleted).
- **The preview opens a real window** on the owner's Mac (`npm run dev`); it stays open until the
  preview is stopped. `[preview] cleanup` removes the dev run's `~/Library/{WebKit,Caches}/<APP_SLUG>`
  and `~/Library/Logs/<APP_IDENTIFIER>` when the preview copy is deleted.
- After changing `files/`, also try a project by hand: `npm run dev` (window, Notes, hot reload),
  `npm run build` + `open …/*.app`, and in `full` mode `npm run dev` with Vite in the container.
