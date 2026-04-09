# Frontend Refinement

## Purpose

This document is the operational playbook for frontend refinement work in Kri's Lab.

It explains how agents should shape refinement batches. It does not define shell law and it does not replace code analysis.

## Preserve-First Workflow

Use this sequence:

1. identify what already works and must stay
2. classify the problem
3. identify the local inconsistency or under-resolved area
4. choose one narrow batch
5. refine with the smallest correct diff
6. verify visually

Do not start from "how can this look better in general."

Start from "what is already successful, and what specifically feels uneven inside that direction."

Use these problem classes before choosing a batch:
- structural inconsistency
- local visual inconsistency
- polish-only opportunity
- out of scope

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
- local craft refinement inside the piece's own direction

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

## Refinement Prohibitions

Do not treat refinement as permission to:
- redesign the shell
- normalize all pieces into one visual system
- import generic premium-web aesthetics
- introduce new abstractions without need
- escalate chrome expression to compensate for weak hierarchy

If the proposed change is broad, identity-changing, or hard to verify locally, it is likely not a refinement batch.
