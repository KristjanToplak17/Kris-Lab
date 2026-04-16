# Kris' Lab

Kris' Lab is a React + TypeScript + Vite project for a calm shell and a growing set of self-contained design experiments.

It is not a generic SaaS app, marketing site, or component-library exercise. The shell stays restrained. The pieces stay autonomous.

## What This Repo Contains

- a shell layer that frames the work without competing with it
- a host layer for routing and piece presentation
- a set of independent experiments under `src/pieces`
- a small `src/lib` layer for practical technical helpers

## Tech Stack

- React
- TypeScript
- Vite

## Scripts

- `npm run dev` starts the local dev server
- `npm run build` runs TypeScript checks and builds the production bundle
- `npm run typecheck` runs an app-only TypeScript check
- `npm run lint` runs ESLint

## Architecture

- `src/shell` — operating-system layer and approved piece list
- `src/host` — shared route wrappers for hosted and isolated pieces
- `src/pieces` — one folder per experiment plus the manual registry
- `src/lib` — small technical helpers for navigation, motion, reduced-motion, and cleanup

## Piece Model

Each experiment lives in its own folder and should remain as self-contained as possible.

### Modes

- `hosted` — rendered inside the normal shell project window
- `isolated` — used only when a piece needs stronger document-level freedom

### Statuses

- `exploration` — local experiment, not listed in the shell
- `candidate` — direct-linkable, still hidden from the shell
- `approved` — visible in the shell
- `archived` — preserved in the repo and hidden unless intentionally surfaced

## Adding a New Piece

1. Copy `src/pieces/_template`
2. Rename the folder and update `meta.ts`
3. Build the experiment inside its own folder
4. Keep styling local to that piece
5. Register the piece in `src/pieces/registry.ts`
6. Choose `mode: "hosted"` unless document-level control is genuinely required

## Working in This Repo

If you are contributing code manually, start by understanding the nearest owning layer before making changes.

If you are using an AI coding agent, read `AGENTS.md` first. That file defines:

- how agents should search the codebase
- implementation constraints
- performance and simplicity rules
- what not to change or overcomplicate

For shell-specific design law, see `docs/shell/DESIGN.md`.

## Project Principles

- keep the shell calm, clear, and low-noise
- keep pieces autonomous
- prefer minimal, readable solutions
- avoid unnecessary abstraction
- respect reduced-motion behavior
- keep heavy logic and heavy dependencies out of the shell path when possible