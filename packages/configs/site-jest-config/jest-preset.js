// Jest's own preset-resolution mechanism (the `preset` config field) looks
// for jest-preset.js/json at a package's root — this is a .js file, not
// .json, specifically so paths to this package's own support files can be
// built with require.resolve(...) rather than <rootDir>-relative strings.
// <rootDir> always resolves to the *consuming* site's directory, not this
// package's, so a <rootDir>-relative path here would point at a file that
// doesn't exist in the site consuming the preset.
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: [require.resolve('./jest.setup.js')],
  setupFilesAfterEnv: [require.resolve('./jest.setup-after-env.js')],
  testRegex: '(\\.|/)test\\.tsx?$',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|scss)$': require.resolve('./jest.style-mock.js'),
    '\\.(png|jpg|jpeg|gif|svg)$': require.resolve('./jest.style-mock.js'),
    '^jquery$': require.resolve('./jest.jquery-mock.js'),
  },
  transform: {
    '^.+\\.(t|j)sx?$': require.resolve('./jest.babel-transform.js'),
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@veupathdb/web-common/lib/|spin\\.js/)',
  ],
};
