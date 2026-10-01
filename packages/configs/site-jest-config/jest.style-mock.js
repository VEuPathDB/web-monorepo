// Stub for stylesheet imports (.css/.scss) encountered while Jest resolves
// the module graph for a unit under test. Jest's CommonJS runtime cannot
// parse Sass syntax and has no reason to: tests exercise logic, not styling,
// so any stylesheet reachable from an import chain is replaced with this
// no-op module rather than requiring a real CSS/Sass transform pipeline.
module.exports = {};
