# OS Shell Design

## Purpose

This document is the entry point for the Kris' Lab shell design docs.

It defines what the shell is, what it is responsible for, and what it must not become.

The shell is an OS-level framing layer. It is not a universal visual system for every app. Its job is to preserve shell consistency without flattening the autonomy of pieces.

Use this file to:

- determine whether a decision belongs to the shell at all
- understand the shell’s intended character
- identify the shell invariants that must remain stable
- route into the correct downstream shell law file

## Intent

Kris' Lab is primarily a desktop shell with a calm operating layer and autonomous work inside it.

The shell should feel:

- calm
- precise
- premium
- restrained
- structurally informed by desktop-native interaction logic, without becoming visually derivative of macOS

In practice:

- **calm** means low-noise chrome, controlled hierarchy, and no decorative overload
- **precise** means tight spacing, clean alignment, and predictable interaction behavior
- **premium** means disciplined material hierarchy and finish, not flashy styling
- **restrained** means the shell frames the work and then recedes

The shell may carry a small amount of personality in selected moments, but shell chrome is not the place for broad expressive styling. Personality may appear as controlled accent, not dominant behavior.

## Scope

This design system applies only to the OS/shell/platform layer:

- system bar
- dock
- window frame
- titlebar and toolbar chrome
- shell sidebar
- shell-owned controls
- shell spacing, type, motion, depth, and state behavior

This design system does not define:

- app-internal art direction
- piece-level layout systems
- piece-level motion languages
- a shared visual component system for all apps

If a design decision is about how a piece itself should look, move, or feel, it does not belong in this file.

## Sacred Invariants

The shell has three non-negotiable invariants.

### 1. Material and surface language

Shell surfaces must keep a stable hierarchy.

Chrome, navigation, floating elements, and paper surfaces must remain distinguishable. Glass is an accent, not the base material of the system.

### 2. Window chrome consistency

The shell must present one coherent window language across launcher and project contexts.

Traffic lights, titlebar rhythm, toolbar behavior, radius logic, and shell-owned states must read as one family.

### 3. Spacing rhythm

Shell spacing must remain compact, measured, and repeatable.

The shell should feel desktop-scaled, not card-grid loose or landing-page spacious.

## Reading Order

Read the shell docs in this order:

1. [materials-and-chrome.md](./materials-and-chrome.md)
2. [interaction-grammar.md](./interaction-grammar.md)
3. [boundaries.md](./boundaries.md)

Use this file as:

- the scope lock
- the shell intent statement
- the decision index

Use the linked files for actual system law:

- `materials-and-chrome.md` → shell material hierarchy, chrome treatment, and visual surface rules
- `interaction-grammar.md` → shell interaction, state behavior, timing, and reduced-motion law
- `boundaries.md` → ownership boundaries between shell chrome, app container law, and piece interiors

## Current System Shape

The current shell is built around:

- a launcher window and project windows
- a restrained system bar
- a dock with shell-owned feedback
- a shell sidebar and toolbar inside the launcher window
- project containers that preserve shell chrome while leaving app interiors free

The current runtime distinguishes only two shell app kinds:

- launcher
- project

That narrow model is intentional.

These docs should describe and preserve that model clearly. They should not be used to casually invent new shell app categories, new shell subsystems, or speculative shell feature families.

## Anti-Goals

The shell design system explicitly rejects:

- generic SaaS dashboard styling
- landing-page design-system thinking
- Dribbble-gradient styling
- over-glassmorphism
- neon cyber-OS aesthetics
- skeuomorphic gimmicks
- cartoonish widget language
- sterile enterprise chrome

It also rejects a second failure mode:

- turning shell rules into a style prison for piece interiors

## What This File Must Not Become

This file must not become:

- an exhaustive token dump
- a component-by-component implementation manual
- an app-internal design guide
- a speculative roadmap for future shell features

When the docs need detail, place that detail in the linked law files instead of widening this file.

If a decision requires implementation detail, this file should route outward rather than expand downward.