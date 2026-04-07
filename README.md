# Button Constructor

**[English](#) | [Русский](README_RU.md)**

Visual game button designer. Build a stylized button from scratch, tweak every parameter, and export the result as PNG, CSS, or Flutter code.

The app builds into a **single HTML file** — can be opened in a browser without a server.

---

## Installation

You need [Node.js](https://nodejs.org/) (v18+) installed.

```bash
git clone https://github.com/E2GO/button-constructor.git
cd button-constructor
```

Then run `start.bat` (Windows) or `start.sh` (Linux/Mac) — dependencies will install automatically and the dev server will launch.

Or manually:

```bash
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### Build

To build a single HTML file you can share without a server:

```bash
npm run build      # creates dist/index.html
```

---

## Interface

The screen is split into three columns:

| Left Panel | Center | Right Panel |
|---|---|---|
| Button settings: shape, colors, layers, effects, icon, badges, states | Button preview + export/save | Text settings: color, stroke, shadows, glow |

### Top Bar — Presets

Colored buttons at the top are **built-in presets** (Green, Blue, Red, Purple, Yellow, Framed). Click to load a full set of settings. You can save your own preset — it will appear next to them.

---

## What You Can Customize

### Button Shape
- Width, height, border radius
- Depth (3D effect via bottom shadow)
- Render mode: **CSS** (standard div) or **SVG** (arbitrary shapes: squircle, star, shield, heart, cloud, hexagon, custom path)

### Button Body
- **Gradient layers** — add multiple layers with different blend modes (multiply, screen, overlay, etc.)
- Each layer: color stops, gradient angle, opacity

### Surface Effects
- **Shine** — top highlight (color, height, opacity, blur, angle)
- **Darken** — bottom darkening
- **Inset Light / Dark** — inner edge shadows
- **Blicks** — individual light spots/ellipses, draggable on the preview

### Text
- Color, size, opacity
- **Text gradient** (two-color, with angle)
- **Stroke** (two methods: shadow-based or -webkit-text-stroke)
- **Drop shadows** — unlimited external shadows (angle + distance + blur)
- **Inner shadows** — with automatic perimeter bevel
- **Glow** — outer glow
- **Inner Glow** — inner glow

### Icon
- Any emoji, position (left/right/free), size
- Shadow, stroke, glow

### Badges
- Label on top of the button (e.g. "SALE")
- Background color, border, rotation, position, shadow, glow

### Frame
- Outer frame around the button
- Three-color gradient, shadow, soft shadow
- Inner frame with separate settings

### Button States
- **Normal** / **Hover** / **Pressed** / **Disabled**
- Each state: translate, scale, brightness, saturation, depth, opacity

---

## Preview

- Background switching: dark, medium, light, white, game gradient, checker (transparency), custom color
- Zoom from 50% to 200%, 1:1 button
- Pixel grid (visible at zoom 150%+)
- **Size Variants** — instant preview in Large / Medium / Small / Icon sizes

---

## Saving & Export

### Saving
- **Variant** — save the current state to the library (bottom of screen). Variants can be tagged (Play, Shop, Settings, General) and searched
- **Preset** — save as a preset in the top bar for quick switching
- **Style** — save separately: Colors / Shape / Text / Full, to apply to another button later

### Export
- **JSON** — copies the full state to clipboard. Can be pasted back via Paste or loaded from a .json file
- **CSS** — generates a CSS class with box-shadow, gradient, border-radius, etc.
- **Flutter** — generates Dart code with BoxDecoration
- **PNG** — downloads a button image (size: 128 / 256 / 512 / custom)

### Sharing Designs
To send a button design to someone:
1. Click **JSON** — copies to clipboard
2. Send the text
3. Recipient clicks **Paste** and pastes the JSON

Or via file: export JSON, save as `.json`, recipient loads it via **File**.

---

## Section Copy/Paste

Each settings group (Button, Text, Frame, States) has Copy/Paste buttons. This lets you copy, for example, only text effects from one button and paste them onto another.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |

---

## Direct Edit

Blicks, badges, icon, and frame offset can be dragged directly on the preview. In Direct Edit mode:
- Drag — move
- Orange handles — rotate
- Blue handles — scale

---

## Tech Stack

- React 19 + Vite 8
- vite-plugin-singlefile (single HTML build)
- html-to-image (PNG export)
- No TypeScript, no state manager — plain useState + custom useHistory hook (undo/redo, up to 50 steps)
- All user data is stored in browser localStorage
