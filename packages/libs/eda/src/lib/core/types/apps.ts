/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { VariableCollectionDescriptor, VariableDescriptor } from './variable';
import {
  FeaturePrefilterThresholds,
  LabeledRange,
} from '../api/DataClient/types';
import { partialToCompleteCodec } from '../components/computations/Utils';

export type CorrelationInputData = t.TypeOf<typeof CorrelationInputData>;
export const CorrelationInputData = t.intersection([
  t.type({
    dataType: t.string,
  }),
  t.partial({
    collectionSpec: VariableCollectionDescriptor,
  }),
]);

export type CorrelationConfig = t.TypeOf<typeof CorrelationConfig>;

export const CorrelationConfig = t.partial({
  data1: CorrelationInputData,
  data2: CorrelationInputData,
  correlationMethod: t.string,
  prefilterThresholds: FeaturePrefilterThresholds,
});

export const CompleteCorrelationConfig =
  partialToCompleteCodec(CorrelationConfig);

export type SelfCorrelationConfig = t.TypeOf<typeof SelfCorrelationConfig>;

export const SelfCorrelationConfig = t.partial({
  data1: VariableCollectionDescriptor,
  correlationMethod: t.string,
  prefilterThresholds: FeaturePrefilterThresholds,
});

export const CompleteSelfCorrelationConfig = partialToCompleteCodec(
  SelfCorrelationConfig
);

// Differential abundance and expression

const Comparator = t.intersection([
  t.partial({
    groupA: t.array(LabeledRange),
    groupB: t.array(LabeledRange),
  }),
  t.type({
    variable: VariableDescriptor,
  }),
]);

export type DifferentialExpressionConfig = t.TypeOf<
  typeof DifferentialExpressionConfig
>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DifferentialExpressionConfig = t.partial({
  identifierVariable: VariableDescriptor,
  valueVariable: VariableDescriptor,
  comparator: Comparator,
  differentialExpressionMethod: t.string,
  pValueFloor: t.string,
});

export type DifferentialAbundanceConfig = t.TypeOf<
  typeof DifferentialAbundanceConfig
>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DifferentialAbundanceConfig = t.partial({
  collectionVariable: VariableCollectionDescriptor,
  comparator: Comparator,
  differentialAbundanceMethod: t.string,
  pValueFloor: t.string,
});
