# Materials And Chrome

## Purpose

This document defines the shell's visual grammar as a small set of material roles.

It describes how shell surfaces relate to one another. It does not define app content styling.

## Material Hierarchy

The current code supports five shell surface roles:

| Role | Meaning | Typical use |
| --- | --- | --- |
| `air` | light atmospheric shell material | isolated shell accents, lightweight floating chrome |
| `float` | strongest floating shell material | dock shelf |
| `chrome` | primary window shell material | launcher frame, titlebar family |
| `navigation` | denser supporting chrome | shell sidebar and adjacent navigation surfaces |
| `paper` | solid content material | project window body, reading and content panes |

This hierarchy is the core of the shell. Content must read as more solid than chrome.

## Material Law

The shell follows one rule before all others:

**solid by default, translucent by exception**

That means:
- large reading and working surfaces should resolve to `paper`
- shell chrome may use controlled translucency where it helps orientation
- translucency is a shell cue, not the identity of the whole system

The current code already follows this structure:
- shell background is atmospheric rather than card-based
- launcher chrome uses translucent `chrome`
- dock uses the strongest floating treatment
- project windows use solid `paper`
- project stages remain solid and non-glass

## Where Glass Is Allowed

Glass or glass-adjacent translucency is appropriate for:
- the dock shelf
- shell window chrome
- titlebars and toolbars
- shell sidebar and navigation chrome
- top-level shell accents
- transient shell overlays, if they are introduced later

The top bar should remain the quietest expression of this family. The dock is the boldest.

## Where Glass Is Prohibited

Glass must not become the dominant material for:
- content panes
- project stages
- reading surfaces
- document bodies
- app canvases
- piece internals unless the piece explicitly owns that choice

If a surface is primarily for reading, building, or presenting app content, it should resolve as solid content material.

## Chrome Roles

### System bar

The system bar is orientation chrome. It should stay visually quiet, small in scale, and low in contrast. It is not a feature surface.

### Dock

The dock is the most elevated shell object. It can carry the clearest floating treatment, but it must still feel controlled. It is not an excuse for glossy icon tiles or novelty motion.

### Window frame

The outer shell window establishes radius, shadow, border, and active/inactive depth language. This is the primary reference for all shell chrome.

### Titlebar and toolbar

These belong to one family. They can be layered and translucent, but they must remain subordinate to content. Their job is framing and orientation.

### Sidebar

The sidebar is navigation chrome, not content. It may read denser than titlebar chrome, but it must remain clearly separate from the main content plane.

### Overlays

There is no broad overlay system defined in the current shell. If overlays are introduced later, they belong to shell chrome, not to content material.

## Radius Language

The shell uses one shared rounded-corner family:
- large outer radii for windows and major containers
- medium radii for grouped shell controls
- fully rounded forms only for compact pills, traffic lights, and indicators

Radius should signal hierarchy, not decoration. The shell should not mix sharp enterprise corners, cartoon rounds, and skeuomorphic softness.

## Divider Logic

Dividers are light structural cues:
- shell lines separate chrome bands and navigation regions
- borders are quiet and thin
- stronger dividers are reserved for container edges or emphasized shell boundaries

Dividers should not become heavy frames. The shell relies on small edge contrast, not thick outlining.

## Shadow And Depth Logic

Depth is established through:
- layer order
- restrained shadow softness
- subtle border contrast
- active versus inactive window treatment

The dock carries the strongest float signal.

Window frames carry the clearest structural shadow.

Controls may gain lift, but shell depth should never read as theatrical.

## Chrome Prohibitions

Do not introduce:
- frosted content panes
- stacked nested glass layers fighting each other
- loud tinted chrome as a substitute for hierarchy
- unrelated radius systems across shell surfaces
- one-off shadow styles per shell element
- shell chrome that is more expressive than the app it frames

This document defines shell law only. It does not define how apps should style their own canvases.
