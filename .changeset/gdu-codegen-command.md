---
"gdu": minor
---

Add `gdu codegen` command for generating TypeScript from `.gdu_app_config` files

- New `codegen` property in `guru.config.js` for configuring code generators
- `stage-map` generator: creates domain → stage mapping from env files
- Skips Octopus deploy placeholders (`#{...}`) and `.env.tokens` files
- Generates TypeScript with optional helper functions

Usage:
```bash
gdu codegen        # Run all configured generators
gdu codegen --list # List available generators
```

Configuration in `guru.config.js`:
```javascript
module.exports = {
  codegen: {
    generators: [{
      type: 'stage-map',
      outputPath: './src/generated/stage-map.ts',
      options: {
        keyField: 'appDomain',
        defaultValue: 'dev',
        helperName: 'extractStageFromHost',
      },
    }],
  },
};
```
