Infinity Bourbon v1.2.2 diagnostics fix

Upload drive-sync.js, index.html and sw.js to GitHub repository root.
Do not replace drive-config.js. Keep independent JSON backups.
Do not approve any replace-local prompt until cloud record count and content are verified.
This version normalizes transaction key ordering and legacy sync baselines, displays local/cloud record counts, and verifies first-time cloud uploads.
It does NOT add a force-upload option or automatically resolve conflicts.
