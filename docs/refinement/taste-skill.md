# Taste Skill

## Purpose

This document defines the repo-specific AI refinement contract for Kri's Lab.

It exists to improve polish quality without redefining product direction. It is a refinement layer, not a design system and not a source of shell truth.

## What This Layer Is For

Use this layer to guide:
- shell polish
- local consistency cleanup
- craft upgrades inside an already established direction
- piece-local refinement only when the task is explicitly about that piece

This layer may improve execution quality. It may not redefine what the shell or a piece is supposed to be.

Successful shell identity is preserved by default.

Unless a task explicitly authorizes redesign, refinement work must not broadly reopen:
- dock direction
- window direction
- desktop or background direction

Refinement may correct inconsistency inside those areas. It may not replace working shell decisions broadly.

## What This Layer Is Not For

This layer must not be used for:
- creating new design direction
- shell redesign
- generic premium-UI upgrading
- flattening piece autonomy
- replacing the current shell identity with external taste defaults
- broad component abstraction
- introducing louder motion, more glass, or decorative gradients as default polish moves

It must not become:
- shell design law
- a detailed shell style spec
- piece art direction
- external skill installation guidance

## Authority Order

Use this authority order exactly:

1. explicit design directives and task constraints
2. `AGENTS.md`
3. repo design law such as `docs/shell/*`
4. code reality
5. this taste layer

Practical rule:
- the taste layer may improve how well something is executed
- it may not change what the task, shell docs, or current product identity require

## Repo Reading Order

Before using this layer, agents should read in this order:

1. `AGENTS.md`
2. relevant shell docs
3. relevant local code
4. refinement docs

If those sources already fully define the task, this layer should stay secondary.

## Allowed Uses

Agents may use this layer when:
- the task is explicitly about polish, refinement, craft, or consistency
- shell or piece direction is already established
- the work is narrow and preserve-first
- the result can be checked visually

## Disallowed Uses

Agents must ignore this layer when:
- the task is architecture, routing, runtime, data, or bugfix work without visual intent
- the user asks for strict implementation of an existing spec or doc
- the task is defining shell law or product direction
- using this layer would make shell chrome louder than `docs/shell/*` allows
- the task touches piece internals without an explicit piece-level refinement request
- the likely result is generic website polish rather than repo-specific refinement

## External Reference Rule

External taste-skill repos may be used as references for audit discipline and refinement process.

They must not be imported as direct design truth.

Kri's Lab is not:
- a generic SaaS app
- a landing page
- a universal premium-UI exercise

If an external taste heuristic conflicts with the calm shell, piece autonomy, or preserve-first task framing, ignore it.

The following external defaults are non-authoritative in this repo unless a local task explicitly calls for them:
- design-variance dials
- motion-intensity baselines
- generic font bans or swap rules
- asymmetry-for-its-own-sake
- broad premium-web patterns

These are optional reference ideas at most. They are not default instructions for Kri's Lab.

## Prompting Rule

Use this layer only as a final refinement lens, never as the initial product brief.

When prompting or delegating refinement work:
- name what already works
- name the local inconsistency
- constrain the batch tightly
- forbid redesign when the task is polish only
- require visual verification

## Safeguards

When using this layer:
- preserve successful shell identity unless the task explicitly says otherwise
- treat louder motion, font churn, gradient escalation, and glass escalation as suspect by default
- do not standardize piece internals unless the task explicitly asks for it
- prefer one narrow refinement batch over broad cleanup
