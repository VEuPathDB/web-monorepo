# VEuPath Core Components

Emotion based style definitions and components to enhance developer efficiency.

## Package Purpose

The VEuPathDB project is responsible a number of different websites. One of the challenges that the developer team faces is being able to efficiently produce components across all those website that have a cohesive UI/UX. That is where this package comes in.

Our goal is to ameliorate (sorry, word nerd) this problem in the following ways through this package:

1. Drastically reduce (and hopefully eliminate) the use of monstrous global style sheets, which are notoriously difficult to maintain.
2. Replacing these with cleaning defined and segmented CSS "options" that can be mixed and matched by developers as needed without writing custom CSS.
3. But even better, create a growing library of "core components" which are pre-styled to ensure consistency. These core components can them be composed together to make more complex components as needed but still maintain a more cohesive UI/UX.

## Getting Started

1. Install the package: `yarn add @veupathdb/core-components --save` (feel free to substitute NPM for Yarn if you prefer...)
2. I haven't quite got it figured out how to make sure the right peer dependencies are also installed automatically when you get the package, so you'll need to also install them manually for the moment. You can see what they are by looking at the `peerDependencies` section of the `package.json` file.
3. Add the following Google font link to your `index.html` file (or equivalent).
   ```
   <link
       href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
       rel="stylesheet"
   />
   ```
