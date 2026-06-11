# Site Guide

This is the first-stop reference for an AI working on TFF Work Style Lab without prior context.

## What this repo is

- `tff-src/` contains the Astro source for the public quiz experience
- `public/` contains the generated static site output
- `scripts/deploy-tff.sh` builds Astro and syncs the result to `tff-public/`

## Source of truth order

1. This guide
2. `README.md`
3. The page source in `src/pages/`
4. The shared data and styling in `src/lib/`, `src/scripts/`, and `src/styles/site.css`

## Current product direction

- Project name: **TFF Work Style Lab**
- Public quiz title: **TFF Work Style Quiz**
- Subtitle: **Don’t worry, you won’t be graded.**
- The experience should feel clean, minimalist, playful, and corporate-safe.
- The quiz uses a one-question-at-a-time flow to keep it lighter and less intimidating.
- Do **not** mention Windsor.
- Do **not** emphasize JSeds branding.
- Do **not** turn this into a personal website or HR tool.
- Do **not** reveal the scored result immediately after submission.
- The admin panel is the only password-protected surface.

## Active routes

- `/` — landing page
- `/quiz/` — public quiz form
- `/result/` — submission confirmation screen
- `/admin/` — password-protected admin dashboard

## Shared style rules

- Soft neutral background
- Clean typography
- Large whitespace
- One obvious primary action
- Calm, readable cards and forms
- Mobile-friendly spacing and tap targets
- Short helper text only when useful
- No neon, arcade, or game-show styling

## Data rules

- Store submissions in SQLite via the companion API.
- Save the participant name, predicted style, raw answers, playful answers, trait scores, and calculated styles.
- Export JSON first; CSV is optional and should stay simple.
- Slide generation happens later from exported JSON, not in the site.

## Important files

- `src/pages/index.astro`
- `src/pages/quiz/index.astro`
- `src/pages/result/index.astro`
- `src/pages/admin/index.astro`
- `src/lib/tff-data.ts`
- `src/lib/tff-api.ts`
- `src/scripts/quiz.ts`
- `src/scripts/admin.ts`
- `src/components/Nav.astro`
- `src/layouts/Base.astro`
- `src/styles/site.css`
- `scripts/tff-api.py`

## Quick routing note

- If a change affects the public quiz, start in this repo and keep the flow simple.
- If a change affects style or brand, update this guide before touching CSS.
