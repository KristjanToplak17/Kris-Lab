# Materials And Chrome

## Purpose

This document defines the shell’s visual grammar as a small set of material roles.

It explains how shell surfaces relate to one another, how shell chrome should read, and how material hierarchy should preserve orientation and structure.

It does not define app content styling.

Use this file when changing:

- shell surface treatment
- translucency
- chrome density
- radius language
- divider behavior
- shadow and depth treatment
- shell-owned overlays or floating elements

If the question is about shell material hierarchy, this file owns it.

If the question is about app interior styling, it does not.

## Material Hierarchy

The current shell uses five material roles.

| Role | Meaning | Typical use |
| --- | --- | --- |
| `air` | atmospheric shell support material | shell background accents, lightweight shell atmosphere |
| `float` | highest-elevation floating shell material | dock shelf |
| `chrome` | primary shell frame material | launcher frame, titlebar family |
| `navigation` | denser supporting shell material | shell sidebar and adjacent navigation surfaces |
| `paper` | solid working and reading material | project window body, reading and content panes |

This hierarchy is the core of the shell.

Content must read as more solid than chrome.

Do not introduce new shell material categories casually. Extend the existing hierarchy unless the system itself clearly requires change.

## Role Selection Rule

Choose the lowest-intensity material role that still preserves hierarchy and legibility.

Do not escalate a surface into stronger chrome or stronger translucency unless that strength is doing real structural work.

## Material Law

The shell follows one rule before all others:

**solid by default, translucent by exception**

That means:

- large reading and working surfaces should resolve to `paper`
- shell chrome may use controlled translucency where it helps orientation
- translucency is a shell cue, not the identity of the whole system

The shell should never depend on glass as its base material language.

## Current System Shape

The current code already follows this structure:

- shell background is atmospheric rather than card-based
- launcher chrome uses translucent `chrome`
- dock uses the strongest floating treatment
- project windows use solid `paper`
- project stages remain solid and non-glass

These examples describe the current shell model. They are not permission to casually widen the material system or push more of the shell toward glass.

## Where Glass Is Allowed

Glass or glass-adjacent translucency is appropriate for:

- the dock shelf
- shell window chrome
- titlebars and toolbars
- shell sidebar and navigation chrome
- top-level shell accents
- transient shell overlays, if they are introduced later

The top bar should remain the quietest expression of this family.

The dock is the boldest, but still restrained.

## Where Glass Is Prohibited

Glass must not become the dominant material for:

- content panes
- project stages
- reading surfaces
- document bodies
- app canvases
- piece internals unless the piece explicitly owns that choice

If a surface is primarily for reading, building, or presenting app content, it should resolve as solid content material.

This file defines shell material law. It does not authorize shell material language to spill into app interiors by default.

## Chrome Roles

### System bar

The system bar is orientation chrome.

It should stay visually quiet, small in scale, and low in contrast.

It is not a feature surface.

### Dock

The dock is the most elevated shell object.

It can carry the clearest floating treatment, but it must still feel controlled.

It is not an excuse for glossy icon tiles, novelty lighting, or visual spectacle.

### Window frame

The outer shell window establishes radius, shadow, border, and active/inactive depth language.

This is the primary reference for shell chrome.

### Titlebar and toolbar

These belong to one family.

They may be layered and translucent, but they must remain subordinate to content.

Their job is framing and orientation.

### Sidebar

The sidebar is navigation chrome, not content.

It may read denser than titlebar chrome, but it must remain clearly separate from the main content plane.

### Overlays

There is no broad overlay system defined in the current shell.

If overlays are introduced later, they belong to shell chrome, not content material.

Do not invent a separate overlay material language casually. New overlays must stay inside the existing shell hierarchy.

## Radius Language

The shell uses one shared rounded-corner family:

- large outer radii for windows and major containers
- medium radii for grouped shell controls
- fully rounded forms only for compact pills, traffic lights, and indicators

Radius should signal hierarchy, not decoration or personality.

The shell should not mix sharp enterprise corners, cartoon rounds, and skeuomorphic softness.

## Divider Logic

Dividers are light structural cues:

- shell lines separate chrome bands and navigation regions
- borders are quiet and thin
- stronger dividers are reserved for container edges or emphasized shell boundaries

Dividers should not become heavy frames.

The shell relies on small edge contrast, not thick outlining.

## Shadow And Depth Logic

Depth is established through:

- layer order
- restrained shadow softness
- subtle border contrast
- active versus inactive window treatment

The dock carries the strongest float signal.

Window frames carry the clearest structural shadow.

Controls may gain lift, but shell depth should never read as theatrical.

Depth should preserve hierarchy, not become decoration.

## Chrome Prohibitions

Do not introduce:

- frosted content panes
- stacked nested glass layers fighting each other
- loud tinted chrome as a substitute for hierarchy
- unrelated radius systems across shell surfaces
- one-off shadow styles per shell element
- shell chrome that is more expressive than the app it frames

This document defines shell law only.

It does not define how apps should style their own canvases.