# Design system

Minimal, image-led, editorial. One typeface (Arial), one weight. Hierarchy comes only from **size, colour and spacing**.

The styling is **Tailwind CSS 4**. Tokens live in `src/input.css`; markup uses Tailwind utility classes and variants (`hover:`, `md:`, `aria-[current=page]:`, `group-data-[page=inner]/page:` ...). The compiled file `style.css` is committed, so GitHub Pages serves it as is: **no build runs on the server**.

## Rebuild the CSS after changing styles

```bash
tailwindcss -i src/input.css -o style.css --minify
```

(Installed with `brew install tailwindcss`. Changing Are.na content never needs this.)

## Rules

- **Spacing is always Tailwind's 4px scale**: `p-1`=4, `p-2`=8, `p-3`=12, `p-4`=16, `p-6`=24, `p-8`=32 ... No half steps (`p-0.5`, `p-1.5`) and no arbitrary pixel values for spacing.
- **Colours are Tailwind palette values through three roles** (never raw hex):
  - `text-ink` = neutral-900: titles, active nav, image names
  - `text-ink-2` = neutral-700: reading text, captions
  - `text-ink-3` = neutral-500: muted text (inactive nav, credits, counters, footer); 4.5:1 on the background, so still accessible
  - `bg-paper` = stone-50: page background
- **Text styles** are named utilities and work with variants (`hover:type-ui`, `md:type-title`):

| Utility | Tailwind size | Colour | Used for |
|---|---|---|---|
| `type-title` | `text-2xl` (24px), tight | ink | Page and project titles, the loudest text on inner pages |
| `type-body` | `text-sm` (14px), relaxed | ink-2 | Descriptions, about me |
| `type-ui` | `text-sm` (14px) | ink-3 | Navigation, buttons |
| `type-meta` | `text-xs` (12px) | ink-2 | Captions, credits, counters |
| `type-micro` | `text-xs` (12px) | ink-3 | Footer |
| wordmark | `text-base` (16px), tight | ink (home) / ink-3 (inner) | "margaux chalançon" |

## Page states (variants driven by `data-` attributes on `<body>`)

- `data-page="home"`: name in full ink, nav in ink-2. The photo is the content.
- `data-page="inner"`: name and nav fade to ink-3; the **current section is the only nav item in ink + underlined**; the page title is the largest text. Hover restores full ink.
- `data-fit="true"` (homepage, carousels, viewer): the page never scrolls; the image scales to the space between header, caption and footer. Otherwise the page scrolls only when content is taller than the screen.
- Footer is sticky at the bottom of the window.
- Mobile first: `md:` (768px) switches to the desktop layout.

## Project pages

- Grid with rows of equal height (`[--row-h:148px]` mobile, `md:[--row-h:232px]`); images keep their proportions, no crops, read left to right in order.
- Click opens the viewer (`#/project/<slug>/<n>`); arrows, swipe and ← → keys move; Esc or "close" returns to the grid at the same scroll position.

## Image order in projects

In each project's Are.na channel, start a block's **title** with a number: `1`, `2 sea`, `3. harbour`, `4 - night`. Numbered blocks come first in numeric order; the number is removed from the displayed name. Unnumbered blocks follow in their Are.na order. Four-digit numbers (years, filenames) are not treated as order numbers.
