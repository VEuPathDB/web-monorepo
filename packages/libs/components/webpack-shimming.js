function addD3Shimming(rules) {
  rules.push({
    test: require.resolve('tidytree'),
    use: [
      // TidyTree expects window.d3 to be available, so we shim it with this loader
      {
        loader: 'imports-loader',
        options: {
          imports: [
            {
              syntax: 'namespace',
              moduleName: require.resolve('d3v5'),
              name: 'd3',
            },
            {
              syntax: 'namespace',
              moduleName: require.resolve('patristic'),
              name: 'patristic',
            },
          ],
        },
      },
      // TidyTree creates a global variable, so we convert it to a named export with this laoder
      {
        loader: 'exports-loader',
        options: {
          exports: 'TidyTree',
        },
      },
    ],
  });
}

exports.addD3Shimming = addD3Shimming;
