---
name: awesome-design
description: Curated registry of 67 design system skills (bento, brutalism, clean, glassmorphism, gradient, minimal, modern, neobrutalism, neon, neumorphism, premium, professional, retro, shadcn, sleek, etc.) for UI aesthetics and DESIGN.md generation.
license: MIT
metadata:
  author: bergside
  version: "1.0.0"
---

# Awesome Design Skills

Curated registry of 67 design system skill specifications to guide AI coding agents in crafting high-quality, aesthetic, and production-ready user interfaces instead of generic AI defaults.

## Available Design Systems

All design system definitions are stored in the `./styles/` subfolder. Each design system contains:
- `SKILL.md`: AI instructions, typography scales, color tokens, spacing scales, accessibility guidelines, and component rules.
- `DESIGN.md`: Human-readable design intent, rationale, and implementation guidelines.

### Categories & Popular Styles

1. **Modern & Tech:**
   - `modern`: Clean modern tech aesthetic with crisp typography and subtle elevation.
   - `clean`: Balanced whitespace, clear hierarchy, and restrained accents.
   - `minimal`: High whitespace, typography focus, and minimal distraction.
   - `bento`: Modular bento-grid layouts with clear container boundaries.
   - `shadcn`: Modern UI components adhering to Tailwind/Radix UI patterns.
   - `agentic`: AI-first interface design with status indicators, streaming states, and thought bubbles.

2. **Visual & Expressive:**
   - `glassmorphism`: Translucent frosted glass surfaces with backdrop blur and delicate borders.
   - `neumorphism`: Soft extrusions and debossed surfaces with dual drop shadows.
   - `claymorphism`: 3D tactile pillowy shapes with inner shadows.
   - `gradient`: Vibrant chromatic blends, mesh gradients, and rich backdrops.
   - `neon`: High-contrast cyberpunk palette with luminous glow effects.
   - `vibrant`: Rich saturated color accents with high energy.

3. **Bold & Distinctive:**
   - `brutalism`: Uncompromising high-contrast blocks, hard drop shadows, and raw typography.
   - `neobrutalism`: Modern playful brutalism with saturated colors, thick black borders, and hard shadows.
   - `editorial`: Print-inspired typography, asymmetrical multi-column editorial layouts.
   - `retro`: Nostalgic vintage styling with warm hues and serif or pixel type.
   - `sleek` & `premium`: Luxury dark-mode tones, subtle gold/bronze accents, and micro-interactions.

## How to Apply a Style

When a specific design aesthetic is requested (e.g. "áp dụng phong cách glassmorphism" or "thiết kế giao diện bento grid"):
1. Locate the corresponding folder under `./styles/<style-name>/`.
2. Read `./styles/<style-name>/SKILL.md` and `./styles/<style-name>/DESIGN.md`.
3. Extract the:
   - **Color Palette & Tokens** (Primary, neutral, accent, surface, border)
   - **Typography Scales** (Display, headings, body, mono fonts & weights)
   - **Spacing & Radius** (Grid scale, container border-radii)
   - **Visual Effects** (Shadows, blur, borders, transitions)
4. Apply these rules directly to the frontend CSS/Tailwind classes and component structures.
