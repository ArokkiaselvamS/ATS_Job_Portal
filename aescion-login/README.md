# Aescion — EdTech Login UI

A pixel-focused, production-quality React + Vite recreation of the Aescion login
screen: hand-drawn-style hero illustration, animated Student/Employee switcher,
validated login form, forgot-password modal, social login row, and a security
trust card — all built with real markup (no image assets), Framer Motion, and
Lucide icons.

## Getting started

```bash
npm install
npm run dev      # starts the dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Project structure

```
src/
├── components/
│   ├── AescionLogo.jsx / .css        Triangular emblem + wordmark (pure SVG)
│   ├── HeroSection.jsx / .css        Left panel: logo, headline, illustration
│   ├── HeroIllustration.jsx / .css   Desk scene (laptop, books, lamp, plants…)
│   ├── LanguageSelector.jsx / .css   Globe pill + animated dropdown
│   ├── RoleSwitcher.jsx / .css       Student / Employee segmented control
│   ├── InputField.jsx / .css         Reusable input with icon + validation
│   ├── LoginForm.jsx / .css          Right panel: full login form
│   ├── SocialLogin.jsx / .css        Google / Microsoft / Apple buttons
│   ├── SecurityCard.jsx / .css       "Secure & Trusted Platform" card
│   ├── ForgotPasswordModal.jsx / .css
│   ├── Toast.jsx / .css              Bottom-right notification stack
│   └── CustomCursor.jsx / .css       Subtle desktop-only cursor micro-interaction
├── App.jsx / App.css                 Page shell, state, orchestration
├── main.jsx
└── index.css                         Design tokens (colors, radii, shadows, fonts)
```

## What's implemented

- **Student / Employee switcher** — animated pill using Framer Motion `layoutId`.
- **Form validation** — full name, mobile number, email-or-username, and password
  (6+ chars) are all validated on blur/submit with inline, custom-styled errors
  (no browser default popups).
- **Password visibility toggle**.
- **Remember me** — persisted to `localStorage` and restored on reload.
- **Forgot password** — animated modal (backdrop fade + scale/slide), with its
  own email validation and a simulated "send" + success state.
- **Login button** — gradient background, hover/tap motion, a looping diagonal
  shine, and a loading → success toast flow.
- **Social login row** — Google / Microsoft / Apple, drawn with inline SVG/CSS
  (no logo image files). Each shows a toast confirming the integration point.
- **Language selector** — switches the visible copy between English, Tamil, and
  Hindi.
- **Security card** with a subtle pulsing glow on the shield icon.
- **Custom cursor** — desktop + fine-pointer only, expands over interactive
  elements, automatically disabled on touch/mobile.
- **Responsive layout** — tested down to 360px; the two-column layout stacks
  below 860px.

## Connecting real authentication

All "backend" behavior in this project is a **frontend demo only**, clearly
isolated so you can wire it up later:

- `src/components/LoginForm.jsx` → `handleSubmit()` — replace the
  `setTimeout` block with your real sign-in call (Firebase, Supabase, or your
  own API).
- `src/components/ForgotPasswordModal.jsx` → `handleSubmit()` — replace the
  `setTimeout` block with a real password-reset request.
- `src/components/SocialLogin.jsx` — the `onSelect` callback (wired in
  `LoginForm.jsx`) is where you'd trigger an OAuth redirect/popup per provider.

## Notes

- Fonts: "Baloo 2" (display/headline) + "Poppins" (body), loaded via Google
  Fonts in `index.html`.
- All illustration, logo, and icon artwork is generated from SVG/CSS/JSX —
  there are no `<img>` tags or background-image assets anywhere in the UI.
- `prefers-reduced-motion` is respected; decorative animations are disabled
  for users who request reduced motion.
