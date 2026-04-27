# George David Tsitlauri | Portfolio Website

**Author:** George David Tsitlauri  
**Affiliation:** Dept. of Informatics & Telecommunications, University of Thessaly, Greece  
**Contact:** gdtsitlauri@gmail.com  
**Year:** 2026

Personal portfolio website for **George David Tsitlauri**, focused on AI, systems, security, infrastructure, research, and selected software projects.

Live site: **[gdtsitlauri.dev](https://gdtsitlauri.dev)**

## Overview

This repository contains a **static single-page portfolio** implemented primarily in [`index.html`](./index.html).

The site includes:

- a responsive hero section with a custom **Three.js 3D render** of a **cryptographic processor with 3D-stacked memory**
- academic thesis and research sections
- selected public projects
- skills and spoken languages
- contact links and CV access

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Three.js via import map / CDN
- Google Fonts
- Font Awesome

## Main Features

- Responsive desktop and mobile layout
- Solid `#190a3f` background — perfect match with `theme-color` for Safari/Chrome status bar on all devices
- `theme-color` meta tag for mobile browser chrome color matching
- Custom animated hero section with structured vertical layout (photo → name → tag → 3D CPU → tagline → buttons)
- Interactive / auto-rotating 3D chip render with realistic material colors
- Glass morphism cards, buttons, hero tag, and contact links with `backdrop-filter` blur
- Nav bar: GDT logo only, transparent, scrolls with page (not fixed)
- Section reveal animations (fade, zoom) via IntersectionObserver
- Custom loader with animated white progress bar
- GDT favicon set — 11 files covering all platforms (browser, iOS, Android/PWA), dark navy→purple gradient
- `viewport-fit=cover` + `env(safe-area-inset-*)` support for iPhone notch / Dynamic Island
- Adaptive rendering quality profiles to reduce unnecessary GPU load on smaller screens
- Hover effects (scale, translateY) desktop-only via `@media (hover: hover) and (pointer: fine)` — no color changes on icons
- Icon colors: white/muted by default, no hover color change on any device
- SEO and Open Graph / Twitter Card meta tags
- Static hosting friendly deployment

## 3D Hero Render

The hero canvas renders a stylized but realistic semiconductor-inspired package:

- IHS lid (nickel-plated silver, laser-engraved label)
- CPU logic die and TSV redistribution bridge
- 3D-stacked memory layers (L0–L3) with distinct color-coded silicon dies
- PCB substrate (forest green FR4)
- Realistic materials: MeshPhysicalMaterial with tuned metalness, roughness, and environment lighting
- Adaptive internal render resolution, texture sizes, shadow budget, and FPS cap

Quality is controlled inside [`index.html`](./index.html) with:

```js
const QUALITY_MODE = 'auto'; // 'auto' | 'balanced' | 'mobile' | 'ultra'
```

Current behavior:

- `auto`: chooses a balanced desktop profile or lighter mobile profile
- `balanced`: good visual quality with lower render cost on desktop
- `mobile`: lighter internal render settings for smaller/coarse-pointer devices
- `ultra`: maximum sharpness / highest GPU usage

## Project Structure

```text
.
├── index.html
├── README.md
├── LICENSE
├── CNAME
├── profile.jpg
├── George_David_Tsitlauri_CV.pdf
├── favicon.ico
├── apple-touch-icon.png
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon-48x48.png
├── favicon-64x64.png
├── favicon-180x180.png
├── favicon-192x192.png
├── favicon-256x256.png
├── favicon-512.png
└── favicon-512x512.png
```

## Local Usage

Because the site is static, you can run it locally in either of these ways:

1. Open [`index.html`](./index.html) directly in a browser.
2. Serve the folder with any simple static server for a cleaner preview.

Example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The project is suitable for any static hosting platform, including:

- GitHub Pages
- Netlify
- Vercel static hosting
- Cloudflare Pages

The repository includes a [`CNAME`](./CNAME) file for:

- `gdtsitlauri.dev`

## Notes

- The main site logic and styling live in [`index.html`](./index.html).
- Some external assets are loaded from CDNs, so internet access is required unless they are bundled locally.
- Background is a solid `#190a3f` color — no canvas, no animation — ensuring perfect Safari/Chrome browser chrome match via `theme-color`.
