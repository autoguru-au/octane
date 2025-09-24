# Testing Hot Reload for Package Translations

## Test Setup

1. Start the development server in the MFE repository
2. Open a package that has translations (e.g., fleet-booking-profile)
3. Make changes to a translation file
4. Observe if changes appear without server restart

## Expected Behavior

### Before Changes
- Package translations are loaded and displayed correctly
- Browser developer tools show translation files are fetched

### After Making Translation Changes
1. File watcher detects the change
2. Console shows: `[TranslationHashingPlugin] Updated {locale}/{namespace} from {packageName}`
3. Webpack invalidates and triggers HMR
4. Browser fetches updated translation with timestamp query parameter
5. UI updates with new translation text without page refresh

## Test Cases

### Test 1: Simple Text Change
1. Open `packages/fleet-booking-profile/locales/en/businessRules.json`
2. Change any translation text
3. Save the file
4. Check if the UI updates automatically

### Test 2: Add New Translation Key
1. Add a new key to the translation file
2. Save the file
3. Check if the new key is available in the app

### Test 3: Multiple Locale Changes
1. Change translations in both `en` and `de` locales
2. Save both files
3. Switch between locales in the app
4. Verify both changes are reflected

## Verification Points

- [ ] No server restart required
- [ ] Changes appear within 2-3 seconds
- [ ] Console shows file watcher activity
- [ ] Network tab shows fresh translation fetch with timestamp
- [ ] No browser cache issues
- [ ] HMR preserves application state

## Troubleshooting

If hot reload doesn't work:

1. Check console for `[TranslationHashingPlugin]` messages
2. Verify file watchers are set up (should log on startup)
3. Check network tab for cache headers on translation files
4. Ensure webpack dev server has HMR enabled
5. Verify `__DEV__` is true in development mode