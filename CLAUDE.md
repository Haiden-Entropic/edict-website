# Project: Edict Marketing Website

## Overview
Single-page marketing website for Edict, a healthcare IT medication monitoring platform for Wisconsin pharmacies and providers. Design inspired by antigravity.google — dark, cinematic, with particle animations and smooth scroll effects.

## Tech Stack
- Astro 5 (static site, no SSR)
- Tailwind CSS v4 via @tailwindcss/vite (NOT @astrojs/tailwind)
- GSAP + ScrollTrigger for scroll animations and section snapping
- Lenis for smooth scroll normalization
- Canvas 2D for particle backgrounds and ring halo
- Vanilla JS for cursor-reactive parallax
- Netlify Forms for contact form
- Deployed on Netlify

## Commands
- `npm run dev` — Start dev server at localhost:4321
- `npm run build` — Production build to dist/
- `npm run preview` — Preview production build

## Project Structure
- src/layouts/Layout.astro — Base HTML layout with head, fonts, analytics
- src/pages/index.astro — Single-page home (all sections)
- src/components/ — Individual section components (Hero, Features, HowItWorks, Pilot, Contact, Footer)
- src/scripts/ — JavaScript modules (particles.js, ringHalo.js, parallax.js, scrollAnimations.js)
- src/styles/global.css — Tailwind CSS entry with @theme tokens
- public/ — Static assets (favicon, og-image, robots.txt)

## Design System
- Background: #0B0F1A (deep navy-black), surface: #111827, cards: #1F2937
- Accent: #06B6D4 (cyan), secondary: #3B82F6 (blue), tertiary: #10B981 (emerald)
- Text: #F9FAFB (headings), #D1D5DB (body), #6B7280 (muted)
- Font: Inter via Google Fonts (400, 500, 600, 700)
- Buttons: rounded-full pill shape, gradient from-cyan-500 to-blue-500
- Cards: bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl
- Section height: min-h-screen (100vh sections)
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

## Animation Guidelines
- All animations MUST respect prefers-reduced-motion
- Particle canvas: ~50 particles, Canvas 2D, requestAnimationFrame
- Ring halo: ~60 particles in a ring, rotating with breathing effect
- Scroll: GSAP ScrollTrigger snap with power2.inOut easing, 0.3-0.8s duration
- Entry animations: fade-in + slide-up (y:40, opacity:0, 0.8s, power2.out)
- Stagger: 150ms between elements in groups
- Cursor parallax: lerp factor 0.08, translate3d, data-depth attributes
- Lenis smooth scroll: lerp 0.1, wheelMultiplier 0.8

## Important Rules
- NEVER use @astrojs/tailwind — use @tailwindcss/vite
- Use @import "tailwindcss" NOT @tailwind directives
- All sections are Astro components imported into index.astro
- Use semantic HTML (main, section, nav, footer, article)
- Include aria-hidden="true" on decorative canvas elements
- Contact form must use data-netlify="true" and netlify-honeypot="bot-field"
- Add hidden input: <input type="hidden" name="form-name" value="contact" />
- Include HIPAA notice below form: "Do not submit PHI through this form"
- Keep all JavaScript in <script> tags in Astro components or src/scripts/