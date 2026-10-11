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

## House Call pros: adding and publishing a provider

The shared directory is `src/data/providers.ts`. It is owner-managed site
configuration, **not** a browser-only admin list. Edit it in GitHub (or locally),
commit to `main`, and wait for the existing Pages deployment. No Supabase migration
is needed for the directory, profile pages, booking texts, or join requests.
The appointment admin and its authentication are unchanged.

To add a pro, add a record to `PROVIDERS` with:

- `slug`: a unique, permanent lowercase URL slug using letters, numbers, and
  hyphens. Keep it unchanged after sharing the page.
- `name`: the pro's supplied public name.
- `active` and `published`: both must be `true` to appear in the dropdown,
  community directory, and public profile. Set either to `false` to hide the
  record and its page. Draft profiles are not served, but configuration is public
  source: never put private information in a draft.
- Optional `bio`, `serviceArea`, `imageUrl`, and `websiteUrl`: use only information
  the pro has supplied and approved for publication. Web/image URLs must be
  absolute HTTPS URLs without embedded credentials; unsafe URLs are not rendered.
- `phoneE164`: the pro's approved **SMS-capable** booking number in international
  format (`+` followed by country code and number, without spaces). A named pro's
  booking goes only to this number. Without a valid number, text booking is
  unavailable; it never falls back to Meesh.

Each published record automatically creates a shareable page at
`https://arcadiasalons-arch.github.io/Rebuild/#/pros/<slug>` (or the same
`#/pros/<slug>` route on the site's custom domain). Its booking button explicitly
selects that pro. There are no separate page files to create.

Only Meesh's record uses `menu: 'meesh'`. Do not copy that field to another pro:
the existing service IDs, prices, add-ons, travel fees, and studio details belong
to Meesh. Other pros receive a free-text service request and preferred date/time,
then confirm their own offerings, price, location, and availability by text.
Their supplied bio can include their service information. This version does not
provide a separate priced-menu editor for other pros.

Home-page booking starts with no pro preference. These requests go to Meesh
for coordination, explicitly labeled **no preference / no pro assigned**.
The preserved home-page estimate is labeled as Meesh's menu only; it does not
quote another pro's price. Choosing Meesh is always explicit.

The community invitation links to `#/join`. The labeled form opens a prefilled
SMS to Meesh's existing number; the applicant must send it in their messaging
app. It does not create a database record or publish a pro. Meesh reviews requests,
collects approved public information, and adds accepted pros to the configuration.
Booking requests likewise require the customer to send the text and await
confirmation. A device with an SMS handler is required for either handoff.

Provider management is not added to `/admin`: this repository lacks the deployed
`claim_admin` definition, complete schema/RLS policies, and backend functions
needed to extend that interface safely. A future database-backed editor would
need a providers table, public reads restricted to published/active records,
owner-authorized writes enforced by RLS, verified authentication, and deployed
public Supabase client configuration. No credentials or backend changes are
required for the configuration-based flow delivered here.

## Known limitations

- This is a React/Vite site, not plain HTML. Relative asset URLs and hash routes
  support the `/Rebuild/` path. The studio page is at
  https://arcadiasalons-arch.github.io/Rebuild/#/admin.
- GitHub Pages hosts static files only. The customer booking and join-request
  forms use the device's messaging app and need no backend. Database appointment
  administration, payments, and backend SMS features need a working backend.
  The archive's `src/lib/supabase.ts` has a placeholder
  key, and the backend functions are not included. These features are not made
  operational by this deployment. Never put private/service-role keys in browser
  code; backend setup must use a public client key and proper server-side access controls.
- Images and fonts are hosted externally and still require those services.
- The archived dependencies have npm security advisories (mostly development
  tooling), and lint/build emit existing warnings. Dependency modernization is
  separate from this deployment; do not expose the local development server publicly.
