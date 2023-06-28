# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Webpack dependencies

When consuming this library with webpack, the following development dependencies
are required, due to [upstream
dependencies](https://github.com/plotly/plotly.js/blob/master/BUILDING.md#webpack) of `Plotly.js`.

- [ify-loader](https://www.npmjs.com/package/ify-loader)
- [bubleify transform](https://www.npmjs.com/package/bubleify)

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Environment Variables

_The `yarn start` script makes use of environment variables when running in development mode. These variables are not required when using artifacts published to npm. They are specific to `yarn start`._

The following environment variables are used by the `yarn start` script:

| Variable name                         | Description                                                             |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `VEUPATHDB_LOGIN_USER`                | VEuPathDB BRC prerelease user name                                      |
| `VEUPATHDB_LOGIN_PASS`                | VEuPathDB BRC prerelease user password                                  |
| `WDK_SERVICE_URL`                     | Full url to a running WDK REST Service                                  |
| `BASE_EDA_URL`                        | Full url to a running EDA Subsetting/Data/User/Dataset Access Service   |
| `REACT_APP_DISABLE_DATA_RESTRICTIONS` | If present and `true`, disables data restrictions                       |
| `REACT_APP_EXAMPLE_ANALYSES_AUTHOR`   | The ID of the WDK user who maintains "example strategies" (optional)    |
| `REACT_APP_SINGLE_APP_MODE`           | Name of one app. If defined, runs the eda with one instance of that app |
| `REACT_APP_SHOW_UNRELEASED_DATA`      | Indicates if unreleased data should be accessible (optional - "false")  |

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
