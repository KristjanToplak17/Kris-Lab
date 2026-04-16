# Pixel Perfect Checklist

## Purpose

This document is the final visual QA checklist for refinement work.

Use it after implementation to judge whether the result is:

- resolved
- still uneven
- out of scope

It is a checking document, not a design-direction document.

It does not define shell law, product direction, or redesign strategy.

## When To Use This File

Use this file:

- after a refinement batch
- after a local shell polish pass
- after a narrow consistency fix
- before reporting polish work as complete

Do not use this file to generate new direction.

Do not use it as permission to widen scope.

## How To Use The Checklist

Use this checklist to validate the area touched by the task and any immediately adjacent consistency effects.

Do not treat every item as a reason to start more work.

If the checklist reveals a broader issue:

- report it clearly
- keep it separate from the current task
- do not silently fold redesign or additional polish into the batch

This checklist validates finish quality inside an already chosen direction.

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

Look for small shell inconsistencies that make related chrome stop feeling like one system.

## Layout Checks

Check:

- optical spacing, not just literal spacing
- baseline alignment
- truncation behavior
- one-pixel seams between surfaces
- label and icon alignment inside controls
- count, badge, and metadata alignment where present

Look for misalignment that is technically small but visually persistent.

## Responsiveness And Behavior Checks

Check:

- desktop integrity at supported shell sizes
- no accidental crowding in tighter states
- reduced-motion behavior when interaction changed
- no unintended chrome drift between launcher and project contexts
- no shell/app boundary regressions

If interaction changed, confirm that visual finish still holds across relevant states.

## Acceptance Language

Use these labels when reporting results.

### Resolved

Use when:

- the inconsistency is no longer visually distracting
- the result fits the existing direction
- no visible redesign occurred

### Still uneven

Use when:

- the original issue improved but is still perceptible
- related local inconsistency remains
- a narrow follow-up polish batch may be justified

### Out of scope

Use when:

- the issue belongs to another layer
- fixing it would require redesign
- fixing it would mix multiple problem categories
- fixing it would exceed the stated task constraints

## Follow-Up Rule

If the result is not fully resolved:

- report the remaining issue clearly
- name whether it is local follow-up or true out-of-scope work
- do not silently reopen design direction, architecture, or broad shell law

## Checklist Boundaries

This checklist must not be used to justify:

- redesign ideas
- new design law
- architecture changes
- generic style upgrades unrelated to the task

Its job is to validate finish quality inside an already chosen direction.