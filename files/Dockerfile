# syntax=docker/dockerfile:1

# Linux toolchain for everything that does not need macOS: npm dependencies, the Vite dev server,
# lint, format and type checks, web and Rust tests, and the web build. The desktop app itself is
# compiled, run and bundled on the Mac (`npm run dev`, `npm run build`): macOS apps build only on
# macOS. docker-compose.yml mounts the project at /app; node_modules and the Rust build live in
# volumes. The default command serves the web UI (`docker compose up dev`).

FROM node:24.19-trixie-slim AS node

FROM rust:1.98-slim-trixie AS dev

# Libraries the Tauri crates compile against on Linux, and the Rust lint and format tools.
RUN apt-get update \
  && apt-get install -y --no-install-recommends pkg-config libwebkit2gtk-4.1-dev libxdo-dev \
  && rm -rf /var/lib/apt/lists/* \
  && rustup component add clippy rustfmt

# Node.js and npm from the official image (same Debian release).
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# A non-root user. Volumes mounted on these folders take their ownership, so npm and cargo can write.
RUN useradd --create-home --uid 1000 dev \
  && mkdir -p /app/node_modules /app/src-tauri/target /usr/local/cargo/registry \
  && chown -R dev:dev /app /usr/local/cargo/registry

USER dev
WORKDIR /app
CMD ["npm", "run", "dev:web"]
