# Beer Cheer

Part of the Web Sites Hub (github.com/auz1111/web-sites-hub). Shared knowledge, skills and this site's card
(`sites/beer-cheer.md`) live there. On the PC the hub is the parent folder (`..\CLAUDE.md`). In a cloud session that
only has this repo, attach `auz1111/web-sites-hub` to read it. When you learn something reusable here, update the hub.

- Stack: React 19 + Vite 8, react-router-dom 7, oxlint. `api/` = Azure Functions (Node).
- Run: `npm run dev` · Lint: `npm run lint` · Build: `npm run build`
- Deploys from `main` to Azure Static Web Apps (`.github/workflows/azure-static-web-apps.yml`). Work on branches and
  open PRs unless the owner says to push directly.
- Route changes need a 301 in `staticwebapp.config.json` (e.g. `/unity` → `/play`).
- Secrets live in `api/local.settings.json` (gitignored) and SWA app settings. Never in `VITE_*` vars.
