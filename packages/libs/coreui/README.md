# VEuPath CoreUI

Emotion based style definitions and components to enhance developer efficiency.

## Package Purpose

The VEuPathDB project is responsible a number of different websites. One of the challenges that the developer team faces is being able to efficiently produce components across all those website that have a cohesive UI/UX. That is where this package comes in.

Our goal is to ameliorate (sorry, word nerd) this problem in the following ways through this package:

1. Drastically reduce (and hopefully eliminate) the use of monstrous global style sheets, which are notoriously difficult to maintain.
2. Replacing these with cleaning defined and segmented CSS "options" that can be mixed and matched by developers as needed without writing custom CSS.
3. But even better, create a growing library of "core components" which are pre-styled to ensure consistency. These core components can them be composed together to make more complex components as needed but still maintain a more cohesive UI/UX.

## Getting Started

1. Install the package: `yarn add @veupathdb/core-components --save` (feel free to substitute NPM for Yarn if you prefer...)
2. To ensure that the necessary web-fonts are loaded, include the `useCoreUIFonts();` hook at at the top level of your component hierarchy.
