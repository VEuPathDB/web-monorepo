# @veupathdb/react-scripts

A wrapper for [react-scripts](https://github.com/facebook/create-react-app/tree/master/packages/react-scripts) used for developing VEuPathDB website features.

## Usage

First, install the package with npm:
```
npm install --save-dev @veupathdb/react-scripts
```
or with yarn:
```
yarn add -D @veupathdb/react-scripts
```

Then, optionally add the following `script` entries to `package.json` in your repo:
```json
    "scripts": {
      "start": "veupathdb-react-scripts start",
      "build": "veupathdb-react-scripts build",
      "test": "veupathdb-react-scripts test",
      "eject": "veupathdb-react-scripts eject"  
    }
```