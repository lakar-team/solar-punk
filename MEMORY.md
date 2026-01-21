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

## 📈 CURRENT STATUS (Last Update: Jan 22, 2026)
- **Tech CV Integrated**: Updated `profile.ts`, `projects.ts`, and added `Adam_Tech_CV.md`.
- **HUD Update**: Added a functional download button for the CV.
- **Environment**: Local environment is synced with GitHub `main`.

---

## ✅ COMPLETED TASKS
- [x] Restructured project data to reflect "Product Strategy Lead" persona.
- [x] Implemented 3D Scene with planet-based navigation.
- [x] Integrated Tech CV content and created a markdown version in `public/`.
- [x] Added "Download Tech CV" link to the HUD component.
- [x] Pushed all latest changes to trigger Vercel deployment.

---

## 🚀 ROADMAP & NEXT STEPS
1. **CV PDF**: User/AI needs to generate `Adam_Tech_CV.pdf` from the markdown and place it in `/public`.
2. **Project Deep Dives**: Enhance planet data with more detailed descriptions or modals when clicked.
3. **Refine HUD**: Add more interactive "System Status" feedback or animations.
4. **Adam Site Cleanup**: Safe to delete the redundant `Adam Site` folder once confirmed.

---

## 📝 SESSION LOGS
*Short notes on what changed in recent sessions*
- **2026-01-22**: Pushed Tech CV updates. Created `MEMORY.md`. Identified missing PDF asset.
