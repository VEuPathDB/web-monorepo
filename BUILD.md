# Build and Development

The purpose of this document is to describe the build and development tools used
in this repository.

## Yarn

| Version | Website                 |
| ------- | ----------------------- |
| 3       | https://v3.yarnpkg.com/ |

This repository uses yarn for dependency management. The
[workspaces](https://v3.yarnpkg.com/features/workspaces) is used for its
monorepo support.

## Nx

| Version | Website           |
| ------- | ----------------- |
| 16      | https://16.nx.dev |

This repository uses [Nx](https://nx.dev/) for monorepo support. At the time of
this writing, we are using v16, and we are using a package-based repo. In
brief, this means each package declares it's own set of dependencies and build
scripts. See https://16.nx.dev/concepts/integrated-vs-package-based for more
details.

Also, as of this writing, Nx v20 is the latest version. It no longer
distinguishes between integrated and package-based repos. It may be worth
upgrading to the latest version.

## React scripts

| Version | Website                                                                       |
| ------- | ----------------------------------------------------------------------------- |
| 5       | https://github.com/facebook/create-react-app/tree/main/packages/react-scripts |

[react-scripts](https://github.com/facebook/create-react-app/tree/main/packages/react-scripts)
is used for the following things:

- Local development sites (see [run-site-dev-server.js](packages/configs/react-scripts/scripts/run-site-dev-server.js) and [start.js](packages/configs/react-scripts/scripts/start.js)).
- Build scripts (see [compile.js](packages/configs/react-scripts/scripts/compile.js), and [copy-assets](packages/configs/react-scripts/scripts/copy-assets.js)).

## Webpack

| Version | Website                 |
| ------- | ----------------------- |
| 5       | https://webpack.js.org/ |

Website assets are built with [webpack](https://webpack.js.org/). Each package
in `packages/sites` has scripts called `build:dev` and `bundle:npm`. The former
produces development bundles, while the latter produces production bundles. The
differences are primarily related to code minification and [tree
shaking](https://webpack.js.org/guides/tree-shaking/).

For the most part, the source code is free from webpack-specific feature. There
are a few exceptions:

- `require.context` in component overrides (TODO link)
- Inline plugin declarations in bootstrap file (TODO link)
- Public path defined on the fly (`__webpack_public_path__`) (TODO link)

## Prettier

| Version | Website                   |
| ------- | ------------------------- |
| 2       | https://prettier.io/docs/ |

We use prettier to enforce code formatting rules. A pre-commit hook (see
[below](#husky)) calls prettier to format any staged code. Our prettier
configuration lives in
[packages/configs/prettier-config](packages/configs/prettier-config).

## ESLint

| Version | Website            |
| ------- | ------------------ |
| 7       | https://eslint.org |

We use eslint primarily as a development aid, but do not enforce the rules. In
other words, builds can proceed, even if eslint rules are violated.

See [packages/configs/eslint-config](packages/configs/eslint-config) for our
eslint configuration.

## lint-staged and husky

| Version | Website                                    |
| ------- | ------------------------------------------ |
| 13      | https://github.com/lint-staged/lint-staged |
| 8       | https://typicode.github.io/husky/          |

We use lint-staged and husky to configure and run pre-commit hooks. See the
`lint-staged` field in [package.json](package.json).

## Github Workflows

We use github workflows to automate building browser-ready artifacts, and
publishing them to npm. We also use worflows to enable branch protection rules.
See [.github/workfows](.github/workflows) for specifics.
