# Infinity Bourbon PWA v1.0.0

Offline-first, single-bottle tracker preloaded with seven additions recovered from screenshots. No external services, tracking, accounts, or libraries.

## Use and install

1. Publish the **contents** of this folder to an HTTPS static host (for example GitHub Pages, Cloudflare Pages, or Netlify). Do not open `index.html` directly from your file manager if you want installability and offline support. `localhost` works for development.
2. Visit the HTTPS address in Chrome on Android. From Chrome's menu select **Add to Home screen** or **Install app** (wording varies).
3. Open the app once while online so the service worker caches the files. Thereafter it can run offline.
4. Export a JSON backup after changes, and keep it outside the browser/device. Use Import JSON to restore. CSV is for review/spreadsheets; JSON is for restoring.

## Important limitations

- All transactions live in this browser's `localStorage`. Clearing browser/site data, changing browser/profile, or uninstalling the app can lose them. Data does not sync across devices. Back up regularly.
- A pour removes liquid proportionally from every prior addition; the blended proof stays the same until another addition. Individual ingredients with the same name and proof are grouped in the composition display.
- Transactions are applied in **entry order**, not sorted by date. The date is descriptive. Add historical events chronologically. The app allows undoing the last transaction, not arbitrary editing.
- Bottle proof assumes ideal volume mixing and uniform blend. This is an estimate, not a lab measurement.
- The historical seven additions produce 9 oz and 96.583333... proof, matching the original app.
- Static file updates require bumping the cache version in `sw.js` to force a refresh of cached assets.
