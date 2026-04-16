---
name: analyze-web-reference
description: Use this skill when the task involves studying an existing website, interaction, section, component, animation, or visual pattern before implementation.
---

# analyze-web-reference

Use this skill when the task involves studying an existing website, interaction, section, component, animation, or visual pattern before implementation.

## Purpose

This project does not use references as shallow inspiration, screenshot copying, or branding mimicry.

References must be analyzed deeply enough that implementation decisions are grounded in:

- structure
- geometry
- spacing
- typography
- color and tonal hierarchy
- material treatment
- interaction states
- motion logic
- rendering mechanics
- perceptual impact

The goal is to understand not just **what the reference looks like**, but **what exact ingredients make it read the way it does**.

## Analysis Modes

### 1. Reproduction Mode

Use this mode when the user wants:

- the same thing
- as close as possible
- faithful recreation
- exact feel
- surgically similar implementation

In this mode:

- prioritize perceptual equivalence
- minimize reinterpretation
- identify which traits are non-negotiable
- identify which traits may vary without changing the visual read
- do not introduce originality unless the user explicitly asks for it

### 2. Interpretation Mode

Use this mode when the user wants:

- inspiration from the reference
- adaptation
- reinterpretation
- a stronger or more original version
- translation into Kris' Lab language

In this mode:

- identify the core strength of the reference
- separate essential ideas from superficial styling
- preserve what matters, not what is merely recognizable

If the user does not specify, infer the mode from the wording and state the assumed mode explicitly.

## When To Use This Skill

Use this skill when:

- the user provides a website or page reference
- the user wants to recreate or reinterpret a visual interaction or design pattern
- the user wants to study a section before building it
- the task involves DOM inspection, motion analysis, or interaction breakdown
- browser tooling is available

Do not use this skill when:

- the task is purely internal to an existing piece with no external reference
- the user already provided a clear implementation direction and does not need reference dissection
- the task is only about cleanup, bug fixing, or performance tuning with no reference study involved

## Core Behavior

Always follow this order:

1. identify the exact target of the analysis
2. inspect the reference before proposing implementation
3. break the reference down into implementation-relevant systems
4. explain what is actually doing the heavy lifting
5. identify what must be preserved versus what may vary
6. translate the analysis into an implementation direction
7. only then propose implementation steps

Do not jump directly from a reference to code.

## What Must Be Analyzed

### 1. Target Scope

Identify exactly what is being analyzed:

- full page
- hero
- section
- card
- component
- interaction
- transition
- micro-animation
- scroll sequence
- visual surface system

Do not analyze “the whole site” vaguely if the real target is only one part.

### 2. Layout And Geometry

Analyze:

- overall composition
- grid structure
- alignment logic
- spacing increments
- section proportions
- component proportions
- edge insets
- overlap relationships
- aspect ratios
- negative space distribution
- vertical rhythm
- responsive collapse behavior

Name whether the result depends on symmetry, asymmetry, offset structure, overlap, or strong empty space.

### 3. Typography

Analyze:

- font category and feel
- display versus body contrast
- weight hierarchy
- line-height behavior
- tracking
- label treatment
- text density
- casing
- truncation and wrapping behavior
- relationship between text and surrounding controls or surfaces

Do not summarize typography as only “modern” or “clean.” Be specific about hierarchy and pacing.

### 4. Color And Tonal Structure

Analyze:

- base background tone
- foreground contrast
- accent usage
- warm/cool bias
- local contrast shifts
- how many color roles exist
- where saturation is concentrated
- whether color is structural or decorative
- border and shadow tint behavior
- transparency levels where visible

Focus on tonal hierarchy, not just hex-level color naming.

### 5. Material And Surface Treatment

Analyze:

- solid versus translucent surfaces
- blur usage and likely blur strength
- inner borders
- outer borders
- gradients
- reflections
- inner shadows
- ambient shadowing
- texture, grain, or noise
- bevels or edge refraction
- whether the surface feels flat, layered, frosted, metallic, paper-like, luminous, or glass-adjacent

If a surface feels physically rich, identify the likely layered ingredients creating that effect.

### 6. State Model

Analyze every visible or likely state, not just the resting state.

Check for:

- rest
- hover
- press
- focus
- active
- selected
- disabled
- loading
- empty
- error
- expanded
- collapsed
- drag
- transition-in
- transition-out

If some states cannot be observed directly, state that clearly and infer carefully from the visible system.

### 7. Motion And Timing

Analyze:

- entrance behavior
- exit behavior
- hover transitions
- press response
- shared element transitions
- scroll-linked motion
- reveal order
- easing feel
- delay logic
- duration range
- amplitude
- whether motion is transform-based, opacity-based, filter-based, mask-based, clip-based, or scroll-driven

Do not describe motion as only “smooth” or “snappy.” Name what changes, how much, and in what sequence.

### 8. Micro-Interactions

Analyze:

- icon movement
- cursor-near response
- tooltip behavior
- selection indicators
- active badges
- magnetic pull
- shimmer
- pulse
- breathing states
- focus ring behavior
- hover layering changes
- staggered child reveals
- small status changes

These are often what make a reference feel premium. Do not skip them.

### 9. Rendering Mechanics

Infer the likely implementation stack behind the effect:

- plain DOM/CSS
- Motion / Framer Motion
- GSAP
- SVG
- CSS mask / clip-path
- pseudo-elements
- canvas
- WebGL
- shader-like lighting tricks
- blend modes
- backdrop-filter
- transform stacking
- layered shadows and borders

Separate the visual illusion from the likely technical mechanism.

### 10. Responsiveness

Analyze, if observable:

- breakpoint behavior
- what collapses
- what stacks
- what gets hidden
- how spacing changes
- whether typography scales proportionally
- whether motion changes on smaller screens

If responsiveness cannot be verified, say so explicitly.

## Heavy-Lifting Test

For every strong reference, identify:

- what is doing the real work
- what is secondary polish
- what is branding
- what is superficial
- what can be simplified without changing the perceptual read
- what must remain nearly exact for the result to still feel the same

This is mandatory.

## Preserve vs Reinterpret

Always separate the reference into:

### Must Preserve

Elements that are carrying the core read, such as:

- spatial hierarchy
- key proportions
- specific motion logic
- edge treatment
- interaction structure
- material hierarchy

### May Vary

Elements that can change without breaking the read, such as:

- copy
- assets
- branding
- minor decorative details
- secondary motion accents

### Must Avoid

Elements that are:

- generic
- structurally weak
- overly expensive for the result
- out of character for Kris' Lab
- likely to violate shell law or ownership boundaries

## Browser / Live Inspection Rules

When browser tools are available:

- inspect the live page rather than relying only on screenshots
- identify the relevant DOM structure or rendered structure
- inspect hover, focus, press, entry, scroll, drag, and transition behavior
- compare multiple states
- note whether quality comes from layout, typography, timing, blur, masking, transforms, layering, lighting, or rendering tricks

Do not stop at the resting screenshot.

When possible, inspect the reference in motion.

## Limits And Honesty Rules

If browser access is limited:

- explicitly state what cannot be verified
- distinguish direct observation from inference
- still analyze visible composition and likely mechanics as carefully as possible

Do not claim exactness where only approximation was possible.

## Kris' Lab-Specific Rules

- If the reference feels like a piece, keep it inside a piece.
- If the reference introduces heavy runtime needs, call that out early.
- If the effect can be achieved with simpler DOM/CSS or Motion, prefer that before recommending heavier tools.
- If the reference conflicts with shell law, shell boundaries, or repo structure, say so explicitly.
- Be honest when a reference looks impressive but is structurally shallow.
- Be honest when the reference is visually strong but technically expensive.
- If the user requests faithful reproduction, do not default to originality.

## Required Output Format

The response should usually contain:

### Reference Target

What exactly is being analyzed

### Analysis Mode

Whether this is:
- Reproduction Mode
- Interpretation Mode

### Structural Breakdown

Layout, geometry, alignment, spacing, hierarchy, proportions, and responsive logic

### Typography Breakdown

Font feel, hierarchy, density, line-height, tracking, labels, and text behavior

### Color / Material Breakdown

Tonal structure, surfaces, translucency, borders, shadows, gradients, texture, and surface hierarchy

### State Breakdown

Rest, hover, press, focus, active, disabled, loading, empty, error, expanded/collapsed, drag, and transition states where visible or inferable

### Motion / Interaction Breakdown

Timing, easing feel, animation triggers, movement logic, sequencing, micro-interactions, and interaction character

### Rendering / Implementation Mechanism

Likely technical approach:
- DOM/CSS
- Motion
- GSAP
- SVG
- canvas
- WebGL
- masks
- filters
- layered pseudo-elements
- other rendering tricks

### What Actually Makes It Work

What is doing the real heavy lifting versus what is secondary polish

### Must Preserve vs May Vary

Which parts are perceptually essential and which are flexible

### Recommended Implementation Direction

How to build it inside Kris' Lab, including:
- whether it belongs in shell or piece
- whether it should be hosted or isolated
- likely technologies
- likely risks
- what to prototype first

### Risks / Weaknesses

Anything generic, fragile, too expensive, aesthetically weak, or impossible to verify exactly