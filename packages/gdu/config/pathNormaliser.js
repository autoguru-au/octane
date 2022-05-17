/* eslint-disable unicorn/prefer-module */
const replacer = (filepath) => filepath.replace(/\\/g, '/');

/**
 * Normalise path to POSIX (only for `win32` using `require`).
 */
const PathNormaliserPlugin = function (api) {
  if (process.platform === 'win32') {
    const t = api.types;

    return {
      name: 'path-normaliser',

      visitor: {
        CallExpression: {
          enter: function (nodePath) {
            const callee = nodePath.get('callee');

            if (callee.isIdentifier() && callee.equals('name', 'require')) {
              const arg = nodePath.get('arguments.0');

              if (arg && arg.isStringLiteral()) {
                const sourcePath = arg.node.value;
                const targetPath = replacer(sourcePath);

                if (sourcePath !== targetPath) {
                  arg.replaceWith(t.stringLiteral(targetPath));
                }
              }
            }
          },
        },
      },
    };
  }

  return {
    name: 'path-normaliser',
  };
};

module.exports = PathNormaliserPlugin;