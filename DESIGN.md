# Design system

Minimal, image-led, editorial. One typeface (Arial), one weight. Hierarchy comes only from **size, colour and spacing**. All values live as tokens at the top of `style.css`; change them there.

## Text styles

| Token | Size / line | Colour | Used for |
|---|---|---|---|
| `--type-title` | 22 / 1.25, tight tracking | `--ink` | Page and project titles (the loudest text on any inner page) |
| `--type-body` | 14 / 1.65 | `--ink-2` | Project descriptions, about me |
| `--type-ui` | 13 / 1.3 | `--ink-3` → `--ink` | Navigation, tile labels, buttons |
| `--type-wordmark` | 16 / 1.2, tight | `--ink` home, `--ink-3` elsewhere | "margaux chalançon" |
| `--type-meta` | 12 / 1.5 | `--ink-2` (name in `--ink`, credit in `--ink-3`) | Captions, credits, counters |
| `--type-micro` | 11 / 1.3 | `--ink-3` | Footer |

Colours: `--ink` #171717 (titles, active nav) · `--ink-2` #4d4d4d (reading text) · `--ink-3` #767676 (muted; 4.5:1 on the background, so still accessible).

## Navigation states (information hierarchy)

- **Homepage:** name in full ink; nav in `--ink-2`. The photo is the content.
- **Inner pages:** name fades to `--ink-3`, nav items are `--ink-3`. The **current section is the only nav item in full ink + underlined**, and the page title (22px) is the largest text. Hover brings any nav item or the name back to full ink.

## Spacing

Scale: 4 · 8 · 12 · 16 · 24 · 40 px (`--s1`…`--s6`). Side gutter is fluid (`--gutter`, 16–36px). Header and footer are intentionally slim.

## Layout rules

- Homepage, carousels (things i find pretty, memory triggers) and the image viewer **never scroll**: the image scales to the space left between header, caption and footer.
- All other pages scroll only when content is taller than the screen.
- Footer is sticky and always sits at the bottom of the window.
- Project pages show a grid with rows of equal height; images keep their proportions (no crops) and read left to right in order. Clicking opens the viewer (`#/project/<slug>/<n>`); arrows, swipe and ← → keys move between images, Esc or "close" returns to the grid at the same scroll position.

## Image order in projects

In each project's Are.na channel, start a block's **title** with a number: `1`, `2 sea`, `3. harbour`, `4 - night`. Numbered blocks come first in numeric order; the number is removed from the displayed name. Unnumbered blocks follow in their Are.na order. Four-digit numbers (years, filenames) are not treated as order numbers.
