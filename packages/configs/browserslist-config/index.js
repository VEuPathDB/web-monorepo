module.exports = {
  production: [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  development: [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ],
  // Used for production bundles which target "modern" browsers
  modern: [
    "last 2 chrome versions",
    "last 2 firefox versions",
    "last 2 safari versions",
    "last 2 edge versions",
    "last 2 ios versions"
  ],
  // Used for production bundles which target "legacy" browsers
  legacy: [
    "> 0%"
  ],
  test: [
    "current node"
  ]
}
