# Visualizations refactor notes

## Motivation

Looking again at the configuration/customization of visualizations in

- regular visualizations
- apps like alpha diversity
- standalone map (SAM) floating plots

We want to decouple scatter and lineplot visualizations from Plotly in
the eda code. Currently the eda visualization code makes Plotly-ready
data this will likely end up being copy-pasted if we make SAM-specific
visualizations that use these plots (lineplot is the top priority use
case for SAM). This logic needs to go into the plot component.

## Current customization mechanisms

### `withOptions` wrappers

Example: `betadiv.tsx` defines functions that provide extra information to scatterplot

`getComputedXAxisDetails(config: BetaDivConfig)` and `getComputedYAxisDetails(config: BetaDivConfig)`

In `ScatterplotVisualization.tsx` these are called (but can return
undefined if the `options` configuration or the functions
e.g. `options?.getComputedXAxisDetails` are undefined. For the x-axis
details, this return value is stored in `computedXAxisDetails`. This
in turn is used to send appropriate values to the `InputVariables`
pickers and `VariableCoverageTable`.

`withOptions` also sets optional properties (that are not functions),
e.g. `options.hideFacetInputs`. Again, these are accessed within the
visualization component (e.g. turning on or off the faceting input in
`InputVariables`).

Take home: Every option added by a custom use of a visualization
component must be checked for/used inside that component. These
components will grow in complexity as the variety of use cases
grows. There is currently no inheritance-like approach to make
specialised visualization components.

### a few hardcoded flow statements

e.g. in ScatterplotVisualization.tsx:
`computation?.descriptor.type === 'alphadiv'`

## Back end types

### Request

SAM introduces

### Responses

The SAM endpoints actually return the same data structures as the
regular endpoints, although `sampleSizeTable` and `completeCasesTable`
are now absent.

How should we handle this for the SAM visualizations?

#### make those response keys/props optional

Will likely cause downstream code changes to handle the new `| undefined` type.

#### make a new SAMScatterplotResponse type

But then how to incorporate this into the code without an equal number
of changes as above?

Unless of course a whole new visualization component is implementated for each main flavour of viz: e.g. vanilla, betadiv, alphadiv, SAM ??
