# Kris' Lab

Kris' Lab is a greenfield React + TypeScript + Vite app for a calm shell and a growing set of self-contained design experiments.

## Scripts

- `npm run dev` starts the local dev server.
- `npm run build` runs TypeScript project checks and builds the production bundle.
- `npm run typecheck` runs an app-only TypeScript check.
- `npm run lint` runs ESLint.

## Architecture

- `src/shell`: the operating-system layer and approved piece list.
- `src/host`: shared route wrappers for hosted and isolated pieces.
- `src/pieces`: one folder per experiment plus a manual registry.
- `src/lib`: small technical helpers for navigation, motion, reduced-motion, and cleanup.

## Adding A New Piece

1. Copy `src/pieces/_template`.
2. Rename the folder and update `meta.ts`.
3. Build the experiment inside its own folder without importing shell UI styles.
4. Register the piece in `src/pieces/registry.ts`.
5. Choose `mode: "hosted"` unless the piece needs document-level control.

## Status Model

- `exploration`: local experiment, not listed in the shell.
- `candidate`: shareable by direct URL, still hidden from the shell.
- `approved`: shown in the shell.
- `archived`: preserved in the repo and optionally still routable.
