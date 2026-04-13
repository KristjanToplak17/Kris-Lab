# Projects Folder Interaction Plan

## Reference Decomposition

Reference: [folder-interaction.vercel.app](https://folder-interaction.vercel.app/)

Observed implementation strategy:

- Next.js page with a single `GlassFolder` component.
- Uses `motion/react` variants, not GSAP.
- Two independent state booleans:
  - `isHovered`
  - `isOpen`
- Outside click closes the open state through a document `mousedown` listener.
- Hover and open are driven by `animate={isOpen ? "open" : isHovered ? "hover" : "closed"}`.

Core layer stack:

1. neutral gray page field
2. radial atmosphere overlay
3. bottom shadow ellipse
4. folder shell back cavity
5. three stacked cards
6. front folder flap with its own 3D wrapper
7. flap sheen and grain overlays

## State-By-State Behavioral Analysis

### Resting State

- Folder centered inside a `256 x 208` interaction frame.
- Root scale is `1`.
- Flap wrapper sits at `rotateX(-20deg)`.
- Cards remain partially buried in the folder.
- Composition is asymmetrical but tightly controlled:
  - left/back card: `y -50`, `rotate 2deg`, `scale .95`, `z 0`
  - middle card: `y -45`, `rotate 0deg`, `scale .95`, `z 5`
  - right/front card: `y -40`, `rotate -2deg`, `scale .95`, `z 10`
- Bottom shadow is a wide blurred ellipse with a fixed 3D transform of `rotateX(90deg) translateZ(-80px)`.

### Hover Enter

- Root scales to `1.02`.
- Cards rise further upward without leaving the folder:
  - left/back: `y -80`, `rotate 4deg`
  - middle: `y -75`
  - right/front: `y -70`, `rotate -4deg`
- Flap wrapper rotates farther open to `rotateX(-30deg)`.
- Bottom shadow widens to `scaleX(1.1)`.
- Sheen on the flap translates upward.
- Perceived behavior: soft, floaty, no snap, no press compression.

### Hovered Steady State

- Folder still reads as closed, but contents are visibly loosened and ready.
- Cards move as three independent layers, not as one rigid stack.
- Shadow widening and flap tilt make the whole object feel lighter.

### Hover Leave

- Returns to rest cleanly.
- No visible overshoot.
- Exit feels slightly calmer than hover-in because the cards settle downward into occlusion.

### Click / Activate

- Click toggles persistent open state.
- Root scales to `1.1`.
- Flap wrapper rotates dramatically to `rotateX(-60deg)`.
- Cards fully eject from the folder:
  - left/back: `x -120`, `y -150`, `rotate -8deg`, `scale .9`, `z 200`, `delay .16`
  - middle: `x 0`, `y -160`, `rotate 0deg`, `scale .9`, `z 205`, `delay .08`
  - right/front: `x 120`, `y -150`, `rotate 8deg`, `scale .9`, `z 210`, `delay 0`
- Cards spread laterally and vertically with the front/right card leading the fan.
- Open state persists even after hover leaves.

### Click-Away / Deactivation

- Outside `mousedown` collapses the open state.
- State returns directly to rest when not hovered.
- There is no distinct click-away flourish; the quality comes from the same spring system resolving back to the closed variants.

## Motion Analysis Table

| Layer | Closed | Hover | Open | Timing |
| --- | --- | --- | --- | --- |
| Root container | `scale(1)` | `scale(1.02)` | `scale(1.1)` | hover spring `200/20/1`, open spring `150/18/1` |
| Flap wrapper | `rotateX(-20deg)` | `rotateX(-30deg)` | `rotateX(-60deg)` | closed spring `60/20`, hover spring `100/18/1`, open spring `90/18/1` |
| Left/back card | `y -50`, `r 2`, `s .95`, `z 0` | `y -80`, `r 4` | `x -120`, `y -150`, `r -8`, `s .9`, `z 200` | open spring `80/14/1`, delay `.16` |
| Middle card | `y -45`, `r 0`, `s .95`, `z 5` | `y -75` | `x 0`, `y -160`, `r 0`, `s .9`, `z 205` | open spring `80/14/1`, delay `.08` |
| Right/front card | `y -40`, `r -2`, `s .95`, `z 10` | `y -70`, `r -4` | `x 120`, `y -150`, `r 8`, `s .9`, `z 210` | open spring `80/14/1`, delay `0` |
| Bottom shadow | fixed 3D ellipse | `scaleX(1.1)` | unchanged from hover/open | CSS transition `700ms ease` |
| Flap sheen | low position | translates upward | stays aligned with flap | CSS transition `700ms ease` |

Inferred easing split:

- Main object choreography: motion springs.
- Supporting sheen and shadow: CSS `duration-700`, equivalent to Tailwind default cubic-bezier `0.4, 0, 0.2, 1`.

## Visual Design Anatomy

- Interaction frame: `256 x 208`
- Perspective: `1200px`
- Folder shell:
  - dark radial gradient
  - rounded `24px`
  - inset rim lights
  - deep cavity shadow
  - strong outer shadow
- Card faces:
  - light gradient fill
  - rounded `12px`
  - subtle paper gloss and grain
  - consistent shadow recipe across all three
- Flap:
  - semi-translucent dark gradient
  - blur-backed material
  - thin top border
  - separate grain and sheen overlays

Perceived depth behavior:

- `translateZ` is used sparingly on the shell and cards.
- Most depth comes from scale, vertical spread, flap tilt, and occlusion.
- Open state reads tactile because cards gain both `x/y` travel and positive `z`.

## Mapping To Our Existing Launcher / Projects Shell

Local shell constraints observed from the current app:

- Launcher chrome must stay unchanged.
- `Projects` content pane currently lives inside `.shell-main`.
- Available projects-view content area at current launcher size is roughly `902 x 466`.
- Sidebar, toolbar, titlebar, and outer window frame already fit the repo’s shell law and should not be restyled.

Implementation mapping:

- Keep launcher window, titlebar, toolbar, sidebar, and overall window geometry untouched.
- Replace only the current empty/list content inside the `Projects` view when the shell-visible project set is the `Trip to Malta` case.
- Center the folder interaction inside the existing `Projects` pane and scale it responsively with a capped width so it still reads like the original object.
- Use `motion/react` locally in the shell because that matches both the repo and the reference.

## Asset Mapping Plan

Requested source files:

- `picture1.jpg`
- `picture2.jpg`
- `picture3.jpg`

Observed source aspect ratio:

- all three are portrait images, `686 x 914`

Planned mapping:

- back/left card: `picture3.jpg`
- middle card: `picture2.jpg`
- front/right card: `picture1.jpg`

Planned asset location:

- move all three files into `src/pieces/trip-to-malta/assets/`

Card treatment:

- keep the reference card proportions and transforms
- swap paper mock content for `img` fills
- preserve rounded card framing, gloss overlay, grain, and shadow stack so the images still feel like intentional objects rather than flat thumbnails

## Concrete Implementation Plan

1. Create this report before any UI edits.
2. Add a new hosted piece folder: `src/pieces/trip-to-malta/`
3. Move `picture1.jpg`, `picture2.jpg`, `picture3.jpg` into the piece’s `assets` folder.
4. Register `trip-to-malta` in `src/pieces/registry.ts` as:
   - `approved`
   - `hosted`
   - shell-visible
5. Build a minimal `Trip to Malta` project stage using the same three images in a restrained photo layout.
6. Replace the current `Projects` empty/list rendering with a specialized folder interaction when the public project set contains only `trip-to-malta`.
7. Implement launcher behavior:
   - closed by default
   - hover fans cards upward
   - click toggles persistent open state
   - in open state, clicking an image opens the real `Trip to Malta` hosted project window
   - outside click and `Escape` collapse the folder
8. Keep reduced-motion support:
   - remove 3D transforms and spring choreography
   - retain state clarity and click/open behavior
9. Validate locally with Playwright and compare against the live reference.

## Risks / Ambiguities

- The reference itself is not keyboard-accessible. Our implementation should keep the visual feel but improve semantics and keyboard affordance.
- Opening a real project window is an intentional behavioral deviation because the reference has no routed project shell.
- The local launcher pane is wider than the reference canvas, so scale and centering must be tuned carefully to avoid feeling undersized or floating without context.
- Image content has stronger visual detail than the reference placeholder documents, so the card overlays and shadows need to stay strong enough to preserve the same depth hierarchy.

## Acceptance Checklist

- [ ] Report exists before implementation work.
- [ ] Launcher shell chrome is unchanged.
- [ ] `Trip to Malta` appears as a real shell-visible hosted project.
- [ ] `Projects` count updates coherently.
- [ ] Folder rest state matches the reference composition.
- [ ] Hover-in feels layered and soft.
- [ ] Hover-out returns without jitter.
- [ ] Click creates persistent open state.
- [ ] Outside click collapses back to rest.
- [ ] `Escape` collapses back to rest.
- [ ] Open-state image clicks open the `Trip to Malta` project window.
- [ ] Rapid repeated hover/click does not break transforms.
- [ ] Images render correctly in launcher and project window.
- [ ] No clipping issues appear in the launcher pane.
- [ ] Reduced-motion behavior is respected.
- [ ] `npm run typecheck` passes.
