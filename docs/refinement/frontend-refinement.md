# Frontend Refinement

## Purpose

This document is the operational playbook for frontend refinement work in Kris' Lab.

It explains how agents should shape, execute, and verify a refinement batch.

It does not define shell law, product direction, or architecture strategy.

It does not replace local code analysis.

## When To Use This File

Use this file when the task is about:

- polish
- visual consistency
- local craft improvement
- preserve-first refinement
- narrow shell or container cleanup
- explicit piece-level refinement

Do not use this file for:

- architecture work
- routing or runtime changes without visual intent
- defining shell law
- broad redesign
- generic UI upgrading

## Preserve-First Workflow

Use this sequence:

1. identify what already works and must stay
2. classify the problem
3. identify the local inconsistency or under-resolved area
4. choose one narrow batch
5. refine with the smallest correct diff
6. verify visually
7. evaluate the result with `pixel-perfect-checklist.md`

Do not start from:

> how can this look better in general

Start from:

> what is already successful, and what specifically feels uneven inside that direction

## Problem Classification

Use these problem classes before choosing a batch:

### Structural inconsistency

Use when the issue is about:

- shell/container hierarchy
- framing clarity
- chrome-to-content separation
- ownership drift between related surfaces

### Local visual inconsistency

Use when the issue is about:

- spacing mismatch
- alignment drift
- icon or control inconsistency
- local material or state mismatch

### Polish-only opportunity

Use when:

- the direction is already correct
- the issue is local
- the result needs better finish, not a new concept

### Out of scope

Use when:

- the issue requires redesign
- the issue belongs to another layer
- fixing it would mix multiple problem categories
- the work would exceed the task constraints

If the issue is out of scope, do not force it into a refinement batch.

## What Good Refinement Means Here

In this repo, good refinement usually means:

- clearer hierarchy
- tighter control states
- better spacing rhythm
- better iconography cohesion
- stronger material consistency
- improved polish without visible redesign

Good refinement should make the result feel more intentional, not more stylistically different.

## Refinement Targets By Layer

### Shell chrome

Target:

- precision
- consistency
- restraint

Typical work:

- local chrome balance
- icon cohesion
- state clarity
- material calibration
- titlebar, toolbar, or sidebar polish

### Host and container surfaces

Target:

- clear ownership boundaries
- cleaner shell-versus-content separation

Typical work:

- container framing
- chrome-to-stage transitions
- boundary drift cleanup

### Piece internals

Target:

- local craft refinement inside the piece’s own direction

Rule:

- only refine piece internals when the task is explicitly about that piece
- do not pull shell polish rules into piece content by default

## Batch-Shaping Rules

Each refinement batch should:

- solve one problem category at a time
- preserve the successful look
- stay local to the relevant files
- avoid speculative cleanup
- avoid system expansion

Do not combine:

- chrome polish
- motion tuning
- spacing cleanup
- art direction change

unless the task explicitly requires that combination.

If the batch starts changing concept rather than execution, it is no longer a refinement batch.

If the batch starts needing new abstractions, broad law changes, or unrelated layer work, stop and reclassify it.

## Verification Expectations

Refinement work should be checked with:

- a browser pass
- a screenshot pass when visual balance matters
- reduced-motion awareness when interaction is involved
- a quick shell/app-boundary check when containers or chrome are touched

Verification should answer:

- what stayed the same
- what became more consistent
- whether any visible redesign slipped in

After verification, use `pixel-perfect-checklist.md` to judge the result as:

- Resolved
- Still uneven
- Out of scope

## Stop Conditions

Stop and reclassify the work if:

- the change starts redefining shell or piece direction
- the issue belongs to another layer
- the batch expands beyond one narrow problem class
- the likely fix becomes architectural rather than visual
- the result cannot be verified locally and visually with confidence

## Refinement Prohibitions

Do not treat refinement as permission to:

- redesign the shell
- normalize all pieces into one visual system
- import generic premium-web aesthetics
- introduce new abstractions without need
- escalate chrome expression to compensate for weak hierarchy

If the proposed change is broad, identity-changing, or hard to verify locally, it is likely not a refinement batch.