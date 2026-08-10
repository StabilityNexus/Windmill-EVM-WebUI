# Windmill Exchange — Brand

This folder is the single source of truth for the **Windmill Exchange** project branding.

## What's here

- `logo/windmill-logo.svg` — the primary logo (vector, transparent background).
- `logo/windmill-logo.png` — raster fallback of the primary logo (512px, transparent background).
- `logo/windmill-logo-dark.svg` — light mark for use on dark surfaces.
- `logo/windmill-logo-monochrome.svg` — single-color mark for stamps, docs and DCO sign-offs.
- `favicons/` — favicons and app icons for web and mobile.
- `colors.md` — the project color palette.
- `typography.md` — the project typography spec.
- `Brand.md` — this document, describing everything above.

## Brand Mark

- **Mark**: a windmill rotor fused with price curves — four asymmetric blades arranged as a pinwheel, implying constant motion and constant matching of orders.
- **File format**: SVG (vector) is the canonical format. PNG is provided as a raster fallback.
- **Usage**: the mark is always shown without its background. Never distort, recolor, outline or place it on low-contrast backgrounds.

## Accessibility

- Keep at least 8px clear space around the mark at any size.
- Minimum display size for the mark is 16px (favicon). At that size the full color version may be replaced by the monochrome mark for legibility.

## Governance

Brand changes are reviewed as part of normal PR review. Update this folder and the `public/` assets together, and verify the navbar, footer and favicon render correctly after any logo change.