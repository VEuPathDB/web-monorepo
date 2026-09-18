// Stub for `import $ from 'jquery'`, encountered while Jest resolves the
// module graph for a unit under test. The installed jquery (1.9.1, loaded
// via <script> tag / script-loader in the real app) predates npm's `main`
// field convention and has no entry point Node's `require` can resolve, so
// any module reachable from an import chain that pulls in jquery needs a
// stand-in here rather than a real DOM library resolution.
module.exports = function $() {
  return $;
};
