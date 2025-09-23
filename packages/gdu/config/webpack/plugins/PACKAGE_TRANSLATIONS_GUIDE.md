# Package Translations Guide

## Overview

The enhanced TranslationHashingPlugin now supports automatic discovery and merging of translations from packages. This allows shared packages to include their own translations that are automatically bundled with consuming MFEs.

## Features

- **Automatic Discovery**: Scans webpack module graph to find used packages
- **Configurable Merge Strategies**: Choose how package translations merge with MFE translations
- **Full Backward Compatibility**: Existing MFEs work without changes
- **Content Hashing**: All translations get content-based hashes for cache busting
- **Build-Time Optimization**: No runtime overhead

## Configuration

### Plugin Options

```javascript
// In your webpack config or GDU configuration
new TranslationHashingPlugin({
  // Existing options
  publicPath: '/locales/',
  outputPath: 'locales/',
  localesDir: 'public/locales',
  hashLength: 8,
  excludeLocales: [],

  // New options for package translations
  autoIncludePackageTranslations: true, // Enable/disable feature (default: true)
  packageTranslationMergeStrategy: 'prefix' // Only 'prefix' is supported
})
```

### Translation Strategy

**`prefix`** (only supported strategy): Package namespaces are prefixed with `pkg-{packageName}-` to avoid collisions and ensure clear separation between MFE and package translations.

## Package Setup

### 1. Add Translations to Your Package

Create a `locales` directory in your package:

```
packages/your-package/
├── src/
├── locales/
│   ├── en/
│   │   └── your-namespace.json
│   ├── ja/
│   │   └── your-namespace.json
│   └── [other languages]/
└── package.json
```

### 2. Configure package.json

Add an `i18n` section to your package.json:

```json
{
  "name": "@autoguru/your-package",
  "i18n": {
    "namespaces": ["your-namespace"],
    "localesPath": "./locales"
  }
}
```

### 3. Use Translations in Package Components

```typescript
import { useMfeTranslation } from '@autoguru/i18n/hooks';

export const YourComponent = () => {
  const { t } = useMfeTranslation('your-namespace');

  return <div>{t('your.translation.key')}</div>;
};
```

## Example: usage-meter Package

### Package Structure
```
packages/usage-meter/
├── locales/
│   ├── en/
│   │   └── usage-meter.json
│   └── ja/
│       └── usage-meter.json
└── package.json
```

### package.json Configuration
```json
{
  "name": "@autoguru/usage-meter",
  "i18n": {
    "namespaces": ["usage-meter"],
    "localesPath": "./locales"
  }
}
```

### Translation File (locales/en/usage-meter.json)
```json
{
  "usageMeter": {
    "type": {
      "odometer": "odometer",
      "usageMeter": "Usage Meter"
    },
    "units": {
      "km": "km",
      "kilometres": "Kilometres",
      "miles": "Miles",
      "hours": "Hours"
    }
  }
}
```

### Using in Component
```typescript
const UsageMeterComponent = () => {
  const { t } = useMfeTranslation('usage-meter');

  return (
    <div>
      <label>{t('usageMeter.type.odometer')}</label>
      <span>{t('usageMeter.units.km')}</span>
    </div>
  );
};
```

## Build Output

When an MFE uses a package with translations, the build output will include:

```
dist/
└── locales/
    ├── en/
    │   ├── booking-edit.[hash].json    # MFE translations
    │   └── usage-meter.[hash].json     # Auto-included from package
    └── ja/
        ├── booking-edit.[hash].json
        └── usage-meter.[hash].json
```

The manifest files will include comments showing which packages were included:

```javascript
// i18n-manifest-en.[hash].js
// Includes translations from packages: @autoguru/usage-meter
export const manifest = {
  "booking-edit": { path: "/locales/en/booking-edit.abc123.json", ... },
  "usage-meter": { path: "/locales/en/usage-meter.def456.json", ... }
};
```

## Migration Guide

### For New Packages

1. Create `locales` directory with translations
2. Add `i18n` config to package.json
3. Use `useMfeTranslation` with your namespace

### For Existing Packages

1. Move duplicate translations from MFEs to package
2. Add `i18n` config to package.json
3. Remove duplicate translations from MFEs
4. Build and test

## Troubleshooting

### Translations Not Being Included

1. Check that the package is actually being imported/used in the MFE
2. Verify the `locales` directory exists in the package
3. Check package.json has `i18n` configuration
4. Look for console messages during build: `[TranslationHashingPlugin] Found translations in @autoguru/your-package`

### Namespace Conflicts

The `prefix` strategy is automatically applied to prevent namespace conflicts. All package translations are prefixed with `pkg-{packageName}-` to ensure clear separation from MFE translations.

### Build Performance

The plugin caches package discovery. If you add translations to a package:
1. Clear webpack cache: `rm -rf node_modules/.cache`
2. Rebuild the MFE

## Benefits

✅ **DRY Principle**: Single source of truth for package translations
✅ **Consistency**: All MFEs use same translations for shared components
✅ **Maintainability**: Update translations in one place
✅ **Scalability**: New MFEs automatically get package translations
✅ **Performance**: No runtime overhead, all resolved at build time
✅ **Cache Busting**: Content hashing ensures updates are reflected

## Future Enhancements

- [ ] Tree-shaking unused translations
- [ ] Translation validation at build time
- [ ] Automatic namespace conflict detection
- [ ] Support for translation inheritance
- [ ] CLI tool for managing package translations