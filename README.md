# BeastPlayer

BeastPlayer is a private, Netflix-inspired personal movie shelf. It runs as a static site, stores watchlist and source settings in the browser, and lets you attach video or embed URLs for media you have permission to watch.

## Run locally

```bash
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/cinevault run dev
```

## Publish with GitHub Pages

The published site is a static build served from the repository root on the `main` branch. To update it, build the app with `VITE_BASE_PATH=/beastplayer/ pnpm --filter @workspace/cinevault run build`, copy the contents of `artifacts/cinevault/dist/public` to the repository root, and copy `index.html` to `404.html` so client-side routes continue to work on refresh. In **Settings → Pages**, select **Deploy from a branch**, then choose `main` and `/(root)`.

GitHub Pages does not run the API server. Live TMDB search requires a separately hosted API and a valid server-side `TMDB_API_KEY`.

## Media sources

The player accepts URLs that you provide and are allowed to embed. BeastPlayer does not scrape, proxy, download, or rehost third-party streams.