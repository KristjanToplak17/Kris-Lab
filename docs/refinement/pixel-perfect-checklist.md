# Pixel Perfect Checklist

## Purpose

This document is the final visual QA checklist for refinement work.

Use it after implementation to judge whether the result is resolved, still uneven, or out of scope.

It is a checking document, not a design-direction document.

## Shell Checks

Check:
- border alignment across adjacent shell surfaces
- radius consistency across chrome-owned controls and containers
- icon optical centering
- titlebar, toolbar, and sidebar balance
- active versus inactive state clarity
- hover, press, focus, and disabled consistency
- divider strength relative to surrounding chrome
- shadow consistency and depth restraint

## Layout Checks

Check:
- optical spacing, not just literal spacing
- baseline alignment
- truncation behavior
- one-pixel seams between surfaces
- label and icon alignment inside controls
- count, badge, and metadata alignment where present

## Responsiveness And Behavior Checks

Check:
- desktop integrity at supported shell sizes
- no accidental crowding in tighter states
- reduced-motion behavior when interaction changed
- no unintended chrome drift between launcher and project contexts
- no shell/app boundary regressions

## Acceptance Language

Use these labels when reporting results:

### Resolved

Use when:
- the inconsistency is no longer visually distracting
- the result fits the existing direction
- no visible redesign occurred

### Still uneven

Use when:
- the original issue improved but is still perceptible
- related local inconsistency remains
- a follow-up polish batch may be justified

### Out of scope

Use when:
- the issue belongs to another layer
- fixing it would require redesign
- fixing it would mix multiple problem categories
- fixing it would exceed the stated task constraints

## Checklist Boundaries

This checklist must not be used to justify:
- redesign ideas
- new design law
- architecture changes
- generic style upgrades unrelated to the task

Its job is to validate finish quality inside an already chosen direction.
