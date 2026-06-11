# Team Friday Fun / Windsor AI Personality Lab

Static Astro front end for the Team Friday Fun work-style quiz.

Public Pages URL target:

`https://jbsetian.github.io/team-friday-fun/`

## Backend note

GitHub Pages is static hosting only. Full functionality still requires the private TFF API backend on the Pi for:

- quiz submissions
- result lookup by submission id
- admin submissions list
- JSON/CSV exports
- generated portrait/sketch requests
- SQLite submission storage

Set the backend at build time with:

```bash
PUBLIC_TFF_API_BASE=https://YOUR-BACKEND-HOST/api/tff GITHUB_PAGES=true npm run build
```

Do **not** commit SQLite databases, `.env` files, API keys, backend code, or real admin credentials.
