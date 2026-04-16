# Boundaries

## Purpose

This document defines ownership boundaries between:

1. shell/system law
2. app container law
3. app-internal freedom

Its purpose is to keep the shell coherent without turning it into a universal design system for all pieces.

Use this file when a task touches:

- shell chrome
- project window framing
- hosted piece presentation
- isolated route framing
- the visual or behavioral boundary between shell UI and piece UI

If a change risks blurring shell ownership and piece ownership, this file is the source of truth.

## Boundary Model

Kris' Lab has three distinct layers:

1. **Global shell and system invariants**
2. **App container invariants**
3. **App-internal freedom**

These layers must stay separate.

Do not merge them visually, structurally, or behaviorally.

## 1. Global Shell And System Invariants

This layer owns the operating-system-like grammar of the shell.

The shell standardizes:

- the system bar
- the dock
- launcher window chrome
- project window outer frame language
- traffic-light controls
- shell toolbar and sidebar behavior
- shell spacing rhythm
- shell UI type scale
- shell timing and reduced-motion behavior
- shell surface hierarchy
- shell radius language
- shell border and divider language
- shell shadow and depth language
- shell iconography for chrome-owned controls

If an element functions as shell chrome, frames the work, or communicates system-level structure, it belongs to this layer.

## 2. App Container Invariants

This layer defines the shell-owned contract around hosted app presentation.

It includes:

- project window outer framing
- titlebar presence and traffic-light placement
- the boundary between shell chrome and app stage
- the rule that project stages remain solid content surfaces
- shell-managed close and navigation affordances
- hosted-route containment and overflow expectations

In practice:

- the launcher is shell UI
- the project window frame is shell UI
- the project stage is app territory inside a shell-owned container

For isolated routes, the shell may still provide minimal framing or return controls, but isolated pieces are allowed more document-level freedom than hosted windows.

That freedom does not transfer shell law into the piece, and it does not allow the piece to redefine shell law.

## 3. App-Internal Freedom Zone

Inside the app stage, pieces are free to diverge in:

- layout structure
- visual language
- typography system
- internal color system
- internal motion language
- rendering approach
- mood and composition
- piece-owned controls

This freedom is deliberate.

The shell exists to contain diverse work, not to standardize it.

## What Shell Chrome May Impose On Apps

Shell chrome may impose:

- the outer frame
- shell-owned titlebar controls
- shell-owned navigation chrome
- shell spacing and type decisions within shell chrome only
- the separation between chrome and content
- focus and interaction behavior for shell-owned controls

Shell chrome may also require that apps do not visually or behaviorally break shell ownership boundaries.

## What Shell Chrome May Never Impose On Apps

Shell chrome may never impose:

- an app's internal art direction
- an app's internal layout system
- an app's internal motion language
- an app's internal color palette
- a shared card or dashboard pattern for all apps
- shell-style translucency inside app content by default
- a universal component abstraction for piece internals

If the shell starts dictating app aesthetics beyond the container edge, it has exceeded its role.

## Must Stay Consistent

The following must stay consistent across shell-owned contexts:

- top bar and shell-owned status presentation
- dock structure and feedback language
- window frame proportions and depth logic
- titlebar control placement and behavior
- shell spacing rhythm
- shell chrome typography
- shell control states
- shell material hierarchy

## Allowed To Diverge

The following may diverge by piece:

- app content background treatment
- app typography
- app-specific controls
- app-specific motion
- illustration and rendering style
- internal composition and emotional tone

This divergence may be strong, as long as shell chrome remains intact and ownership stays legible.

## Ownership Test

Use these questions to resolve ambiguity:

- Does this element frame the work? → shell-owned
- Does this element separate shell chrome from piece content? → container law
- Does this element define how the work itself looks, moves, or feels? → piece-owned

If ownership is unclear, preserve the shell/content boundary rather than blending the systems.

## Explicit Examples

### Must stay consistent

- A new project may look radically different inside the stage, but its outer window frame must still use shell-owned chrome.
- A hosted piece may use bold internal motion, but the shell dock, titlebar, and sidebar must keep shell timing and state behavior.
- A project can present its own internal UI, but it must not restyle shell traffic lights or project window chrome.

### Allowed to diverge

- One piece may be typographic and quiet while another is graphic and kinetic.
- One piece may use dark internal surfaces while another uses bright editorial surfaces.
- An isolated piece may take broader control of the document surface than a hosted piece.

### Not allowed

- Turning project stages into another shell-like glass layer.
- Making app internals imitate shell chrome closely enough to blur ownership.
- Pulling shell chrome patterns into every piece by default.
- Making hosted piece content look like an extension of shell chrome rather than content inside a shell-owned container.

## Boundary Rule Of Thumb

If the question is, “does this help the shell frame the work?” it is probably shell law.

If the question is, “does this describe how the work itself should look or move?” it belongs to the app, not the shell.

If the answer is visually ambiguous, preserve the boundary rather than merging the systems.