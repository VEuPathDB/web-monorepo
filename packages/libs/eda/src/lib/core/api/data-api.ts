/* eslint-disable @typescript-eslint/no-redeclare */
import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';
import {
  TypeOf,
  string,
  number,
  array,
  type,
  tuple,
  union,
  intersection,
  partial,
  keyof,
  Decoder,
} from 'io-ts';
import { Filter } from '../types/filter';
import { Variable, StringVariableValue } from '../types/variable';
import { ComputationAppOverview } from '../types/visualization';
import { ioTransformer } from './ioTransformer';

const AppsResponse = type({
  apps: array(ComputationAppOverview),
});

type ZeroToTwoVariables = [] | [Variable] | [Variable, Variable];

export interface HistogramRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    outputEntityId: string;
    valueSpec: 'count' | 'proportion';
    xAxisVariable: Variable;
    overlayVariable?: Variable; // TO DO: should this be StringVariable??
    facetVariable?: ZeroToTwoVariables; // ditto here
    binSpec: {
      type: 'binWidth' | 'numBins';
      value: number;
      units: 'day' | 'week' | 'month' | 'year';
    };
    viewportMin: string;
    viewportMax: string;
  };
}

export type HistogramResponse = TypeOf<typeof HistogramResponse>;
export const HistogramResponse = type({
  data: array(
    intersection([
      type({
        binLabel: array(string),
        binStart: array(string),
        binEnd: array(string),
        value: array(number),
      }),
      partial({
        overlayVariableDetails: StringVariableValue,
        facetVariableDetails: union([
          tuple([StringVariableValue]),
          tuple([StringVariableValue, StringVariableValue]),
        ]),
      }),
    ])
  ),
  config: type({
    incompleteCases: number,
    binSlider: type({
      min: number,
      max: number,
      step: number,
    }),
    xVariableDetails: Variable,
    binSpec: intersection([
      type({ type: keyof({ binWidth: null, numBins: null }) }),
      partial({
        value: number,
        units: keyof({ day: null, week: null, month: null, year: null }),
      }),
    ]),
  }),
});

export interface BarplotRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    outputEntityId: string;
    valueSpec: 'count' | 'identity';
    xAxisVariable: {
      // TO DO: refactor repetition with HistogramRequestParams
      entityId: string;
      variableId: string;
    };
  };
}

export type BarplotResponse = TypeOf<typeof BarplotResponse>;
export const BarplotResponse = type({
  config: type({
    incompleteCases: array(number),
    xVariableDetails: type({
      variableId: string,
      entityId: string,
    }),
  }),
  data: array(
    type({
      label: array(string),
      value: array(number),
    })
  ),
});

export class DataClient extends FetchClient {
  getApps(): Promise<TypeOf<typeof AppsResponse>> {
    return this.fetch(
      createJsonRequest({
        method: 'GET',
        path: '/apps',
        transformResponse: ioTransformer(AppsResponse),
      })
    );
  }

  getVisualizationData<T>(
    computationName: string,
    visualizationName: string,
    params: unknown,
    decoder: Decoder<unknown, T>
  ): Promise<T> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/apps/${computationName}/visualizations/${visualizationName}`,
        body: params,
        transformResponse: ioTransformer(decoder),
      })
    );
  }

  // Histogram
  getHistogram(
    computationName: string,
    params: HistogramRequestParams
  ): Promise<HistogramResponse> {
    return this.getVisualizationData(
      computationName,
      'histogram',
      params,
      HistogramResponse
    );
  }

  // Barplot
  getBarplot(
    computationName: string,
    params: BarplotRequestParams
  ): Promise<BarplotResponse> {
    return this.getVisualizationData(
      computationName,
      'barplot',
      params,
      BarplotResponse
    );
  }
}
