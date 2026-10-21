# Infinity Bourbon v1.2 Google Drive setup

**Before deploying:** Keep the v1.0.1 JSON backup. This is a beta manual-sync release.

1. Open https://console.cloud.google.com/ and create a Google Cloud project named Infinity Bourbon.
2. Under APIs & Services / Library, enable **Google Drive API**.
3. Configure the Google Auth Platform consent screen (external). Add your Google account under **Test users** while in Testing status. Add the Drive appdata scope `https://www.googleapis.com/auth/drive.appdata` under Data Access. Google may require additional verification for broader public use; testing access has restrictions and refresh-token expiration behavior.
4. Create an OAuth **Web application** client. Under **Authorized JavaScript origins**, add `https://markz68.github.io` (origin only, no path). No client secret is needed in this static website.
5. Copy the **Client ID** into `drive-config.js`, replacing the placeholder. Never put a client secret into this repository.
6. Upload all updated files to the repository root, including new `drive-sync.js` and `drive-config.js`, and commit. Wait for GitHub Pages deployment and reload.
7. On your original Android device, export a JSON backup, then Connect Google Drive and Sync now to create the private file. On another device, **export its local JSON first**. It may contain the same seven starter records. Connect and Sync now. If different, no automatic overwrite occurs until the app has established a common sync baseline; import the latest backup on that device, then Sync now.

## Safety and limitations

- Google Drive `appDataFolder` is private to this OAuth application, not browsable in My Drive. It is not a replacement for independent JSON backups.
- This build has **manual sync** and no background sync. Connect again after app restart because access tokens are held in memory only.
- When both cloud and local history change independently, the app refuses to overwrite either. Export both JSON copies and reconcile manually.
- A single cloud file can still be changed between download and upload by another device. **Do not edit on two devices simultaneously**. This beta does not implement atomic compare-and-swap or transactional merging.
- The first upload must be done from the device with the authoritative history. Initial seed data on another device can differ from your real history.
- Offline tracking still works. Google sign-in and sync require internet.
- OAuth app access may be restricted by Google's testing/verification rules. The private folder is associated with the Google Cloud app identity; keep the project and client ID.
