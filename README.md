# gdtsitlauri.dev

**A personal research website that shows the work itself, from hardware to AI, on one page.**

This repository is the source of [gdtsitlauri.dev](https://gdtsitlauri.dev), the website of George David
Tsitlauri (MSc student in Artificial Intelligence & Applications, University of Thessaly; CACS Lab). It is a
static single page: plain HTML, CSS and JavaScript, with no build step and no framework.

The page centres on an interactive 3D model of **Crypto3DStackCPU**, the secure processor of the author's
research, and lists the research, academic and web projects with links to their repositories. The CV is
served as a PDF next to the page.

| section | what it shows |
| --- | --- |
| Intro panel | photo, name, role (AI & Systems Research Engineer), the 3D processor, links to CV, email, GitHub, LinkedIn |
| Who I Am | MSc and BSc, specialization (Data Management & AI), research lab (CACS Lab), what drives me |
| Research Projects | Crypto3DStackCPU and CUDA-zkML (preliminary PhD research), TELEMACHUS (MSc thesis); supervisor Prof. G. Dimitriou |
| Academic Projects | CryptoCPU (BSc thesis), NEXUS, CCC IR Optimizer, GPBFT, Kubernetes Autoscaler |
| Web Projects | Skyrianos, OstrichZooPark, Pavlidi Home (private) |
| Technical Skills | Programming, AI / Data, Hardware, Web, Dev |
| Spoken Languages | Greek, Russian (native); English (ECCE, University of Michigan) |

## The 3D processor

`chip3d.js` builds the model in Three.js at load time; there are no model files.

- **Layers.** A secure CPU and cryptographic logic die under four memory dies, as in the research design:
  L0 encrypted instructions, L1 encrypted data, L2 keys and metadata, L3 tamper sentinel.
- **Interaction.** Drag to rotate. Click, tap, Enter or Space toggles the exploded view, which lifts the
  layers apart.
- **Rendering.** Physically based materials, environment lighting and filmic tone mapping. Texture size,
  render resolution and pixel ratio adapt to the device.
- **Cost.** Rendering pauses when the canvas is off screen or the tab is hidden.

## Design

- **Layout.** On wide screens the intro is a fixed panel on the left and the content scrolls on the right.
  On tablets and phones everything stacks into one column.
- **Surfaces.** Glass cards (backdrop blur and shadow, no fill) over a full-height gradient; the contact
  icons stand alone and lift on hover.
- **Type.** IBM Plex Mono for text and headings, Caveat for the name and the loader, IBM Plex Sans
  Condensed for the labels printed on the 3D processor dies.
- **Accessibility.** One `h1`, real headings per section, alt text, keyboard focus states, a keyboard-operable
  3D canvas, and `prefers-reduced-motion` support (all animation off).
- **Metadata.** Description, canonical URL, Open Graph and Twitter cards, favicons for every platform.

## Checks (2026-10-06)

- All external links return 200: the ten GitHub repositories, the GitHub profile, the supervisor's and the
  lab's pages, Font Awesome and Three.js. LinkedIn answers 999 to scripted requests, as it always does; it
  opens normally in a browser.
- The HTML parses with every tag closed, no duplicate ids, alt text on the image, and `noopener` on every
  link that opens a new tab. Every class used in the HTML is defined in the CSS.
- No horizontal overflow at about 500, 768 and 1280 px wide.

## Limitations (reported as such)

- Three.js, the fonts and the icons load from CDNs, so the full page needs an internet connection.
- The 3D model needs WebGL. Without it the rest of the page works and the loader gives up after 6 seconds.
- Widths below about 500 px were not checked in the automated runs, only by hand on a phone.
- There is no publications section yet; it will be added when there are publications.

## Folder map

```
gdtsitlauri.github.io/
  index.html                      the page: content, metadata, import map for Three.js
  styles.css                      layout, glass cards, responsive rules, animations
  main.js                         loader, reveal animations, clickable project cards, back-to-top
  chip3d.js                       the Three.js processor model
  George_David_Tsitlauri_CV.pdf   the CV linked from the page
  profile.jpg                     photo
  favicon*.png, favicon.ico, apple-touch-icon.png
  CNAME                           custom domain (gdtsitlauri.dev)
  LICENSE (MIT), README.md, .gitignore
```

## Running locally

The 3D model uses ES modules, so open the page through a local server, not as a `file:///` URL.

```bash
python -m http.server 8000      # then open http://localhost:8000/
# or: npx serve .
```

## Updating

- **CV.** Replace `George_David_Tsitlauri_CV.pdf`; keep the file name, the page links to it.
- **Styles.** After editing `styles.css`, raise the `?v=` number on its `<link>` in `index.html`, so that
  browsers fetch the new file instead of a cached one.
- **Deploying.** Push to the default branch; GitHub Pages serves the root with the domain in `CNAME`.

## License

George David Tsitlauri, 2026. MIT License (`LICENSE`).
