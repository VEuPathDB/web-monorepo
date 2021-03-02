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
  intersection,
  union,
  undefined,
} from 'io-ts';
import { Filter } from '../types/filter';
import { Variable, StringVariableValue } from '../types/variable';
import { ioTransformer } from './ioTransformer';

type NumBinsOrNumericWidth =
  | {
      numBins: number;
      binWidth?: never;
    }
  | {
      numBins?: undefined;
      binWidth: number;
    };

export interface NumericHistogramRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    entityId: string;
    valueSpec: 'count' | 'proportion';
    xAxisVariable: Variable;
    overlayVariable?: Variable;
    facetVariable?: Variable;
    viewportMin?: number; // do we want some fancy both-or-none
    viewportMax?: number; // constraint here?
  } & NumBinsOrNumericWidth;
}

type NumBinsOrDateWidth =
  | {
      numBins: number;
      binWidth?: never;
    }
  | {
      numBins?: undefined;
      binWidth: string; // Dates widths are strings
    };

export interface DateHistogramRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    entityId: string;
    valueSpec: 'count' | 'proportion';
    xAxisVariable: Variable;
    overlayVariable?: Variable;
    facetVariable?: Variable;
    viewportMin?: string;
    viewportMax?: string;
  } & NumBinsOrDateWidth;
}

const HistogramResponseData = array(
  type({
    binLabel: array(string),
    binStart: array(string),
    value: array(number),
    overlayVariableDetails: StringVariableValue, // these may need to be optional
    facetVariableDetails: StringVariableValue, // (which is tricky with io-ts...?)
  })
);

const HistogramResponseBaseConfig = type({
  incompleteCases: number,
  binSlider: type({
    min: number,
    max: number,
    step: number,
  }),
  xVariableDetails: Variable,
});

// works for date or numeric 'num-bins' responses
export type HistogramNumBinsResponse = TypeOf<typeof HistogramNumBinsResponse>;
export const HistogramNumBinsResponse = type({
  data: HistogramResponseData,
  config: intersection([
    HistogramResponseBaseConfig,
    type({
      numBins: number,
    }),
  ]),
});

export type NumericHistogramBinWidthResponse = TypeOf<
  typeof NumericHistogramBinWidthResponse
>;
export const NumericHistogramBinWidthResponse = type({
  data: HistogramResponseData,
  config: intersection([
    HistogramResponseBaseConfig,
    type({
      binWidth: number,
    }),
  ]),
});

export type DateHistogramBinWidthResponse = TypeOf<
  typeof DateHistogramBinWidthResponse
>;
export const DateHistogramBinWidthResponse = type({
  data: HistogramResponseData,
  config: intersection([
    HistogramResponseBaseConfig,
    type({
      binWidth: string,
    }),
  ]),
});

export interface BarplotRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    entityId: string;
    valueSpec: 'count' | 'identity';
    xAxisVariable: {
      // TO DO: refactor repetition with HistogramRequestParams
      entityId: string;
      variableId: string;
    };
  };
}

export type BarplotResponse = TypeOf<typeof BarplotResponse>;
export const BarplotResponse = tuple([
  array(
    type({
      label: string,
      value: number,
    })
  ),
  type({
    completeCases: array(number),
    xVariableDetails: type({
      variableId: array(string),
      entityId: type({}), // checking with Danielle about this
    }),
  }),
]);

export class DataClient extends FetchClient {
  // Histogram
  getNumericHistogramNumBins(
    params: NumericHistogramRequestParams
  ): Promise<HistogramNumBinsResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: '/analyses/numeric-histogram-num-bins',
        body: params,
        transformResponse: ioTransformer(HistogramNumBinsResponse),
      })
    );
  }

  getNumericHistogramBinWidth(
    params: NumericHistogramRequestParams
  ): Promise<NumericHistogramBinWidthResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: '/analyses/numeric-histogram-bin-width',
        body: params,
        transformResponse: ioTransformer(NumericHistogramBinWidthResponse),
      })
    );
  }

  getDateHistogramNumBins(
    params: DateHistogramRequestParams
  ): Promise<HistogramNumBinsResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: '/analyses/date-histogram-num-bins',
        body: params,
        transformResponse: ioTransformer(HistogramNumBinsResponse),
      })
    );
  }

  getDateHistogramBinWidth(
    params: DateHistogramRequestParams
  ): Promise<DateHistogramBinWidthResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: '/analyses/date-histogram-bin-width',
        body: params,
        transformResponse: ioTransformer(DateHistogramBinWidthResponse),
      })
    );
  }

  // Barplot
  getBarplot(params: BarplotRequestParams): Promise<BarplotResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: '/analyses/barplot',
        body: params,
        transformResponse: ioTransformer(BarplotResponse),
      })
    );
  }
}
