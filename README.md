# Kris' Lab

Kris' Lab is a React + TypeScript + Vite project that presents frontend experiments inside a calm, desktop-like shell.

Instead of shipping a generic marketing site or a component dump, this repo explores interaction, motion, and interface craft through a small set of self-contained projects that live inside a shared OS-inspired environment.

## What This Is

Kris' Lab is best thought of as a personal product lab:

- a lightweight shell that feels like a small operating system
- a project window model for opening individual experiments
- a curated set of interactive pieces, each with its own visual language
- a codebase designed to keep shell concerns and piece concerns separate

This makes the repo useful for:

- developers studying interaction architecture and piece isolation
- recruiters or collaborators reviewing frontend craft and engineering taste
- technical evaluators looking for code organization, motion handling, and accessibility awareness
- potential clients or users who want to understand the kind of interface work this lab can produce

## Why It Exists

Most UI portfolios flatten everything into screenshots or one-off pages.

Kris' Lab takes a different approach: it provides a consistent shell for exploring multiple experiments while preserving the autonomy of each piece. The shell establishes context, navigation, and framing. Each project is still free to behave like its own experiment.

That separation is one of the core ideas of the repo.

## Current Experience

Today, the app includes:

- a desktop-like shell with a launcher, dock, system bar, draggable windows, and background selection
- a project routing model based on approved pieces
- reduced-motion support for animated interactions
- three public experiments currently exposed through the shell

### Current Projects

1. `Trip to Malta`
   A photo-focused project presented through the shell's folder metaphor.

2. `Rollin' Search`
   An animated search control with a playful open/close motion system.

3. `Access Card`
   A role-based access control motion component with layered device, display, beam, and scan behavior.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Motion (`motion/react`)
- tsParticles for particle-based scan effects in the Access Card piece
- ESLint for linting

## How It Works

The app exposes approved projects through a shell-driven route model:

- `/` opens the main shell experience
- `/project/:slug` opens a specific approved project inside the shell
- approved pieces are registered manually in `src/pieces/registry.ts`

The shell is intentionally restrained. It should frame the work, not overpower it.

Each piece remains localized to its own folder, with its own `Piece.tsx`, `meta.ts`, and styles when needed.

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, typically:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` starts the local Vite dev server
- `npm run build` runs TypeScript build checks and creates a production bundle
- `npm run preview` serves the production build locally
- `npm run typecheck` runs an app-only TypeScript check
- `npm run lint` runs ESLint

## Project Structure

```text
src/
  host/         Shared project window host
  lib/          Small technical helpers (motion, navigation, reduced motion, windowing)
  pieces/       Self-contained experiments and the manual piece registry
  shell/        Desktop-like shell, launcher, dock, backgrounds, and runtime
  router.tsx    Route entry points
```

### Piece Model

Each piece has:

- a `slug`
- a `title`
- a `description`
- a `status`
- a `mode`
- an `order`

Supported statuses:

- `exploration`
- `candidate`
- `approved`
- `archived`

Supported modes:

- `hosted` for pieces rendered inside the normal project window
- `isolated` for pieces that need stronger document-level freedom

Only approved, hosted, public-ready pieces are surfaced through the shell.

## Adding a New Piece

1. Copy `src/pieces/_template`
2. Rename the folder
3. Update `meta.ts`
4. Build the piece inside its own folder
5. Keep logic and styling local unless sharing is clearly justified
6. Register the piece in `src/pieces/registry.ts`
7. Use `mode: 'hosted'` unless the piece truly needs an isolated document context

## Design and Engineering Principles

- Keep the shell calm and secondary to the work it contains
- Keep pieces autonomous
- Prefer small, readable solutions over abstraction-heavy ones
- Respect reduced-motion behavior
- Avoid turning the repo into a generic component library or SaaS-style UI
- Keep heavy logic and dependencies out of the shell path when possible

## Repository Status

This repository is an active frontend lab, not a finished product in the traditional sense.

What is stable today:

- the shell-and-piece architecture
- the public project registry model
- the current set of approved pieces

What is likely to keep evolving:

- new experiments under `src/pieces`
- shell polish and runtime behavior
- project presentation, motion detail, and refinement quality

## Contributing

There is no formal open contribution workflow yet.

If you want to explore or extend the project:

- read `AGENTS.md` first if you are using an AI coding agent
- start from the nearest owning layer instead of scanning the whole repo
- keep shell changes and piece changes clearly separated
- avoid broad refactors unless they are truly required

For shell-specific design constraints, see `docs/shell/DESIGN.md`.

## For Evaluators

If you are reviewing this repo as a recruiter, collaborator, or client, the best places to start are:

- `README.md` for the product and architecture overview
- `src/shell/` for the desktop-like shell runtime and UI framing
- `src/pieces/` for the experiments themselves
- `src/pieces/access-card/` for a motion-heavy, detail-oriented example
- `AGENTS.md` for implementation discipline and repo constraints

## License

No license file is currently included in this repository.
