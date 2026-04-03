# AGENTS.md

## Kris' Lab

Kris' Lab is a curated gallery of interactive design experiments. It is not a generic SaaS app, marketing site, dashboard, or component-library exercise. Treat it as a creative lab with a calm shell and autonomous pieces.

## Architecture Reality

- `src/shell` is the operating layer. It should stay restrained, precise, and visually quiet.
- `src/host` contains route wrappers and navigation behavior for `hosted` and `isolated` pieces.
- `src/pieces` contains one folder per experiment plus `registry.ts` and `types.ts`.
- `src/lib` holds small technical helpers. Keep it small and practical.
- New pieces should usually start by copying `src/pieces/_template`, then adding a single registry entry.

## What To Protect

### Shell

- The shell frames the work; it does not compete with it.
- Do not turn the shell into a branded spectacle, a dense UI, or a shared design system for pieces.
- Keep shell changes subtle, deliberate, and low-noise.
- Prefer small typography, spacing, transition, and information-architecture improvements over decorative additions.

### Pieces

- Each piece is an autonomous experiment with its own visual language, motion rules, and internal logic.
- Do not force shared visual abstractions across pieces unless they solve a real technical problem.
- Keep changes localized to the relevant piece folder whenever possible.
- Respect the existing piece model:
  - `hosted`: works cleanly inside the normal host route.
  - `isolated`: needs stronger route or document-level freedom.
- Respect the existing status model:
  - `exploration`: local, not listed in the shell.
  - `candidate`: direct-linkable, hidden from the shell.
  - `approved`: visible in the shell.
  - `archived`: preserved, hidden from the shell unless explicitly surfaced.

### Motion

- Motion quality matters. It should feel intentional, controlled, and emotionally precise.
- Avoid default animation presets, generic spring spam, and ornamental motion with no compositional purpose.
- Motion in the shell should be restrained. Motion inside pieces can be bolder.
- Always respect reduced-motion behavior.
- Any piece-level runtime work must clean up on unmount: listeners, RAF loops, timers, GSAP timelines, audio, WebGL resources, document classes, and body-level state.

### Qality Bar

- Work should aim to be:
  - visually precise
  - motion-refined
  - emotionally intentional
  - worth presenting publicly

- If the result feels generic, unfinished, or visually weak, call it out and improve it.

### Originality

- Reject cliche visual directions early. Call them out plainly.
- Avoid generic cards, startup gradients, dashboard patterns, template hero sections, and interchangeable "modern UI" styling.
- If a direction feels safe but forgettable, say so and propose a stronger alternative.

### Performance

- Protect first load of the shell.
- Keep heavy logic and heavy dependencies inside pieces, not the shell.
- Preserve lazy loading for pieces and avoid pulling experimental code into the shell path.
- Prefer simple DOM/CSS solutions before adding heavier animation or rendering libraries.
- Only introduce GSAP, WebGL, or similar weight when a piece genuinely needs them.

### Code Cleanliness

- Prefer minimal, localized changes over broad rewrites.
- Avoid unnecessary abstraction, premature shared frameworks, and speculative helper layers.
- Keep code readable, explicit, and easy to delete.
- Do not introduce a shared visual component system for pieces unless explicitly requested.
- Do not introduce new files, folders, or abstractions unless clearly necessary.
- Avoid expanding the system beyond the scope of the task.
- Prefer working within the existing structure unless a structural change is explicitly required.

## Collaboration Rules

- For non-trivial work, propose a short implementation plan before editing code.
- Do not do broad refactors, architecture rewrites, or folder reshuffles without approval.
- Prefer touching one piece folder, one host file, or one shell file at a time unless the task truly spans layers.
- Be honest about weak design directions, low-quality motion, or generic output. Improving taste is part of the job here.
- If a request would flatten piece autonomy or make the shell louder, flag it before implementing.
- Default behavior: propose a short plan before implementation, even if the task seems straightforward.
- Do not jump directly into coding unless explicitly instructed.
- If the task involves visual design or interaction quality, first analyze the intent and expected experience before proposing code.

## Workflow Expectation

Default workflow:

`reference analysis -> implementation -> optional Figma refinement -> polish -> performance pass`

- Start by understanding the reference, intent, and architectural impact.
- Implement in code first unless the task specifically calls for Figma-led exploration.
- Use Figma as a secondary refinement or exploration layer, not an automatic source of truth.
- If Figma and the codebase disagree, prefer the project architecture and intended experience unless told otherwise.
- When working from a reference (website, animation, visual example):
  - first analyze the structure, spacing, motion, and composition
  - explain why the reference works
  - only then propose an implementation approach

## Practical Defaults

- When adding a piece:
  - create a self-contained folder in `src/pieces`
  - keep styling local to that piece
  - add metadata in `meta.ts`
  - register it in `src/pieces/registry.ts`
  - choose `hosted` by default, `isolated` only when document-level control is justified
- When changing the shell:
  - preserve calmness
  - preserve clarity
  - preserve hierarchy
  - avoid novelty for its own sake

## Anti-Goals

- Do not turn Kris' Lab into a generic product website.
- Do not over-systematize the pieces.
- Do not add abstraction because "we might need it later."
- Do not mistake complexity for originality.

## Tool Usage

- Use browser-based analysis (e.g. Playwright) when visual or interaction references need to be deeply understood.
- Use Figma as a refinement tool when visual precision or iteration benefits from it, not as a default starting point.