# Infinity Bourbon

**Version: v1.3.8**

Infinity Bourbon is an installable, offline-first Progressive Web App (PWA) for tracking a personal infinity bottle of bourbon. It runs in modern browsers on Android and Windows, and can be installed on supported devices.

**Live app:** https://markz68.github.io/infinity-bourbon/

## What it does

- Records bourbon additions with whiskey name, proof, amount in US fluid ounces, date, and optional note.
- Records pours and calculates the remaining volume and estimated weighted-average proof (plus ABV).
- Shows the bottle composition and transaction history.
- Provides **Undo last** with a confirmation that names the exact transaction.
- Starts new installations with an **empty bottle** and provides a two-confirmation **Start New Bottle** action in Settings → Bottle management.
- Stores transactions locally for offline use.
- Exports restorable JSON backups and CSV files for spreadsheets.
- Imports a JSON backup after explicit confirmation.
- Offers **manual Google Drive synchronization** between devices using Google's private application-data folder.
- Provides explicit **Restore from Google Drive** (cloud to this device) and **Back Up to Google Drive** (this device to cloud) actions with confirmations and safety checks.
- Shows the current app version beneath the title in the header, as in Milestones.
- Provides a single top-right **Settings** gear for Backup & Restore and bottle management.

## Install and use

1. Open https://markz68.github.io/infinity-bourbon/ in a browser.
2. On Android, use your browser's **Install app** or **Add to Home screen** option when available. On Windows, you can use the website directly or install it as an app if your browser offers that option.
3. Open the app once while online to allow the service worker to cache its files. Local tracking can work offline afterward.
4. Add bourbon or record pours. Enter the **proof printed on the bottle**; the app calculates ABV automatically.
5. Export a **JSON backup** periodically and keep a copy outside the browser.

## Settings: backup, restore, and synchronization

Open the top-right gear, then choose **Backup & Restore**.

### Backup File (JSON)

- **Export Backup File** downloads a restorable JSON copy named `infinity-bourbon-backup-YYYY-MM-DD.json`.
- **Restore from Backup File** validates the selected file and previews its transaction counts before replacing local history. Older Infinity Bourbon JSON backups can still be restored under their original filenames.

### Spreadsheet (CSV)

**Export CSV** downloads additions and pours for Excel or other spreadsheet apps. Use the JSON file to restore the app.

### Google Drive

Drive sync is optional and manual. Backups use the existing private application-data folder.

1. Select **Connect Google Drive**.
2. On a fresh installation, select **Restore from Google Drive** and confirm the preview.
3. Use **Back Up to Google Drive** to send this device’s history to Drive. Review the preview before replacing a different cloud copy.
4. Use **Sync Now** for routine synchronization. If both copies have changed, review the conflict and select the direction explicitly.
5. Check the connection and last successful sync or backup/restore above the action buttons. An empty device cannot overwrite a nonempty Drive history.

Connecting to Google may need to be repeated after a browser or app restart. Sync requires an internet connection. A UI update does not revoke the current Google OAuth token, but token expiry or browser restarts may still require reconnection.

## Updating and troubleshooting

- On Android or Windows, reopen or refresh the installed app after deployment. If the old layout persists, allow the service worker to update and reopen the app. A mixed cache of old JavaScript and new HTML could cause v1.3.3 to show empty default values and an unresponsive gear; v1.3.6 includes a compatibility hook to prevent this startup failure. Do not clear browser/site data to force an update.
- Check for **v1.3.8** beneath the app name in the header (and in the footer). Use the top-right gear for all backup and sync operations.
- The current Drive connection status appears in Settings → Backup & Restore. A connection may need renewing independently of an app update.

## Data safety and important limitations

- **Start New Bottle** clears the current device's transaction history after two confirmations. Export a JSON backup first. A nonempty Google Drive backup remains available to restore.

- The working transaction history is stored in the browser's `localStorage`. **Do not clear site data or uninstall the PWA without a verified JSON backup.** Browser profiles or devices may have different local histories.
- Google Drive sync is **not** an automatic, continuous backup. Sync deliberately when switching devices and retain independent JSON backups.
- A pour removes liquid proportionally from the current blend. The calculated proof remains the same after a pour until more bourbon is added.
- Transactions are applied in **entry order**, not automatically sorted by date. The date is descriptive; enter historical transactions chronologically.
- **Undo last** removes only the most recently entered transaction and asks for confirmation. There is no arbitrary transaction editing feature.
- Bottle proof assumes uniform mixing and ideal volumes; it is an estimate, not a laboratory measurement.
- The original recovered seven additions total **9.0 US fl oz**, approximately **96.583 proof** (**48.292% ABV**). They are no longer preloaded for new users; existing locally saved histories are preserved during upgrade.
- Static PWA changes require updating the cache identifier in `sw.js`. A browser may briefly continue using older cached files until its service worker updates.

## Release history

| Version | Highlights |
| --- | --- |
| **1.0.0** | Initial offline-first PWA, recovered seven-entry history, local tracking, JSON backup, and CSV export. |
| **1.2.x** | Added and refined manual Google Drive synchronization, safer conflict handling, and verified recovery upload. |
| **1.2.3** | Confirmed successful two-way synchronization between Android and Windows. |
| **1.3.5** | Service worker now checks the network for updated app files and falls back to cached files offline; addresses stale versions at the normal URL. |
| **1.3.8** | Added a dedicated Backup & Restore screen, standardized JSON names and Drive controls, and protected nonempty Drive backups from empty-device uploads. |
| **1.3.7** | Added the current version beneath the app name in the header, matching the Milestones layout while retaining the purple theme. |
| **1.3.6** | Added explicit Google Drive restore and backup actions, including fresh-install restore, record-count previews, overwrite confirmations, and cloud-change checks. |
| **1.3.4** | Compatibility hook for older cached scripts to avoid a blank startup. |
| **1.3.3** | Standardized the top-right Settings gear as the only backup/sync entry point, removed the redundant main-screen button, retained all existing controls and Drive code, added a discreet version footer, and bumped the offline cache. |
| **1.3.4** | Compatibility hotfix: added an invisible legacy button hook so an older cached script does not stop startup when paired with the new Settings layout. No data or sync changes. |
| **1.3.3** | Standardized Settings entry point and removed visible redundant backup button. |
| **1.3.2** | Replaced native Undo Last confirmation with a high-contrast, branded dialog and clear Cancel / Remove Transaction buttons. |
| **1.3.1** | New installations start empty; added two-confirmation Start New Bottle and transaction-specific Undo Last prompt. |
| **1.3.0** | Replaced large backup and sync panels with a compact **Backup & Sync** popup inspired by the Milestones app; preserved existing sync behavior. |

## Planned improvements

- Support multiple named bottles in a future release while preserving existing histories and sync data.
- Continue refining the interface and update experience based on everyday use.

## Development and deployment

This is a static HTML, CSS, and JavaScript PWA hosted with GitHub Pages. The service worker is in `sw.js`. OAuth client configuration is in `drive-config.js`; a web OAuth **client ID** can be public, but **never commit a client secret or access token**.

For future releases, update the displayed app version, service-worker cache identifier, and this README together. Preserve existing local storage keys and backup formats unless a tested migration is included.
