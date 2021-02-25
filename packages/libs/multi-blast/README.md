# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [`@veupathdb` template](https://github.com/VEuPathDB/web-dev/packages/cra-template).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

You will be prompted to enter the VEuPathDB BRC Pre-Release Login credentials.

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

| Variable name          | Required | Description                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------------- |
| `WDK_SERVICE_URL`      | Yes      | Full url to a running WDK REST Service                                          |
| `BLAST_SERVICE_URL`    | Yes      | Full url to a running MultiBLAST Service                                        |
| `WDK_AUTH_KEY`         | No       | WDK Auth Key to use for MultiBLAST Service authentication                       |
| `VEUPATHDB_LOGIN_USER` | No       | Prerelease login username for the WDK REST Service located at `WDK_SERVICE_URL` |
| `VEUPATHDB_LOGIN_PASS` | No       | Prerelease login password for the WDK REST Service located at `WDK_SERVICE_URL` |

**Warning:** `WDK_AUTH_KEY`, `VEUPATHDB_LOGIN_USER`, and `VEUPATHDB_LOGIN_PASS` should be defined in .env.local, so as to avoid exposing sensitive credentials on GitHub.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
