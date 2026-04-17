# Canonical Shell Contract

## Purpose

This file is the default implementation-facing source of truth for shell-owned values and behavior in Kris' Lab.

Use it to:

- classify a shell surface into the correct family before styling it
- reuse the canonical shell tiers already grounded in current docs, code, and audit work
- keep future shell adjustments inside one coherent system without reopening shell direction

Future shell work should start here and justify deviations explicitly rather than casually inventing new local values.

This file does not:

- redesign the shell
- define piece internals
- replace `DESIGN.md`, `materials-and-chrome.md`, `interaction-grammar.md`, or `boundaries.md`
- dump every token from CSS

Read `DESIGN.md` first. Use this file as the operational contract for what to reuse.

## Shell Family Model

### Launcher family

The launcher is a translucent chrome-family window.

It owns:

- launcher frame
- launcher titlebar
- launcher toolbar
- launcher sidebar

Its material stack is:

- `chrome` for the outer frame and top bands
- `navigation` for the sidebar
- a quieter paper-like internal content plane inside the launcher body

That internal content plane exists to improve readability and hierarchy. It must not make the launcher read like a document-family window.

The launcher remains the shell reference for translucent chrome, not for document surfaces.

### Project/document family

Hosted project windows are the canonical document family.

They use:

- solid `paper` outer framing
- quiet document titlebar treatment
- explicit stage-edge separation
- solid content stages

The About window belongs to this family.

This rule applies to:

- its outer shell treatment
- its border and depth family
- its stage framing

Its inner composition may remain slightly more editorial than a hosted project window, but its outer shell must still read as document/project chrome rather than launcher chrome.

### Dock as controlled exception

The dock is a controlled shell exception.

It is allowed to remain:

- the boldest float object in the shell
- more glassy than launcher or document windows
- more expressive in hover, press, bounce, and tooltip behavior

This is not drift. It is a sanctioned exception inside the shell system.

The dock must still remain governed by shell law:

- same overall restraint
- same reduced-motion requirements
- same compact desktop scale
- same shell quality bar for radius, spacing, border, and depth relationships

Light cohesion adjustment is allowed only in how the dock relates to the rest of the shell, especially:

- icon-holder radius
- surrounding frame radius
- border and shadow relation
- padding and spacing relation

Its special motion should remain intact.

### Float-family shell-adjacent utilities

Float-family shell-adjacent utilities are detached desktop objects that support the shell but are not first-class window families.

Current example:

- weather widget

This category must not be overfit to the current weather widget.

Float-family shell-adjacent utilities may vary more than launcher and document windows in material treatment. Depending on function, they may be:

- translucent
- mixed-material
- solid

Their cohesion should come primarily from:

- shell-owned radius tiers
- shell spacing rhythm
- shell typography tone
- containment quality
- depth logic
- overall restraint

They must feel like part of the shell without being locked to one exact background recipe.

## System Bar

The system bar is orientation chrome only.

It is the quietest shell-owned layer and must never visually compete with:

- the launcher
- the dock
- document windows

It should remain:

- visually quiet
- low-contrast
- small in scale
- non-featured

Canonical system bar rules:

- material: quiet shell chrome with minimal contrast
- typography: `14px / 20px / 500`
- outer horizontal inset: `16px`
- item height: `24px`
- item inline padding: `8px`
- item radius: `4px`
- bar height: `28px`
- border treatment: bottom border only

Interaction quietness rule:

- hover may slightly clarify surface or text
- press may tighten feedback minimally
- the system bar must not behave like a feature surface, floating panel, or mini-toolbar

## Material Contract

The shell uses five material roles.

### `air`

Use for:

- desktop atmosphere
- shell background accents

Do not use `air` for:

- framed windows
- reading surfaces
- document bodies

### `float`

Use for:

- dock
- shell-adjacent floating utilities

`float` may carry the richest blur, highlight, and float signal in the shell.

It must not become the default material for windows or content panes.

### `chrome`

Use for:

- launcher outer frame
- launcher titlebar
- launcher toolbar

`chrome` is the canonical translucent shell frame material.

Do not use `chrome` for:

- project stages
- document bodies
- reading panes

### `navigation`

Use for:

- launcher sidebar
- denser shell navigation zones adjacent to chrome

`navigation` is denser than `chrome` but still clearly shell-owned and separate from content.

### `paper`

Use for:

- hosted project windows
- About window
- document bodies
- reading and working surfaces

`paper` is solid by default.

Material misuse rules:

- no glass for reading or document bodies
- no `air` for framed windows
- no `chrome` for project stages
- no shell material law inside piece internals by default

## Typography Contract

The shell uses a compact desktop typography system. Future work should reduce drift inside this system, not introduce new near-neighbor tiers.

### System/menu tier

Use for:

- system bar text
- menu-level shell status text

Default:

- `14px / 20px / 500`

### Window title tier

Use for:

- launcher titles
- project/document window titles
- About window title

Default:

- `0.8rem / 600`

Allowed exception:

- existing implementation may keep a slightly heavier title weight where already present and visually aligned

Rule:

- do not introduce new local title sizes or additional title weights

### Toolbar path tier

Use for:

- launcher path text
- breadcrumb-like shell path labels

Default:

- `0.8rem / 530`

Current item / stronger segment:

- `0.8rem / 560`

Rule:

- do not create intermediate toolbar weights for local emphasis

### Sidebar label tier

Use for:

- launcher sidebar rows
- shell navigation labels

Default:

- `0.84rem / 540`

Current or stronger navigation emphasis:

- `0.84rem / 560`

Rule:

- do not introduce extra sidebar label weights between default and current

### Compact metadata tier

Use for:

- compact shell metadata
- timestamps
- secondary chrome annotations

Default:

- `0.7rem / 500`

Allowed exception:

- existing implementation may keep nearby sizing only where already present and visually stable

Typography drift rule:

- do not add new shell text tiers casually
- do not introduce new near-neighbor font weights to solve local styling problems

## Spacing Contract

Shell spacing must remain compact, repeatable, and desktop-scaled.

Canonical structural values:

- titlebar height: `1.75rem`
- launcher toolbar band: `2.78rem`
- standard compact shell control height: `1.96rem`
- launcher sidebar width: `12.5rem`

Canonical shell inset steps:

- `0.56rem`
- `0.72rem`
- `0.98rem`
- `1rem`

Spacing rule:

- these are the default shell inset steps
- future shell work should reuse them before introducing any new local spacing value
- nearby decimals should not be introduced casually
- shell spacing should remain tighter than piece-internal spacing by default

## Radius Contract

The shell uses one rounded family with clear hierarchy.

### Major window tier

Use for:

- launcher window
- project/document windows
- About window

Default:

- `1.18rem`

Compact/mobile exception:

- `1rem`

### Medium control tier

Use for:

- grouped shell controls
- toolbar groups
- larger shell-owned control clusters

Default:

- `0.8rem`

### Small row/accent tier

Use for:

- compact buttons
- sidebar rows
- small shell accents

Default:

- `0.72rem`

Allowed exception:

- existing tighter button geometry may use `0.68rem` where already implemented and visually necessary

Rule:

- do not introduce additional small-radius variants between these values

### Dock exception

The dock may use a larger local radius tier.

That tier is dock-only and must not become a general-purpose shell radius.

## Border / Divider / Stage Edge Contract

Borders and dividers are containment cues, not decoration.

### Quiet shell dividers

Use for:

- chrome band separation
- sidebar division
- low-emphasis control edges

Rules:

- keep borders thin
- keep contrast low
- let material and spacing do most of the hierarchy work

### Stronger document stage edge

Use for:

- project/document family stage separation
- About window stage separation

Rules:

- document windows should show a clearer stage edge than launcher internals
- stage-edge treatment should make shell chrome and document content read as distinct layers

### Containment rule

Borders should separate:

- shell bands from each other
- shell chrome from document content
- framed containers from the desktop field

Borders should not:

- decorate surfaces
- compensate for weak hierarchy
- create heavy framing where subtle containment is enough

## Shadow / Depth / Active-Inactive Contract

### Launcher family depth

Launcher surfaces use the chrome/window depth family.

They should read as:

- lightly elevated
- soft-edged
- translucent

### Document family depth

Project/document windows use the solid-window depth family.

They should read as:

- stable
- soft but clearer than launcher chrome
- grounded through solid material rather than blur

This applies to the About window as well.

### Float family depth

Dock and shell-adjacent float utilities use the float depth family.

Rules:

- dock may remain the richest float
- shell-adjacent utilities may vary more in material treatment than in depth logic
- utilities should still sit below the dock in emphasis unless product direction explicitly requires otherwise

### Active / inactive behavior

Active/inactive treatment is a soft hierarchy shift, not dramatic dimming.

Active windows should read through:

- slightly clearer title treatment
- slightly fuller depth
- slightly stronger border/material confidence

Inactive windows should:

- remain present
- remain legible
- recede without looking disabled or ghosted

## Interaction / Micro-Motion Contract

Shell motion must remain tiny, precise, and structurally useful.

### Default timing

Use:

- `120ms` for hover, press, and immediate state feedback
- `180ms` for small structural transitions
- `240ms` for broader shell-owned transitions when needed

### Default easing

Use the shared shell ease family already established in code.

Do not invent local motion curves for isolated shell controls unless the existing family is clearly insufficient.

### Default shell control behavior

Hover may add:

- tiny lift
- slight surface clarification
- slightly stronger edge contrast

Press may add:

- tiny compression
- reduced lift
- slightly tighter depth

Focus must:

- remain visible
- follow shared shell focus-ring behavior
- read as accessibility law, not local decoration

### Reduced motion

Reduced motion is mandatory shell law.

When reduced motion is requested:

- transforms should collapse first
- bounce should stop
- tooltip-entry motion should stop
- the shell should remain responsive without remaining animated

### Dock exception

The dock remains more expressive than the rest of the shell.

It may keep:

- stronger hover lift
- modest scale change
- compact launch bounce
- tooltip behavior

This exception does not permit spectacle elsewhere in shell chrome.

### Secondary inspiration rule

External refinement references such as Emil Design Eng may be used only as secondary inspiration for:

- micro-animation quality
- tactile precision
- pixel-perfect execution standards

They are not shell law and must not override repo docs, code reality, or this contract.

## Boundaries

This contract applies only to shell-owned UI.

It covers:

- system bar
- dock
- launcher chrome
- project/document window framing
- shell titlebars, toolbars, and sidebars
- shell-owned controls
- shell spacing, typography, material, depth, and motion behavior

It does not apply to:

- piece internals
- piece typography
- piece motion systems
- piece layout systems
- piece art direction

The shell may frame piece content. It may not standardize how piece content itself looks or behaves.

## Open Questions

### Unresolved but non-blocking

- Shell-adjacent float utilities are intentionally described by containment, depth, spacing, radius, and tone rather than one locked material recipe. That flexibility is deliberate, not a gap.

### Unresolved and relevant before broader normalization

- The launcher was not fully visually verified in an opened rendered state during the latest audit pass. Its contract here is strongly grounded in docs and code, but still needs a fully rendered verification pass before broader launcher normalization.
- Active and inactive shell windows were not visually confirmed side by side in the latest audit pass. The current active/inactive contract is grounded in code and prior visual inspection, but a dedicated comparison pass would still strengthen confidence before broader normalization.
