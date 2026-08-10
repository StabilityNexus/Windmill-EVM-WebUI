# Windmill Exchange — Typography

## Fonts

The web interface loads two fonts:

| Font | Variable | Role |
|---|---|---|
| **Geist** | `--font-sans` | Primary interface font (headings, body) |
| **Inter** | `--font-inter` | Accent/utility font |

## Scales

The design uses a fluid type scale. Common sizes:

| Token | Size | Weight | Usage |
|---|---|---|---|
| Display | `text-4xl` – `text-6xl` | 700–800 | Hero headings |
| H1 | `text-3xl` | 700 | Page titles |
| H2 | `text-2xl` | 700 | Section headings |
| H3 | `text-lg` – `text-xl` | 600 | Card titles |
| Body | `text-sm` – `text-base` | 400–500 | Paragraphs |
| Caption | `text-xs` | 500 | Labels, footnotes |
| Overline | `text-[10px]` | 800, uppercase, wider tracking | Navbar labels, eyebrow text |

## Rules

- Headings use tight tracking and bold weight; body text stays at 400 for legibility.
- Numbers and prices are rendered in tabular/regular numeric styling for alignment in stats tables.
- Line-height: 1.5 for body, 1.1–1.2 for display headings (Tailwind defaults).
- Fonts are bundled via `next/font/google` in `app/layout.tsx`; no external font requests at runtime.