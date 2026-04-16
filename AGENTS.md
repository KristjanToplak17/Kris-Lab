# AGENTS.md

## Purpose

This file tells agents how to work inside Kris' Lab.

It defines:
- agent behavior
- repository reading order
- code search strategy
- implementation discipline
- repo-wide constraints

It does not duplicate:
- onboarding and command reference in `README.md`
- shell design law in `docs/shell/*`
- refinement law in `docs/refinement/*`
- reusable task skills in `skills/*`
- one-off implementation plans in `docs/*plan*.md`

## Read Order

Read only what is relevant, but read it in the right order.

1. `README.md`
   - project overview
   - architecture summary
   - repo scripts
   - piece setup flow
   - status model

2. `docs/shell/DESIGN.md`
   - only if the task touches shell, host chrome, launcher behavior, window framing, or shell-owned interaction
   - then follow the reading order inside that file

3. `docs/refinement/taste-skill.md`
   `docs/refinement/frontend-refinement.md`
   `docs/refinement/pixel-perfect-checklist.md`
   - only if the task is explicitly about polish, refinement, craft, or visual consistency

4. `skills/analyze-web-reference/SKILL.md`
   - only when the task starts from an external website, animation, component, or visual reference

5. local code in the area you will change

## What This File Owns

This file owns:
- how agents should think before coding
- how agents should search the repo
- how agents should keep scope under control
- which repo-wide mistakes must be avoided

This file does not own:
- shell visual law
- piece art direction
- refinement checklists
- task-specific design plans
- duplicated architectural prose already covered elsewhere

## Quick Glossary

- **shell**: the OS-like framing layer in `src/shell`
- **chrome**: shell-owned UI around content
- **piece**: an autonomous experiment in `src/pieces`
- **stage**: the content area inside a shell-owned project window
- **hosted**: a piece rendered inside the normal shell-hosted project window
- **isolated**: a piece that needs document-level freedom
- **refinement**: preserve-first polish without broad redesign

## Agent Responsibilities

- Understand the request before changing code.
- State assumptions when they affect implementation.
- If multiple interpretations are plausible, surface them instead of silently choosing.
- Turn the request into explicit success criteria.
- For non-trivial work, propose a short plan before implementation.
- Read the smallest set of relevant docs and files first.
- Make the smallest change that fully solves the stated problem.
- Validate the result with the smallest meaningful repo check.
- Report what changed, what was verified, and any remaining uncertainty.

## Repository Search Strategy

Start with the file that most directly owns the behavior you are changing.
Move outward only when necessary.

Use these entry points:

### Project overview and validation
- `README.md`
- `package.json`

### Routing and what becomes public
- `src/router.tsx`
- `src/shell/ShellRoute.tsx`
- `src/pieces/registry.ts`
- `src/pieces/types.ts`

### Shell runtime and chrome/content boundaries
- `src/shell/ShellLayout.tsx`
- `src/host/ProjectWindow.tsx`

### Motion and accessibility behavior
- `src/lib/motion.ts`
- `src/lib/reduced-motion.ts`

### New piece scaffolding
- `src/pieces/_template/*`

### Local experiment behavior
- the target folder in `src/pieces/<slug>/`

### Small technical helpers
- `src/lib/*`

Rules:
- Start at the nearest owner file.
- Do not scan the whole repo by default.
- If a doc already answers the question, use the doc.
- If code reality and a doc disagree, call out the mismatch before changing behavior.

## Code Generation Rules

### Think Before Coding

- Do not guess at ambiguous product intent.
- If something is unclear, say exactly what is unclear.
- If a simpler solution exists, propose it.
- Do not hide confusion behind implementation.
- Do not jump from vague intent to code without first defining what success looks like.

### Simplicity First

- Prefer the minimum code that solves the task well.
- No speculative features.
- No abstractions for one-off use.
- No configurability that was not requested.
- No defensive complexity for scenarios this repo does not actually face.
- If the solution feels overbuilt, simplify it.

### Surgical Changes

- Touch only the files and lines needed for the task.
- Do not refactor adjacent code unless the task requires it.
- Match the local style of the area you touch.
- Remove only the imports, variables, functions, and styles made obsolete by your own change.
- If you notice unrelated technical debt, mention it separately instead of folding it into the task.

### Goal-Driven Verification

- For bugs, identify a reproduction path before fixing them.
- For behavior changes, define what should now be true in the UI, interaction, routing, motion, or code path.
- Run the smallest meaningful validation command from `package.json` before finishing.
- Do not claim something is fixed if you did not verify the affected behavior.
- Preserve keyboard, focus, and reduced-motion behavior when changing interactive UI.

## Repo-Wide Constraints

- Kris' Lab is a creative lab, not a generic SaaS app, marketing site, dashboard, or shared component-library exercise.
- The shell is a restrained framing layer. It should not become louder than the work it contains.
- Pieces are autonomous. Do not impose a shared internal visual system across pieces unless solving a real technical problem.
- Keep heavy logic and heavy dependencies out of the shell path when possible.
- Preserve lazy loading and localized piece ownership.
- Prefer DOM/CSS and existing `motion/react` patterns before introducing heavier tooling.
- Always respect reduced motion.
- Any runtime side effect you add must clean up on unmount.

## When Changing The Shell

- Follow `docs/shell/DESIGN.md` and the shell docs it points to.
- Optimize for calmness, hierarchy, consistency, and boundary clarity.
- Treat shell-owned chrome and piece-owned content as separate systems.
- Do not restyle piece internals to match shell chrome.
- Do not turn shell refinement into spectacle.

## When Changing Or Adding A Piece

- Keep changes local to that piece folder unless the task truly crosses layers.
- Start from `src/pieces/_template/` for new pieces.
- Use `hosted` by default.
- Choose `isolated` only when document-level freedom is genuinely required.
- Do not expose a piece publicly until its metadata and registry state are intentionally ready.
- Keep styling and behavior self-contained unless shared code is clearly justified.

## Refinement And Reference Work

- For external reference analysis, use `skills/analyze-web-reference/SKILL.md`.
- For polish work, use the refinement docs as a preserve-first refinement layer, not as redesign permission.
- Analyze references before proposing implementation.
- Use Figma only when it helps refinement or exploration; it is not a higher authority than repo docs or code.

## Anti-Patterns

Avoid:
- generic cards
- startup gradients
- dashboard patterns
- template hero sections
- shell spectacle
- glass everywhere
- generic spring cascades
- architecture expansion "for future flexibility"
- broad refactors hidden inside a small task
- pulling shell patterns into every piece by default
- changing unrelated code or docs just because they looked improvable

## Done Means

A task is done when:
- the change directly satisfies the request
- scope stayed controlled
- relevant docs and local code were consulted
- the affected behavior was verified
- no avoidable complexity or unrelated churn was introduced