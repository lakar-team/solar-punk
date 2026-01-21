# 🧠 AI MEMORY & PROJECT CONTEXT

> **CRITICAL**: Every AI session must read this file before starting and update it before finishing. Use this to maintain continuity and avoid repeating known errors.

---

## 🏗️ PROJECT IDENTITY
- **Name**: Solar Punk Portfolio
- **Goal**: A high-impact, 3D interactive portfolio site (React Three Fiber + Next.js) showcasing Adam M. Raman's work in Product Strategy, Climate Tech, and Built Environment Innovation.
- **Aesthetic**: Solar-punk (vibrant, nature-meets-tech, glassmorphism, HUD elements).

---

## 🛡️ GUARDRAILS & ANTI-PATTERNS
*(Rules to prevent recurring session errors)*

1. **OS Environment**: System is **Windows (PowerShell)**.
   - ❌ DO NOT use `head`, `tail`, or `grep` (unless using `Select-String`). Use `Get-Content -TotalCount X`.
   - ❌ DO NOT use `/` for file paths in shell commands; use `\` or wrap in quotes.
2. **Git Protocol**:
   - ✅ ALWAYS check `git status` before finishing a task to ensure no edits are left unpushed.
   - ✅ Deployment is automated via Vercel on push to `main`.
3. **Asset Management**:
   - ✅ The site relies on a `public/Adam_Tech_CV.pdf` for the download button.
   - ❌ DO NOT commit the `.md` version only; the HUD specifically expects the `.pdf`.

---

## 📈 CURRENT STATUS (Last Update: Jan 22, 2026 - 07:25)
- **Interactive Sun**: Sun now uses custom face texture and opens an embedded CV viewer when clicked.
- **Orbit Rings**: Visual orbit paths now connect all planets around the sun.
- **Lakar Project Photos**: Added professional project photos from `G:\My Drive\Work\Project Photo`.
- **Linktree Documents**: Pulled PDFs from Linktree folder for PhD research, Lakar projects, and profile background.
- **Tech CV**: PDF is now live at `/public/Adam_Tech_CV.pdf` with embedded viewer in the sun panel.

---

## ✅ COMPLETED TASKS
- [x] Restructured project data to reflect "Product Strategy Lead" persona.
- [x] Implemented 3D Scene with planet-based navigation.
- [x] Integrated Tech CV content and created a markdown version in `public/`.
- [x] Added "Download Tech CV" link to the HUD component.
- [x] Integrated playable HTML games (Kanji Sniper, Demon Hunter).
- [x] Linked external professional and creative assets (Shop, YouTube, Amazon).
- [x] Added orbit rings to visually connect planets.
- [x] Interactive sun with smiling face texture and CV viewer.
- [x] Added Lakar Design project photos (`lakar-1.jpg`, etc.).
- [x] Integrated Linktree presentation PDFs (PhD, Lakar, Profile Background).

---

## 🚀 ROADMAP & NEXT STEPS
1. **Camera Improvements**: Add zoom/pan controls or guided camera paths for better UX.
2. **Mobile Optimization**: Ensure touch-friendly interactions and responsive HUD.
3. **Planet Details**: Add more project-specific content (galleries, videos) to each planet overlay.
4. **Adam Site Cleanup**: Safe to delete the redundant `Adam Site` folder once confirmed.

---

## 📝 SESSION LOGS
*Short notes on what changed in recent sessions*
- **2026-01-22 (Early)**: Pushed Tech CV updates. Created `MEMORY.md`.
- **2026-01-22 (Mid)**: Integrated Kanji Sniper and Demon Hunter HTML apps. Linked Redbubble, YouTube, and Momotaro book. Updated HUD with action buttons.
- **2026-01-22 (Late)**: Added orbit rings, interactive sun with face texture and CV viewer, Lakar project photos, and Linktree presentation PDFs.
