# Windmill Exchange — Color Palette

The Windmill Exchange brand uses the following palette. These values match the Stability Nexus organization brand.

## Primary Colors

| Token | Name | Hex | Usage |
|---|---|---|---|
| `windmill-black` | Ink | `#0A0A0A` | Primary text, primary buttons, hero elements |
| `windmill-white` | Paper | `#FFFFFF` | Backgrounds, typography on dark surfaces |
| `windmill-green` | Match Green | `#228B22` | Brand primary, success states, hub of the logo mark |
| `windmill-yellow` | Accent Yellow | `#FFC517` | Highlights, badges, call-to-action accents |

## Neutrals

| Token | Hex | Usage |
|---|---|---|
| `neutral-50` | `#FAFAFA` | Subtle surfaces |
| `neutral-100` | `#F5F5F5` | Borders, cards |
| `neutral-400` | `#A3A3A3` | Muted text on dark |
| `neutral-500` | `#737373` | Secondary text |
| `neutral-900` | `#171717` | Footer background, dark surfaces |

## Surface Tokens (Renovation)

The landing renovation adds a warm "paper canvas" surface layer on top of the base
theme. These are CSS variables in `app/globals.css` and Tailwind utilities.

| Token / utility | Role |
|---|---|
| `--canvas` / `bg-canvas` | Warm off-white page ground for the hero and marketing sections (dark: near-black with a faint warm cast) |
| `--canvas-raised` / `bg-canvas-raised` | Floating cards and panels that sit above the canvas |
| `--canvas-sunken` / `bg-canvas-sunken` | Recessed wells and inset areas |
| `--shadow-float-sm/md/lg` / `shadow-float-*` | Soft, warm-tinted elevation for the 3D collage cards |
| `bg-canvas-grain` | Subtle dotted paper texture for the hero |

The warm tint is a low-chroma derivative of **Accent Yellow**, so the canvas reads
as brand-adjacent rather than a flat grey.

## Usage Rules

- **Match Green** is reserved for the brand: primary CTAs, the logo hub, success feedback.
- **Accent Yellow** is used sparingly as a highlight — badges, attention markers, the orbiting accent in the logo.
- Text on **Match Green** surfaces must be white; text on **Accent Yellow** surfaces must be `#0A0A0A`.
- The palette is reflected in the codebase via Tailwind tokens in `app/globals.css`.