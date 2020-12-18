# @veupathdb/eslint-config

This package includes the [eslint](https://eslint.org/) configuration used by VEuPathDB websites.

## Usage

First, install the package and dependencies with npm:
```
npm install --save-dev eslint-config-react-app @veupathdb/eslint-config
```

or with yarn:
```
yarn add -D eslint-config-react-app @veupathdb/eslint-config
```

Then, include the following in your eslint configuration file:
```json
      "extends": ["@veupathdb"]
```