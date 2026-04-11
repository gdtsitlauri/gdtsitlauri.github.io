# George David Tsitlauri | Portfolio Website

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
- Custom animated hero section
- Interactive / auto-rotating 3D chip render
- Adaptive rendering quality profiles to reduce unnecessary GPU load on smaller screens and mobile devices
- Smooth scrolling navigation
- Section reveal animations
- Custom loader
- SEO and social meta tags
- Static hosting friendly deployment

## 3D Hero Render

The hero canvas renders a stylized but realistic semiconductor-inspired package:

- cryptographic processor core
- 3D-stacked memory layers
- package substrate and gull-wing pins
- adaptive internal render resolution, texture sizes, shadow budget, and FPS cap

Quality is controlled inside [`index.html`](./index.html) with:

```js
const QUALITY_MODE = 'auto'; // 'auto' | 'balanced' | 'mobile' | 'ultra'
```

Current behavior:

- `auto`: chooses a balanced desktop profile or lighter mobile profile
- `balanced`: good visual quality with lower render cost on desktop
- `mobile`: lighter internal render settings for smaller/coarse-pointer devices
- `ultra`: maximum sharpness / highest GPU usage

At the moment, all profiles target `60 FPS`; the main differences between them are internal render size, texture resolution, shadow-map size, and power preference.

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
- The current 3D hero render has been tuned for visual quality while avoiding unnecessary full-resolution GPU usage on smaller displays.
