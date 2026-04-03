---
name: kris-lab-liquid-glass
description: Use when changing shell chrome, the top system bar, the dock, Finder-like windows, sidebars, or project viewer surfaces so Kris' Lab keeps one coherent Liquid Glass system.
---

# kris-lab-liquid-glass

Use this skill when a task touches Kris' Lab shell surfaces.

This skill is for the shell and host chrome, not for piece internals.

## Purpose

Kris' Lab uses Liquid Glass as a restrained functional layer, not as a decorative effect.

The shell should feel like:

* one calm operating layer
* one consistent material hierarchy
* one set of interaction cues

The shell should not feel like:

* generic glassmorphism
* a pile of frosted cards
* a louder visual system than the experiments it frames

## Surface roles

Always think in these roles before styling:

* `air`: the quietest atmospheric shell layer
* `float`: the strongest floating utility glass
* `chrome`: primary shell bars and window frame glass
* `navigation`: denser navigation glass like sidebars
* `paper`: standard content material, not Liquid Glass

## Where Liquid Glass belongs

Use Liquid Glass for:

* the top system bar
* the dock shelf
* shell titlebars and toolbars
* shell sidebars and inspectors
* transient panels or overlays that sit above content
* shell controls that need to read as interactive above content

## Where Liquid Glass does not belong

Do not use Liquid Glass for:

* content panes
* document bodies
* list bodies
* project stage surfaces
* piece canvases
* large reading surfaces
* decorative shells inside pieces unless the piece explicitly owns that choice

Inside the content layer, use `paper` or another standard material instead.

## Core rules

* The dock is the boldest glass expression in the shell.
* The top system bar is the quietest glass expression in the shell.
* Titlebar, toolbar, and sidebar belong to one chrome family.
* Content must feel more solid than chrome.
* State should come from lift, clarity, edge contrast, and indicators before color.
* Tint is for emphasis or status, never the base identity of a surface.
* Keep one radius language, one divider language, and one shadow logic across shell chrome.
* Prefer semantic tokens over one-off opacity values.

## Dock rules

* The dock shelf is the glass object; icons sit on it.
* Do not place every icon on a heavy dark tile.
* Active icons keep the same art and gain only slight lift, clarity, and the running dot.
* Placeholder icons should read as neutral ghost slots, not disabled black boxes.
* Hover and press should be motion-and-light events, not loud color events.
* Future icons should use simple filled layers, crisp edges, restrained transparency, and no pre-baked gloss, blur, or drop shadows.

## Fit test for new shell elements

Before adding Liquid Glass, answer these questions:

1. Is this element above content instead of part of content?
2. Is it interactive, navigational, or transient?
3. Does translucency help orientation or preserve context beneath it?
4. Would a more solid `paper` surface make hierarchy clearer?

If the answer to any of the first three is no, or the answer to the fourth is yes, do not use Liquid Glass.

## Anti-patterns

Reject these quickly:

* generic glassmorphism
* extra blur used to fake depth
* strong tint as a substitute for hierarchy
* chrome and content sharing nearly the same opacity
* mismatched edge highlights or corner logic
* clear glass over flat pale backgrounds where it disappears
* multiple nested glass layers fighting for attention
* shell chrome becoming more expressive than the piece itself

## Implementation defaults

When working in the current codebase:

* keep shell material tokens centralized in [globals.css](/Users/Kristjan/Desktop/Kris/vibeCoding/Experimenting/src/styles/globals.css)
* keep shell surface application in [shell.css](/Users/Kristjan/Desktop/Kris/vibeCoding/Experimenting/src/shell/shell.css)
* keep project viewer alignment in [host.css](/Users/Kristjan/Desktop/Kris/vibeCoding/Experimenting/src/host/host.css)

## Verification

When changing shell materials:

* check the root shell view
* check the About document view
* check the project viewer with a live piece
* sanity-check reduced motion
* sanity-check dark mode token relationships

If any screen starts reading as frosted content instead of glass above content, back it out.
