// Dedicated Babel transform for Jest only. Production builds still use
// .babelrc / @veupathdb/site-babel-config via webpack's babel-loader (which
// relies on ts-loader, not Babel, for TypeScript). Jest needs TypeScript
// stripped and ESM rewritten to CommonJS; presets are passed directly here
// (rather than via a configFile) and babelrc/config-file auto-discovery is
// disabled so this transform doesn't pick up the site's own .babelrc (which
// has no TypeScript support and leaves `modules` inference to the target).
const babelJest = require('babel-jest').default;

module.exports = babelJest.createTransformer({
  presets: [
    require.resolve('@babel/preset-typescript'),
    require.resolve('@babel/preset-react'),
    [
      require.resolve('@babel/preset-env'),
      // modules: 'commonjs' is required even though the target Node
      // version supports ESM natively — jest's CJS-based runtime needs
      // import/export rewritten to require/module.exports regardless of
      // what the target runtime could otherwise handle.
      { targets: { node: 'current' }, modules: 'commonjs' },
    ],
  ],
  babelrc: false,
  configFile: false,
});
