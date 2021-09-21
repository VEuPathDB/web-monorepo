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
 * Metadata for the visualization object stored in user's analysis
 */
export type VisualizationDescriptor = TypeOf<typeof VisualizationDescriptor>;
export const VisualizationDescriptor = intersection([
  type({
    type: string,
    configuration: unknown,
  }),
  partial({
    thumbnail: string,
  }),
]);

/**
 * Visualization object stored in user's analysis
 */
export type Visualization = TypeOf<typeof Visualization>;
export const Visualization = intersection([
  type({
    visualizationId: string,
    descriptor: VisualizationDescriptor,
  }),
  partial({
    displayName: string,
  }),
]);

/**
 * Type and configuration of the app object stored in user's analysis
 */
export type ComputationDescriptor = TypeOf<typeof ComputationDescriptor>;
export const ComputationDescriptor = type({
  type: string,
  configuration: unknown,
});

/**
 * App object stored in user's analysis
 */
export type Computation = TypeOf<typeof Computation>;
export const Computation = intersection([
  type({
    computationId: string,
    descriptor: ComputationDescriptor,
    visualizations: array(Visualization),
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
    maxNumValues: number,
    allowMultiValued: boolean,
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
  completeCasesAllVars: number;
  completeCasesAxesVars: number;
};
