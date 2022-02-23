import React from 'react';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

export function Tooltip() {
  return (
    <>
      Your variable of interest may not be selectable due to constraints that
      restrict variables to only those that are compatible with the
      visualization. Visualizations cannot display all types and combinations of
      variables. For example, a histogram cannot display categorical data on the
      X-axis.
    </>
  );
}

export function Document() {
  useSetDocumentTitle('Variable Constraints on Visualizations');

  return (
    <div style={{ maxWidth: '1000px', fontSize: '1.4em', margin: '1.4em' }}>
      <h1>Variable Constraints on Visualizations</h1>
      <div>
        <strong>
          <h2 style={{ fontSize: '1.2em' }}>TLDR (Too Long Didn’t Read)</h2>
          <Tooltip />
        </strong>
      </div>
      <br /> <hr />
      <h3 style={{ fontSize: '1.2em' }}>Visualization-Specific Constraints</h3>
      <p>
        Variable constraints define which variables are compatible with
        different visual elements (axes, color, etc) of a given visualization.
        For example, the qualitative color palette has 8 colors, and variable
        constraints allow us to prevent a variable with 9 or more unique values
        from being used to color the plot. Constraints are defined for each
        visual element available to a visualization and applied across all
        variables based on the entire dataset, rather than the current subset.
        Learn more about the visual elements and constraints for each
        visualization below.
      </p>
      <h4 style={{ fontSize: '1.1em' }}>Histogram</h4>
      <ul>
        <li>
          X-axis/Main: Variables must be either a number or date to create a
          histogram
        </li>

        <li>
          Overlay: Variables must have &#8804; 8 unique values to associate each
          value with a color-blind friendly color
        </li>

        <li>
          Facet: Variables must have &#8804; 10 unique values to ensure
          performance of the application
        </li>
      </ul>
      <h4 style={{ fontSize: '1.1em' }}>Bar Plot</h4>
      <ul>
        <li>
          X-axis/Main: Variables must have &#8804; 10 unique values to ensure
          legibility of the X-axis ticks
        </li>

        <li>
          Overlay: Variables must have &#8804; 8 unique values to associate each
          value with a color-blind friendly color
        </li>

        <li>
          Facet: Variables must have &#8804; 10 unique values to ensure
          performance of the application
        </li>
      </ul>
      <h4 style={{ fontSize: '1.1em' }}>Scatter Plot</h4>
      <ul>
        <li>
          X-axis: Variables must be either a number or date to create a scatter
          plot
        </li>

        <li>
          Y-axis: Variables must be either a number or date to create a scatter
          plot
        </li>

        <li>
          Overlay: Variables must have &#8804; 8 unique values to associate each
          value with a color-blind friendly color
        </li>

        <li>
          Facet: Variables must have &#8804; 10 unique values to ensure
          performance of the application
        </li>
      </ul>
      <h4 style={{ fontSize: '1.1em' }}>Box Plot</h4>
      <ul>
        <li>
          X-axis: Variables must have &#8804; 10 unique values to ensure
          legibility of the X-axis ticks
        </li>

        <li>
          Y-axis: Variables must be numeric to calculate summary statistics
        </li>

        <li>
          Overlay: Variables must have &#8804; 8 unique values to associate each
          value with a color-blind friendly color
        </li>

        <li>
          Facet: Variables must have &#8804; 10 unique values to ensure
          performance of the application
        </li>
      </ul>
      <h4 style={{ fontSize: '1.1em' }}>Mosaic Plot: 2x2 Table</h4>
      <ul>
        <li>
          X-axis: Variables must have 2 unique values to calculate odds ratios
          and relative risk for the resulting contingency table
        </li>

        <li>
          Y-axis: Variables must have 2 unique values to calculate odds ratios
          and relative risk for the resulting contingency table
        </li>

        <li>
          Facet: Variables must have &#8804; 10 unique values to ensure
          performance of the application
        </li>
      </ul>
      <h4 style={{ fontSize: '1.1em' }}>Mosaic Plot: RxC Table</h4>
      <ul>
        <li>
          X-axis: Variables must have &#8804; 10 unique values to ensure
          legibility of the X-axis ticks
        </li>

        <li>
          Y-axis: Variables must have &#8804; 8 unique values to associate each
          value with a color-blind friendly color
        </li>

        <li>
          Facet: Variables must have &#8804; 10 unique values to ensure
          performance of the application
        </li>
      </ul>
      <br /> <hr />
      <h3 style={{ fontSize: '1.2em' }}>Universal Constraints</h3>
      <p>
        The dependency order of visual elements is consistent across all
        visualizations and specifies the relationship of selected variables
        based on the data tables, or entities, to which those variables belong.
        Plotting variables from parent and child entities in the same
        visualization requires duplication of the data from the parent entity.
        The dependency order ensures that duplication of data happens only on
        visual elements where it makes sense. For example, we do not want a box
        plot where the Y-axis variable of "Age at enrollment" belongs to a
        parent entity (Participant) while the X-axis variable of "Cough" belongs
        to a child entity (Participant repeated measure) and the summary
        statistics for "Age at enrollment" stratified by "Cough" include
        duplicated data. We will explore whether to support valid use cases for
        this type of data duplication in the future.
      </p>
      <p>
        The dependency order is specified so that each subsequent visual element
        is constrained to variables of the same or parent entity of the previous
        visual element:
        <pre style={{ textAlign: 'center', fontSize: '1.1em' }}>
          Y-axis variable : X-axis variable : Overlay variable : Facet variables
        </pre>
      </p>
    </div>
  );
}

export default Document;
