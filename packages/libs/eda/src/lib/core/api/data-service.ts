/* eslint-disable @typescript-eslint/no-redeclare */
import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';
import { TypeOf, string, number, array, type, tuple } from 'io-ts';
import { Filter } from '../types/filter';
import { ioTransformer } from './ioTransformer';

export interface HistogramRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    numBins: number;
    entityId: string;
    valueSpec: 'count' | 'proportion';
    xAxisVariable: {
      entityId: string;
      variableId: string;
    };
  };
}

// TO DO: handle other three histogram queries and their responses
export type HistogramResponse = TypeOf<typeof HistogramResponse>;
export const HistogramResponse = tuple([
  array(
    type({
      binLabel: array(string),
      binStart: array(string),
      value: array(number),
    })
  ),
  type({
    incompleteCases: array(number),
    binSlider: type({
      min: array(number),
      max: array(number),
      step: array(number),
    }),
    numBins: array(number),
    xVariableDetails: type({
      variableId: array(string),
      entityId: array(string),
    }),
  }),
]);

export class DataClient extends FetchClient {
  getNumericHistogramNumBins(
    params: HistogramRequestParams
  ): Promise<HistogramResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: '/analyses/numeric-histogram-num-bins',
        body: params,
        transformResponse: ioTransformer(HistogramResponse),
      })
    );
  }
}
