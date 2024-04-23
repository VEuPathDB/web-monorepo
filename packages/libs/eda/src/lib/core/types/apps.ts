/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { VariableCollectionDescriptor } from './variable';
import { FeaturePrefilterThresholds } from '../api/DataClient/types';
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
