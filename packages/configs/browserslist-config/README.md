# @veupathdb/browserslist-config

This package includes the [browserslist](https://github.com/browserslist/browserslist) config used by VEuPathDB websites.

## Usage

First, install the package with `npm`:

```
npm install --save-dev @veupathdb/browserslist-config
```

or, if you are using `yarn`:
```
yarn add -D @veupathdb/browserslist-config
```

Then, add the following to `package.json`
```json
    "browserslist": [
      "extends @veupathdb/browserslist-config"
    ]
```

or in `.browserslistrc`
```
extends @veupathdb/browserslist-config
```