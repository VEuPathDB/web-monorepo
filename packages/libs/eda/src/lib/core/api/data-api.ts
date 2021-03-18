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

type NumericViewportRangeOrNone =
  | {
      viewportMin: number;
      viewportMax: number;
    }
  | {
      viewportMin?: never;
      viewportMax?: never;
    };

type ZeroToTwoVariables = [] | [Variable] | [Variable, Variable];

export interface NumericHistogramRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    outputEntityId: string;
    valueSpec: 'count' | 'proportion';
    xAxisVariable: Variable;
    overlayVariable?: Variable;
    facetVariable?: ZeroToTwoVariables;
  } & NumBinsOrNumericWidth &
    NumericViewportRangeOrNone;
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

type DateViewportRangeOrNone =
  | {
      viewportMin: string;
      viewportMax: string;
    }
  | {
      viewportMin?: never;
      viewportMax?: never;
    };

export interface DateHistogramRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    outputEntityId: string;
    valueSpec: 'count' | 'proportion';
    xAxisVariable: Variable;
    overlayVariable?: Variable;
    facetVariable?: ZeroToTwoVariables;
  } & NumBinsOrDateWidth &
    DateViewportRangeOrNone;
}

const HistogramResponseData = array(
  intersection([
    type({
      binLabel: array(string),
      binStart: array(string),
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
);

const HistogramResponseBaseConfig = type({
  incompleteCases: array(number),
  binSlider: type({
    min: number,
    max: number,
    step: number,
  }),
  xVariableDetails: type({
    xVariableDetails: Variable,
  }),
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
      xVariableDetails: type({
        variableId: string,
        entityId: string,
      }),
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
  // Histogram
  getNumericHistogramNumBins(
    params: NumericHistogramRequestParams
  ): Promise<HistogramNumBinsResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: '/apps/pass/visualizations/numeric-histogram-num-bins',
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
        path: '/apps/pass/visualizations/numeric-histogram-bin-width',
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
        path: '/apps/pass/visualizations/date-histogram-num-bins',
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
        path: '/apps/pass/visualizations/date-histogram-bin-width',
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
        path: '/apps/pass/visualizations/barplot',
        body: params,
        transformResponse: ioTransformer(BarplotResponse),
      })
    );
  }
}
