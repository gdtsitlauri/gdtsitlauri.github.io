# George David Tsitlauri | Portfolio Website

**Author:** George David Tsitlauri  
**Contact:** [gdtsitlauri@gmail.com](mailto:gdtsitlauri@gmail.com)

Personal portfolio focused on artificial intelligence, systems, security, infrastructure, research, and selected software projects.

**Live site:** [gdtsitlauri.dev](https://gdtsitlauri.dev)

## Overview

This repository contains a static single-page website implemented in [`index.html`](./index.html). It presents:

- BSc and MSc education
- research work and selected academic or software projects
- technical skills and spoken languages
- contact links and a downloadable CV
- an interactive Three.js visualization of a cryptographic processor with 3D-stacked memory

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Three.js via import map / CDN
- Google Fonts
- Font Awesome

## Features

- Responsive desktop and mobile layout
- Interactive, auto-rotating 3D chip visualization
- Adaptive 3D rendering settings for desktop and mobile devices
- Animated loader and section reveal effects
- Mobile safe-area support
- Basic SEO, Open Graph, and Twitter Card metadata
- Static-hosting-compatible deployment

## 3D Hero Render

The hero canvas depicts a semiconductor-inspired package with:

- a metallic IHS lid
- a CPU logic die and redistribution bridge
- color-coded L0–L3 stacked-memory layers
- a green package substrate
- physically based materials and environment lighting
- adaptive texture size, render resolution, and device-pixel ratio

## Project Structure

```text
.
├── index.html                      # Website markup, styles, and scripts
├── profile.jpg                     # Profile image
├── George_David_Tsitlauri_CV.pdf  # Downloadable CV
├── favicon-* / favicon.ico         # Site icons
├── apple-touch-icon.png
├── CNAME                           # Custom domain
├── LICENSE
└── README.md
```

## Local Development

Run a local HTTP server from the repository directory:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deployment

The site can be deployed to any static hosting service. The included [`CNAME`](./CNAME) configures the custom domain `gdtsitlauri.dev`.

## External Dependencies

Three.js, Google Fonts, and Font Awesome are loaded from CDNs, so an internet connection is required when previewing the site locally.

## License

This project is available under the [MIT License](./LICENSE).
