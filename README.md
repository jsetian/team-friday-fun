# Team Friday Fun / Windsor AI Personality Lab

Static Astro front end for the Team Friday Fun work-style quiz.

## GitHub Pages mode

This repo can be published as a GitHub Pages project site at:

`https://jbsetian.github.io/team-friday-fun/`

Build with:

```bash
PUBLIC_TFF_API_BASE=https://tff.jseds.com/api/tff GITHUB_PAGES=true npm run build
```

## Important backend note

GitHub Pages is static hosting only. The following features require the separate TFF API backend:

- quiz submissions
- result lookup by submission id
- admin submissions list
- JSON/CSV exports
- generated portrait/sketch requests
- SQLite submission storage

For now, the Pages build should point at the existing backend:

`https://tff.jseds.com/api/tff`

Do **not** commit SQLite databases, `.env` files, API keys, or real admin credentials.
