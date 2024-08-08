module.exports = {
  production: ['defaults'],
  development: ['defaults'],
  // Used for production bundles which target "modern" browsers
  modern: ['defaults'],
  // Used for production bundles which target "legacy" browsers
  legacy: ['> 0.2% and not dead'],
  test: ['current node'],
};
