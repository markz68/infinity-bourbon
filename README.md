# Infinity Bourbon

**Current release: v1.3.0**

Infinity Bourbon is an installable, offline-first Progressive Web App (PWA) for tracking a personal infinity bottle of bourbon. It runs in modern browsers on Android and Windows, and can be installed on supported devices.

**Live app:** https://markz68.github.io/infinity-bourbon/

## What it does

- Records bourbon additions with whiskey name, proof, amount in US fluid ounces, date, and optional note.
- Records pours and calculates the remaining volume and estimated weighted-average proof (plus ABV).
- Shows the bottle composition and transaction history.
- Provides **Undo last** with a confirmation prompt.
- Stores transactions locally for offline use.
- Exports restorable JSON backups and CSV files for spreadsheets.
- Imports a JSON backup after explicit confirmation.
- Offers **manual Google Drive synchronization** between devices using Google's private application-data folder.
- Groups backups and sync controls in a compact **Backup & Sync** popup (v1.3.0).

## Install and use

1. Open https://markz68.github.io/infinity-bourbon/ in a browser.
2. On Android, use your browser's **Install app** or **Add to Home screen** option when available. On Windows, you can use the website directly or install it as an app if your browser offers that option.
3. Open the app once while online to allow the service worker to cache its files. Local tracking can work offline afterward.
4. Add bourbon or record pours. Enter the **proof printed on the bottle**; the app calculates ABV automatically.
5. Export a **JSON backup** periodically and keep a copy outside the browser.

## Backup & Sync (v1.3.0)

Open **Backup & Sync** from the main screen or the settings icon.

### Local backups

- **Download JSON backup**: Save the transaction history in a restorable format.
- **Export CSV for Excel**: Export transactions for viewing or analysis. CSV is not the restore format.
- **Import JSON backup**: Replace the current local history only after a confirmation.

### Google Drive

Google Drive sync is optional and **manual**, not automatic. It uses the `drive.appdata` permission to store a backup in a private application-data folder.

1. Open **Backup & Sync** and select **Connect Google Drive**.
2. Select **Sync now** to compare this device's local history with the cloud history.
3. Before switching devices, sync the device you were using. On the other device, sync **before editing**, and sync again after making changes.
4. Read confirmation dialogs carefully. If the local and cloud histories conflict, the app avoids silently overwriting either copy.
5. **Advanced recovery** contains an explicit recovery upload that can overwrite the cloud history after two confirmations. Use it only when you understand which copy should be kept and have exported backups.

Connecting to Google may need to be repeated after a browser or app restart. Sync requires an internet connection.

## Data safety and important limitations

- The working transaction history is stored in the browser's `localStorage`. **Do not clear site data or uninstall the PWA without a verified JSON backup.** Browser profiles or devices may have different local histories.
- Google Drive sync is **not** an automatic, continuous backup. Sync deliberately when switching devices and retain independent JSON backups.
- A pour removes liquid proportionally from the current blend. The calculated proof remains the same after a pour until more bourbon is added.
- Transactions are applied in **entry order**, not automatically sorted by date. The date is descriptive; enter historical transactions chronologically.
- **Undo last** removes only the most recently entered transaction and asks for confirmation. There is no arbitrary transaction editing feature.
- Bottle proof assumes uniform mixing and ideal volumes; it is an estimate, not a laboratory measurement.
- The original recovered seven additions total **9.0 US fl oz**, approximately **96.583 proof** (**48.292% ABV**).
- Static PWA changes require updating the cache identifier in `sw.js`. A browser may briefly continue using older cached files until its service worker updates.

## Release history

| Version | Highlights |
| --- | --- |
| **1.0.0** | Initial offline-first PWA, recovered seven-entry history, local tracking, JSON backup, and CSV export. |
| **1.2.x** | Added and refined manual Google Drive synchronization, safer conflict handling, and verified recovery upload. |
| **1.2.3** | Confirmed successful two-way synchronization between Android and Windows. |
| **1.3.0** | Replaced large backup and sync panels with a compact **Backup & Sync** popup inspired by the Milestones app; preserved existing sync behavior. |

## Planned improvements

- Make the **Undo last** confirmation identify the specific transaction (name, amount, and date) before deletion.
- Continue refining the interface and update experience based on everyday use.

## Development and deployment

This is a static HTML, CSS, and JavaScript PWA hosted with GitHub Pages. The service worker is in `sw.js`. OAuth client configuration is in `drive-config.js`; a web OAuth **client ID** can be public, but **never commit a client secret or access token**.

For future releases, update the displayed app version, service-worker cache identifier, and this README together. Preserve existing local storage keys and backup formats unless a tested migration is included.
