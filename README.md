George David Tsitlauri | Portfolio Website

Author: George David Tsitlauri
Contact: gdtsitlauri@gmail.com

Personal portfolio focused on artificial intelligence, systems, security, infrastructure, research, and selected software projects.

Live site: gdtsitlauri.dev

Overview

This repository contains a static single-page portfolio website. The project is separated into dedicated HTML, CSS, and JavaScript files for easier maintenance.

The website presents:

BSc and MSc education

research work and selected academic projects

selected web projects

technical skills and spoken languages

contact links and a downloadable CV

an interactive Three.js visualization of a cryptographic processor with 3D-stacked memory

Tech Stack

HTML5

CSS3

Vanilla JavaScript

Three.js via ES modules and import map

Google Fonts

Font Awesome

Features

Responsive desktop, tablet, and mobile layout

Fixed desktop introduction panel

Interactive, auto-rotating 3D chip visualization

Click / keyboard-controlled exploded view for the 3D processor

Adaptive 3D rendering quality for desktop and mobile devices

Performance-aware rendering that pauses when the 3D canvas is not visible

Animated loader and section reveal effects

Reduced-motion accessibility support

Keyboard focus states and skip-to-content navigation

Custom scrollbar styling

Mobile safe-area support

SEO, Open Graph, and Twitter Card metadata

Static-hosting-compatible deployment

Custom domain support through CNAME

3D Hero Render

The hero canvas depicts a semiconductor-inspired processor package with:

a metallic IHS lid

a CPU logic die and redistribution bridge

color-coded L0–L3 stacked-memory layers

a green package substrate

physically based materials and environment lighting

adaptive texture size, render resolution, and device-pixel ratio

automatic rendering pause when the canvas is off-screen or the browser tab is inactive

The Three.js dependencies are loaded from a CDN through an import map defined in index.html.

Project Structure

.
├── index.html                       # Main website markup and metadata
├── styles.css                       # Layout, responsive design, cards, animations, and theme
├── main.js                          # Loader, reveal animations, and project-card interactions
├── chip3d.js                        # Three.js processor visualization and rendering logic
├── profile.jpg                      # Profile image
├── George_David_Tsitlauri_CV.pdf   # Downloadable CV
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon-48x48.png
├── favicon-64x64.png
├── favicon-180x180.png
├── favicon-192x192.png
├── favicon-256x256.png
├── favicon-512x512.png
├── apple-touch-icon.png
├── CNAME                            # Custom domain configuration
├── LICENSE
└── README.md

Local Development

Because the 3D visualization uses JavaScript ES modules, the website should be previewed through a local HTTP server rather than by opening index.html directly with a file:/// URL.

Python

If Python is installed:

python -m http.server 8000

Then open:

http://localhost:8000/

Node.js

If Node.js is installed:

npx serve .

VS Code

You can also use the Live Server extension in Visual Studio Code and open index.html with Open with Live Server.

The deployed GitHub Pages / custom-domain version runs over HTTPS, so ES modules load normally there.

Deployment

The site is designed for static hosting and can be deployed with GitHub Pages or another static hosting service.

The included CNAME file configures the custom domain:

gdtsitlauri.dev

The main site files (index.html, styles.css, main.js, and chip3d.js) should remain in the repository root so their relative paths resolve correctly.

External Dependencies

The following dependencies are loaded from CDNs:

Three.js

Three.js addons

Google Fonts

Font Awesome

An internet connection is therefore required for the complete local preview, including the 3D processor visualization, fonts, and icons.

License

This project is available under the MIT License.