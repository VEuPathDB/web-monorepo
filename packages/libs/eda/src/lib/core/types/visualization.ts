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
import * as t from 'io-ts';
import { VariableDataShape, VariableType } from './study';

import { CompleteCasesTable } from '../api/DataClient';
import { Filter } from './filter';

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
    // new props to store filters at fullscreen mode
    currentPlotFilters: array(Filter),
    additionalContext: string,
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

// alphadiv abundance
export type ComputationDescriptor = TypeOf<typeof ComputationDescriptor>;
export const ComputationDescriptor = type({
  type: string,
  // handle configuration=null for ZeroConfiguration
  // configuration: union([ComputationConfiguration, nullType]),
  configuration: unknown,
});

/**
 * App object stored in user's analysis
 */
export interface Computation<ConfigType = unknown> {
  computationId: string;
  displayName?: string;
  descriptor: {
    type: string;
    configuration: ConfigType;
  };
  visualizations: Visualization[];
}
export const Computation: t.Type<Computation> = t.interface({
  computationId: string,
  descriptor: type({
    type: string,
    configuration: unknown,
  }),
  visualizations: array(Visualization),
});

const Thing = intersection([
  type({
    name: string,
    displayName: string,
  }),
  partial({
    description: string,
  }),
]);

export type DataElementConstraint = TypeOf<typeof DataElementConstraint>;
export const DataElementConstraint = intersection([
  type({
    isRequired: boolean,
    minNumVars: number,
    maxNumVars: number,
  }),
  partial({
    isTemporal: boolean,
    allowedTypes: array(VariableType),
    allowedShapes: array(VariableDataShape),
    minNumValues: number,
    maxNumValues: number,
    allowMultiValued: boolean,
    // description isn't yet present for the records visualization
    description: string,
  }),
]);

export type VisualizationOverview = TypeOf<typeof VisualizationOverview>;
export const VisualizationOverview = intersection([
  Thing,
  partial({
    dataElementConstraints: array(record(string, DataElementConstraint)),
    dataElementDependencyOrder: array(array(string)),
  }),
]);

export type ComputationAppOverview = TypeOf<typeof ComputationAppOverview>;
export const ComputationAppOverview = intersection([
  Thing,
  type({
    visualizations: array(VisualizationOverview),
    projects: array(string),
  }),
  partial({
    computeName: string,
  }),
]);

export type CoverageStatistics = {
  completeCases: CompleteCasesTable;
  completeCasesAllVars: number;
  completeCasesAxesVars: number;
};
