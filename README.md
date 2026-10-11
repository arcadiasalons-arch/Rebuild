# Rebuild — House Call Bronze

Live URL (after setup and a successful deployment):
**https://arcadiasalons-arch.github.io/Rebuild/**

## One-time setup

1. Merge this PR into `main`.
2. In this repository, open **Settings > Pages** and set **Source** to
   **GitHub Actions**.
3. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.
   If needed, select that workflow and click **Run workflow** on `main`.

## Updating the site

Edit the site files and save (commit) your changes to `main`. GitHub automatically
builds and publishes the updated site; you do not need to upload another zip.
Most text and image links are in `src/data/brand.ts`; page sections are in
`src/components/hcb/`. The root `index.html` contains the title and search metadata.

For local development, install Node.js 22, then run `npm ci` and `npm run dev`.
To check the production version, run `npm run build` then `npm run preview`.
Only the generated `dist` folder is deployed; dependencies and build output are
not committed.

## Known limitations

- This is a React/Vite site, not plain HTML. Relative asset URLs and hash routes
  support the `/Rebuild/` path. The studio page is at
  https://arcadiasalons-arch.github.io/Rebuild/#/admin.
- GitHub Pages hosts static files only. Booking, payments, SMS, and admin features
  need a working backend. The archive's `src/lib/supabase.ts` has a placeholder
  key, and the backend functions are not included. These features are not made
  operational by this deployment. Never put private/service-role keys in browser
  code; backend setup must use a public client key and proper server-side access controls.
- Images and fonts are hosted externally and still require those services.
- The archived dependencies have npm security advisories (mostly development
  tooling), and lint/build emit existing warnings. Dependency modernization is
  separate from this deployment; do not expose the local development server publicly.
