/* eslint-disable @typescript-eslint/no-redeclare */
import {
  TypeOf,
  type,
  string,
  unknown,
  partial,
  intersection,
  boolean,
  number,
  array,
  record,
} from 'io-ts';
import { VariableDataShape, VariableType } from './study';
import { CompleteCasesTable } from '../api/data-api';

/**
 * Visualization object stored in user's analysis
 */
export type Visualization = TypeOf<typeof Visualization>;
export const Visualization = intersection([
  type({
    id: string,
    computationId: string,
    type: string,
    configuration: unknown,
  }),
  partial({
    displayName: string,
  }),
]);

/**
 * App object stored in user's analysis
 */
export type Computation = TypeOf<typeof Computation>;
export const Computation = intersection([
  type({
    id: string,
    type: string,
    configuration: unknown,
  }),
  partial({
    displayName: string,
  }),
]);

const Thing = partial({
  name: string,
  displayName: string,
  description: string,
});

export type DataElementConstraint = TypeOf<typeof DataElementConstraint>;
export const DataElementConstraint = intersection([
  type({
    isRequired: boolean,
    minNumVars: number,
    maxNumVars: number,
  }),
  partial({
    allowedTypes: array(VariableType),
    allowedShapes: array(VariableDataShape),
  }),
]);

export type VisualizationOverview = TypeOf<typeof VisualizationOverview>;
export const VisualizationOverview = intersection([
  Thing,
  partial({
    dataElementConstraints: array(record(string, DataElementConstraint)),
    dataElementDependencyOrder: array(string),
  }),
]);

export type ComputationAppOverview = TypeOf<typeof ComputationAppOverview>;
export const ComputationAppOverview = intersection([
  Thing,
  partial({
    visualizations: array(VisualizationOverview),
  }),
]);

export type CoverageStatistics = {
  completeCases: CompleteCasesTable;
  outputSize: number;
};
