import React from 'react';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

export function Tooltip() {
  return (
    <>
      If your variable of interest cannot be selected for use in a particular
      visualization, it is likely due to a constraint that restricts the
      variables to only those compatible with the visualization. Not all
      visualizations can display all types or combinations of variables. As an
      example, it is not possible to display categorical data on the X-axis in a
      Histogram.
    </>
  );
}

export function Document() {
  useSetDocumentTitle('Variable Constraints on ClinEpiDB Visualizations');

  return (
    <div style={{ maxWidth: '1000px', fontSize: '1.1em' }}>
      <h1>Variable Constraints on ClinEpiDB Visualizations</h1>

      <div>
        <h2 style={{ fontSize: '1.4em' }}>TLDR (Too Long Didn’t Read)</h2>
        <strong>
          <Tooltip />
        </strong>
      </div>

      <br />

      <p>
        Variable constraints are a way to define which variables are compatible
        with different visual elements (axes, color, etc) of any given
        visualization. For example, our qualitative color palette only has 8
        colors, and variable constraints allow us to prevent a variable with 9
        or more unique values from being used to color the plot. Constraints are
        defined for each visual element available to a visualization and applied
        across all variables based on the entire dataset rather than the current
        subset. Each visualization has constraints on variables that are
        specific to the particular visual elements of that visualization. Find
        the sub-heading below pertaining to a visualization of interest to learn
        more about the visual elements available to them and their constraints.
      </p>

      <h2>Histogram</h2>

      <ul>
        <li>
          X-axis/ Main: Variables must be either a number or date in order to
          algorithmically determine meaningful bins.
        </li>

        <li>
          Overlay: Variables must have 8 or fewer unique values to associate
          each value with a color-blind friendly color.
        </li>
      </ul>

      <h2>Bar Plot</h2>

      <ul>
        <li>
          X-axis/ Main: Variables must have 10 or fewer unique values to ensure
          legibility of the X-axis ticks.
        </li>

        <li>
          Overlay: Variables must have 8 or fewer unique values to associate
          each value with a color-blind friendly color.
        </li>
      </ul>

      <h2>Scatter Plot</h2>

      <ul>
        <li>
          X-axis: Variables must be numeric or date as this axis is represented
          over a range of values and does not support discrete tick marks.
        </li>

        <li>
          Y-axis: Variables must be numeric or date as this axis is represented
          over a range of values and does not support discrete tick marks.
        </li>

        <li>
          Overlay: Variables must have 8 or fewer unique values to associate
          each value with a color-blind friendly color.
        </li>
      </ul>

      <h2>Box Plot</h2>

      <ul>
        <li>
          X-axis: Variables must have 10 or fewer unique values to ensure
          legibility of the X-axis ticks.
        </li>

        <li>
          Y-axis: Variables must be numeric to calculate meaningful summary
          statistics for them.
        </li>

        <li>
          Overlay: Variables must have 8 or fewer unique values to associate
          each value with a color-blind friendly color.
        </li>
      </ul>

      <h2>Mosaic Plot: 2x2 Table</h2>

      <ul>
        <li>
          X-axis: Variables must have exactly 2 unique values to calculate odds
          ratios and relative risk for the resulting contingency table.
        </li>

        <li>
          Y-axis: Variables must have exactly 2 unique values to calculate odds
          ratios and relative risk for the resulting contingency table.
        </li>
      </ul>

      <h2>Mosaic Plot: RxC Table</h2>

      <ul>
        <li>
          X-axis: Variables must have 10 or fewer unique values to ensure
          legibility of the X-axis ticks.
        </li>

        <li>
          Y-axis: Variables must have 8 or fewer unique values to associate each
          value with a color-blind friendly color.
        </li>
      </ul>

      <br />

      <p>
        Some variable constraints, like the dependency order of visual elements,
        are consistent across all visualizations. This constraint specifies the
        relationship of selected variables based on the data tables, or entities
        to which those variables belong. Plotting two variables from parent and
        child entities in the same visualization requires duplication of the
        data from the parent entity. The dependency order was introduced to
        ensure that duplication of data happens only on visual elements where it
        makes sense. For example, we do not want to inadvertently create a Box
        Plot where the Y-axis variable belongs to a parent entity while the
        X-axis variable belongs to a child entity and the summary statistics on
        the Y-axis are calculated over duplicated data. We recognize there may
        be valid use cases for this type of duplication and mean to explore
        those further and support them explicitly if necessary in the future.
      </p>

      <p>
        The dependency order is specified so that each subsequent visual element
        is constrained to variables of the same or parent entity of the previous
        visual element:
        <pre style={{ textAlign: 'center' }}>
          Y-axis variable : X-axis variable : Overlay variable : Facet variables
        </pre>
      </p>
    </div>
  );
}

export default Document;
