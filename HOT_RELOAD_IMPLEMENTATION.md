# Package Translations Hot Reload Implementation

## Overview
This document describes the implementation of hot reload functionality for package translations in the GDU build system, which eliminates the need for server restarts when modifying translation files during development.

## Problem Statement
Previously, any change to a package translation file required a full server restart to see the updates, making the translation migration process slow and inefficient. This was particularly painful when migrating multiple packages with hundreds of translation keys.

## Solution Architecture

### 1. File Watching System
The `TranslationHashingPlugin` now includes a file watching mechanism that monitors package translation directories for changes:

```typescript
// Watches for changes in package locales directories
private setupTranslationWatchers(compiler: Compiler, compilation: Compilation) {
  for (const [, packagePath] of this.packagePaths) {
    const localesPath = path.join(packagePath, 'locales');
    if (existsSync(localesPath)) {
      const watcher = watch(localesPath, { recursive: true }, async (filename) => {
        if (filename?.endsWith('.json')) {
          await this.handleTranslationChange(compiler, compilation, localesPath, filename);
        }
      });
    }
  }
}
```

### 2. Change Detection and Processing
When a translation file changes:
1. The watcher detects the change
2. The plugin reads the updated file
3. Updates the in-memory cache
4. Copies the file to the public directory
5. Triggers webpack invalidation for HMR

### 3. Cache Busting Strategy
To prevent browser caching issues in development:

#### Server-side (TranslationHashingPlugin):
- Maintains version timestamps for each translation
- Copies updated files to public directory immediately
- Triggers webpack watching invalidation

#### Client-side (manifest-aware-backend):
```typescript
// Add timestamp to bypass caching in development
if (!isHashed && __DEV__) {
  fullPath = `${fullPath}?t=${Date.now()}`;
}
const cacheMode = isHashed ? 'default' : 'no-cache';
```

### 4. HMR Integration
The implementation integrates with webpack's Hot Module Replacement:
- Calls `compiler.watching.invalidate()` when translations change
- This triggers webpack to rebuild affected modules
- HMR updates the browser without full page reload

## Implementation Details

### Modified Files

#### 1. `packages/gdu/config/webpack/plugins/TranslationHashingPlugin.ts`
- Added `FSWatcher` import for file watching
- Added `packagePaths` Map to track package locations
- Added `watchers` Map to manage file watchers
- Added `translationVersions` Map for cache busting
- Implemented `setupTranslationWatchers()` method
- Implemented `handleTranslationChange()` method
- Implemented `cleanupWatchers()` method

#### 2. `packages/i18n/lib/manifest-aware-backend.ts` (MFE repo)
- Enhanced `fetchWithRetry()` to add timestamp query parameters
- Improved hash detection regex pattern
- Set `cache: 'no-cache'` for non-hashed files

### Key Features

1. **Automatic Discovery**: Discovers all packages with translations automatically
2. **Multiple Watch Paths**: Monitors both `locales/` and `src/locales/` directories
3. **Namespace Prefixing**: Maintains the `pkg-` prefix strategy for package translations
4. **Memory Efficiency**: Cleans up watchers on shutdown
5. **Error Handling**: Gracefully handles JSON parsing errors and missing files

## Usage

### Development Mode
Hot reload is automatically enabled in development mode when:
1. Running webpack dev server with `mode: 'development'`
2. Package translations are discovered by the plugin
3. HMR is enabled in webpack config

### Making Translation Changes
1. Edit any translation file in a package's `locales/` directory
2. Save the file
3. Changes appear in the browser within 2-3 seconds
4. No server restart required

### Console Output
When a translation updates, you'll see:
```
[TranslationHashingPlugin] Updated en/pkg-fleet-booking-profile from @autoguru/fleet-booking-profile
```

## Performance Considerations

1. **File Watchers**: Limited to discovered packages only
2. **Selective Invalidation**: Only invalidates when translation files change
3. **Memory Cache**: Updates in-memory cache to avoid repeated file reads
4. **Browser Caching**: Disabled for development mode translations

## Limitations

1. Only works in development mode
2. Requires HMR to be enabled
3. File watchers are OS-dependent (may have limits on number of watched files)
4. Initial package discovery still happens during build

## Future Improvements

1. **Granular HMR**: Update only affected components instead of full module
2. **WebSocket Notifications**: Direct browser notification of translation updates
3. **Translation Validation**: Validate JSON structure before applying changes
4. **Differential Updates**: Send only changed keys instead of full namespace

## Troubleshooting

### Hot Reload Not Working

1. **Check File Watchers**
   - Verify console shows watcher setup
   - Check OS file watcher limits

2. **Check Cache Headers**
   - Network tab should show `cache-control: no-cache` for dev translations
   - URLs should have timestamp query parameter

3. **Check HMR Configuration**
   - Ensure webpack dev server has `hot: true`
   - Verify HMR client is loaded

4. **Check Development Mode**
   - Verify `__DEV__` is true
   - Ensure webpack mode is 'development'

## Migration Guide

For developers migrating package translations:

1. Start the dev server normally
2. Open the application in browser
3. Edit translation files directly
4. See changes immediately without restart
5. Test multiple locales by switching language
6. Commit changes when satisfied

This implementation significantly improves the developer experience when working with package translations, reducing migration time from hours to minutes.