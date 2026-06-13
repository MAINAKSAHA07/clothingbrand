# Stitch3D — SaaS-Ready Interactive 3D Clothing Configurator

Stitch3D is a premium, high-fidelity 3D clothing customizer and showcase application. Built with Vite, React, Three.js, and React Three Fiber (R3F), it provides clothing brands with an interactive canvas for custom apparel design, parametric body-type fitting, and real-time fabric physics simulation.

---

## 🚀 Key Features

### 1. Interactive 3D Editor (Customizer)
* **Base Color Dyeing**: Change base fabric colors with smooth frame-rate easing transitions.
* **Direct Decal Placement**: Upload, rotate, and scale custom PNG/SVG/JPEG logo decals on front and back panels.
* **Custom Text Overlays**: Dynamically render customizable text (custom font, scale, rotation, color) onto the garment mesh using standard canvas-texture mapping.
* **Full-Wrap Textures**: Switch between solid colors and full-body pattern decals.
* **Undo / Redo Stack**: Built-in debounced state-saving history system powered by Valtio proxies.

### 2. High-Fidelity 3D Showcases
* **360° Spin & Inspect**: Drag or orbit around the high-resolution shirt mesh under a professional 3-point studio lighting setup (key light, fill light, rim light) with realistic fabric roughness and metalness parameters.
* **See It Worn (Parametric Fit)**: Drapes the customized shirt dynamically on parametric **Anny human mannequins**. Supports 6 presets (Men & Women in Average, Athletic, and Plus sizes) with automatic non-uniform 3D scaling (adjusting width, height, and depth individually) to prevent clipping and ensure a natural fit.
* **Feel the Fabric (Physics Sim)**: Custom WebGL vertex shader simulation animating waves and wind ripples down the mesh while pinning the shoulders, giving a realistic visual representation of lightweight fabric.

### 3. Modern Landing Page & Animations
* **Industrial Roll-Up Shutter**: A scroll-linked, metallic industrial shutter overlays the dark showcase canvas, opening automatically via GSAP ScrollTrigger as the user enters the section and rolling shut on exit.
* **Curved Zipper Reveal Loader**: A vertical zipper loader seals the screen on initial load. Zipping down splits the panels in a curved peel reveal to introduce the main application.

---

## 🛠️ Tech Stack

* **3D Engine**: [Three.js](https://threejs.org/) & `@react-three/fiber` (R3F)
* **3D Helpers**: `@react-three/drei` (Decal, OrbitControls, useGLTF, ContactShadows)
* **Framework**: React 18 & Vite
* **State Management**: [Valtio](https://github.com/pmndrs/valtio) (reactive proxy-based state synchronization)
* **Animations**: GSAP (ScrollTrigger), Framer Motion, and Maath (vector math easing)
* **Icons**: Tabler Icons (`@tabler/icons-react`)
* **Styling**: Tailwind CSS & Vanilla CSS

---

## 📂 Repository Structure

```
├── anny_glb/              # Local backup folder for parametric models
├── public/                # Static assets served at the root
│   ├── models/            # 3D models (shirt.glb, walking_model.glb)
│   │   └── anny/          # Parametric body models (adult-neutral.glb, etc.)
│   └── favicon.png        # Default application decal logo
├── scripts/               # Parametric body export code
│   ├── export_anny_glb.py # Converts Z-up python meshes to Y-up GLTF meshes
│   └── anny_body_presets.py # Slider presets mapping (age, weight, muscle)
└── src/
    ├── canvas/            # R3F canvas components
    │   ├── AnnyFigure.jsx # Parametric mannequin fitting logic & scale math
    │   ├── Shirt.jsx      # Editor shirt decal & text mapping
    │   ├── ShowcaseCanvas.jsx # Multi-panel orbit & shader simulation controls
    │   └── HeroCanvas.jsx # Banner lighting and automatic rotators
    ├── components/        # App UI components (ColorPicker, ZipperLoader, etc.)
    ├── pages/             # App pages (LandingPage, Customizer)
    └── store/             # Valtio proxy store & history stack
```

---

## 🏃 Getting Started

### Prerequisites
Make sure you have Node.js (version 18 or higher recommended) installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MAINAKSAHA07/clothingbrand.git
   cd clothingbrand
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the hot-reloading development server:
```bash
npm run dev
```
Open `http://localhost:5173/` or the terminal-displayed port in your browser.

### Building for Production
To bundle and optimize the application (saving output to `dist/`):
```bash
npm run build
```
To run a local server previewing the production build:
```bash
npm run preview
```
