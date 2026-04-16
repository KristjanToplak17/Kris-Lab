# Interaction Grammar

## Purpose

This document defines the shell’s interaction feel and state behavior.

It governs shell-owned:

- motion
- focus
- hover
- press
- activation
- drag
- reduced-motion behavior

It does not define app-internal interaction systems.

Use this file when changing:

- shell-owned controls
- dock behavior
- titlebar, toolbar, or sidebar feedback
- window activation and drag behavior
- focus treatment in shell chrome
- reduced-motion handling for shell-owned interaction

If the interaction belongs to piece content rather than shell chrome, this file does not own it.

## Interaction Posture

The shell should feel:

- calm
- exact
- immediate
- structurally familiar

The target is desktop-native restraint, with macOS-adjacent interaction discipline but not mimicry.

In practice:

- **calm** means low-noise feedback and no decorative interaction layer
- **exact** means tight, predictable, deliberate state changes
- **immediate** means responsive without needing large or expressive motion
- **structurally familiar** means shell controls should feel legible and native to the shell system

The shell should acknowledge actions without becoming the main event.

## Shell Interaction Family

Shell-owned controls may differ by context, but they must still read as one interaction family.

That family includes:

- dock controls
- toolbar controls
- sidebar controls
- titlebar controls
- shell-owned window states

New shell interaction should join this family, not invent a separate local personality.

## Motion Philosophy

Shell motion is globally subtle and nearly invisible.

Allowed shell motion categories are:

- small entrance reveals for shell-owned views
- small lift or compression on direct manipulation
- short feedback on hover and focus
- compact state transitions between active and inactive shell states
- spatial confirmation during window dragging

Shell motion must not become:

- a decorative layer
- a brand statement
- a substitute for hierarchy
- a spring-heavy personality system

Where shared shell motion helpers already exist, extend them rather than inventing local motion behavior for one control.

## Timing Philosophy

Shell timing should feel short, controlled, and low-amplitude.

The shell may use:

- fast feedback for hover, focus, press, and minor state change
- slightly slower transitions for window positioning or view reveal

The shell should not depend on long, soft, cinematic transitions.

If motion draws attention to itself, it is too loud for shell chrome.

Responsiveness is required. Expressive animation is not.

## State Principles

Shell state should be expressed in this order:

1. clarity
2. edge contrast
3. lift or compression
4. indicator presence
5. color shift

Color is secondary. It should support state, not carry it alone.

This order exists to keep shell interaction readable without turning shell state into a color-first or animation-first system.

## Hover, Press, Focus, Disabled

### Hover

Hover may add:

- slight lift
- slight surface clarification
- slightly stronger edge contrast
- mild text or icon darkening

Hover should not re-theme the control.

### Press

Press should be compact and precise:

- small compression
- reduced lift
- tighter shadow

Press should feel mechanical, not playful.

### Focus

Focus must remain visible and consistent across shell-owned controls.

The shell already uses a shared focus-ring approach. Focus should read as accessibility law, not as a local styling choice.

### Disabled

Disabled shell controls should stay legible but subdued.

They should lose affordance before they lose structure.

## Active And Inactive Windows

Window activation is a core shell behavior.

The active window should read through:

- stronger contrast
- fuller shadow definition
- clearer title treatment

Inactive windows should remain present and usable as context, but they should recede without becoming washed out, ghosted, or theatrically dimmed.

The distinction must remain legible, not dramatic.

## Window Drag Behavior

Window dragging belongs to titlebar chrome.

The shell’s drag language is:

- direct
- thresholded
- bounded to the desktop field
- visually quiet during movement

Dragging should not trigger ornamental effects.

The shell acknowledges drag through:

- position
- active state
- spatial confirmation

It should not acknowledge drag through spectacle.

## Dock Feedback

The dock owns the strongest shell feedback, but it still remains restrained.

Dock behavior may include:

- hover lift
- mild scale change
- press compression
- an active indicator
- a compact launch bounce
- a tooltip on deliberate hover or focus

The dock must not become a toy shelf.

Feedback should confirm interaction, not become the main event.

## Toolbar And Sidebar Behavior

Toolbar and sidebar controls belong to the same shell state family:

- neutral at rest
- clearer on hover
- tighter and slightly darker on press
- consistently ringed on focus
- visibly selected when active

These controls should read as shell navigation, not as app-specific controls.

## Reduced Motion

Reduced motion is mandatory shell law.

When reduced motion is requested:

- transitions should collapse to minimal or none
- hover and press transforms should stop
- decorative motion should disappear first
- bounce or tooltip-entry animation should not run

The shell may remain responsive without remaining animated.

Reduced motion should preserve clarity, state legibility, and responsiveness even when animation is removed.

## Interaction Prohibitions

Do not introduce:

- generic spring cascades
- exaggerated hover travel
- playful shell wobble
- large bounce sequences
- motion that competes with app content
- shell interactions that feel more expressive than the work inside the window
- one-off shell control behaviors that break the shared shell interaction family

This document defines shell behavior only.

App internals may choose their own interaction language unless they are acting as shell chrome.