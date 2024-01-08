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
    /**
     * can be used to provide additional context for the viz
     * i.e. we can assign mapType to applicationContext and use it to filter map visualizations by marker
     */
    applicationContext: string,
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
 * App object stored in user's analysis
 */
export interface Computation<ConfigType = unknown>
  extends t.TypeOf<typeof Computation> {
  descriptor: {
    type: string;
    configuration: ConfigType;
  };
}

export const Computation = t.type({
  computationId: string,
  displayName: t.union([t.string, t.undefined]),
  descriptor: type({
    type: string,
    configuration: unknown,
  }),
  visualizations: array(Visualization),
});

export function makeComputationWithConfigDecoder<T>(
  configDecoder: t.Type<T>
): t.Type<Computation<T>> {
  return t.type({
    ...Computation.props,
    descriptor: t.type({
      ...Computation.props.descriptor.props,
      configuration: configDecoder,
    }),
  });
}

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
