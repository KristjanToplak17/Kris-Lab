---
name: analyze-web-reference
description: Use this skill when the task involves studying an existing website, interaction, section, component, animation, or visual pattern before implementation.
---

# analyze-web-reference

Use this skill when the task involves studying an existing website, interaction, section, component, animation, or visual pattern before implementation.

## Purpose

This project does not use references as shallow inspiration or screenshot-copy material.
References should be analyzed deeply so that implementation decisions are based on structure, motion logic, composition, and visual intent.

The goal is to understand:

* what makes the reference effective
* which parts are essential
* which parts are superficial
* how to reinterpret the underlying idea in a stronger or more original way inside Kris' Lab

## When to use this skill

Use this skill when:

* the user provides a website or page reference
* the user wants to recreate or reinterpret a visual interaction or design pattern
* the user wants to study a section before building it
* the task involves DOM inspection, motion analysis, or interaction breakdown
* Playwright or browser tooling is available

Do not use this skill when:

* the task is purely internal to an existing piece with no external reference
* the user already provided a clear implementation direction and does not need reference dissection
* the task is only about cleanup, bug fixing, or performance tuning with no reference study involved

## Core behavior

Always follow this order:

1. Identify the exact target of the analysis

   * page
   * section
   * element
   * interaction
   * transition
   * motion detail

2. Analyze before proposing implementation

   * layout structure
   * spacing logic
   * typography feel
   * layering
   * color/material treatment
   * motion rhythm
   * interaction states
   * what gives the reference its quality

3. Explain why the reference works

   * what is doing the heavy lifting
   * what creates polish
   * what creates emotional impact
   * what is generic vs what is distinctive

4. Translate the analysis into an implementation direction

   * what should be preserved
   * what should be adapted
   * what should be avoided
   * whether the result belongs in the shell or in a piece
   * whether it should be hosted or isolated
   * whether it likely needs DOM/CSS, Motion, GSAP, canvas, or WebGL

5. Only then propose implementation steps

## Reference handling rules

* Do not jump directly from a reference to code.
* Do not reduce the reference to a screenshot-level summary.
* Do not blindly imitate branding, content, or assets.
* Focus on structure, behavior, composition, and interaction logic.
* If the reference is visually weak, cliche, or overrated, say so clearly.
* If only one small part of the reference is strong, isolate that part instead of copying the whole direction.

## Browser / Playwright usage

When browser tools are available:

* inspect the live page rather than relying only on screenshots
* identify the relevant DOM structure or rendered structure
* observe hover, entry, scroll, and transition behavior
* note whether polish comes from layout, timing, lighting, blur, layering, masking, transforms, or rendering tricks

If browser access is limited:

* explicitly state what cannot be verified
* still analyze the visible composition and likely mechanics as carefully as possible

## Output format

The response should usually contain:

### Reference Target

What exactly is being analyzed

### What Makes It Work

The strongest qualities of the reference

### Structural Breakdown

Hierarchy, layout, spacing, layers, and interaction states

### Motion / Interaction Breakdown

Timing, easing feel, transitions, and movement logic

### What To Preserve vs Reinterpret

Which elements are worth carrying forward and which should be changed

### Recommended Implementation Direction

How to build it inside Kris' Lab

### Risks / Weaknesses

Anything generic, fragile, too expensive, or aesthetically weak

## Kris' Lab-specific rules

* Prefer reinterpretation over imitation.
* Preserve originality.
* Protect the shell from becoming visually loud.
* If the reference feels like a piece, keep it inside a piece.
* If the reference introduces heavy runtime needs, call that out early.
* If the effect can be achieved with simpler DOM/CSS or Motion, prefer that before recommending heavier tools.
* Be honest when a reference looks impressive but is structurally shallow.
