# Beer Cheer Website

React 19 + Vite site that recreates the legacy Beer Cheer header/hero section (logo, gears, bottle belt animation, and floating bubbles) from the current production website.

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Notes

- Legacy top-section images are stored in `public/legacy/images`.
- Legacy animation behavior is ported into React-safe modules:
	- `src/legacy/bubble.js`
	- `src/legacy/bottles.js`
- Azure Static Web Apps config is in `staticwebapp.config.json`.

## GitHub + Azure Static Web App Deploy

This repo includes workflow file `/.github/workflows/azure-static-web-apps.yml`.

1. Create/push repository (expected name: `beer-cheer.com`).
2. Create Azure Static Web App resource in existing resource group `BeerCheer`.
3. Add the deployment token as GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.

Useful commands:

```powershell
# In repo root
git init
git add .
git commit -m "Initial Beer Cheer React site"

# Create and push GitHub repo
gh repo create beer-cheer.com --public --source . --remote origin --push

# Create static web app in existing resource group
az staticwebapp create `
	--name BeerCheer `
	--resource-group BeerCheer `
	--location eastus2

# Get deployment token
az staticwebapp secrets list --name BeerCheer --resource-group BeerCheer --query properties.apiKey -o tsv
```

Then add the returned token in GitHub:

- Repository Settings -> Secrets and variables -> Actions -> New repository secret
- Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`

After that, every push to `main` deploys the site.
