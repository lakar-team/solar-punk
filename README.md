# ☀️ SOLAR PUNK: PLANETARY PORTFOLIO

![Version](https://img.shields.io/badge/Version-1.0.5--STABLE-orange)
![Engine](https://img.shields.io/badge/Engine-Next.js_15%2B-black)
![3D](https://img.shields.io/badge/3D-Three.js_%2F_Drei-yellow)

**Solar Punk** is an immersive, 3D planetary portfolio experience. It combines high-fidelity WebGL graphics with a futuristic HUD interface, creating a personal "digital planet" that showcases projects and skills in a solar-themed environment.

## 🪐 Core Experience

- 🌎 **Interactive Planet**: A central 3D scene built with **@react-three/fiber**, featuring procedural textures and dynamic lighting.
- 📡 **HUD Interface**: A futuristic Heads-Up Display UI powered by **Framer Motion** for sleek, hardware-accelerated transitions.
- 📱 **Adaptive Performance**: Intelligent redirection logic for mobile devices to ensure a smooth experience across all hardware.
- 🌌 **Atmospheric Audio**: (Integrated) Environmental soundscapes that react to user interaction within the 3D space.

## 🚀 Technical Stack

- **Framework**: Next.js 15+ (App Router)
- **3D Engine**: Three.js / @react-three/fiber / @react-three/drei
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS

## 🛠️ Setup & Local Development

### 1. Installation
```bash
npm install
```

### 2. Ignition
Start the development server:
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## 📦 Project Structure

- `/src/app/canvas`: Central Three.js scene components.
- `/src/app/ui`: HUD and overlay components.
- `/src/hooks`: Custom Three.js and animation hooks.
- `vercel.json`: Optimized deployment configuration for Vercel.

---
&copy; 2026 Lakar Lab / Advanced Agency Framework
