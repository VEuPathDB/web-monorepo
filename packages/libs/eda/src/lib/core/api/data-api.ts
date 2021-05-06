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
  Decoder,
} from 'io-ts';
import { Filter } from '../types/filter';
import { Variable, StringVariableValue } from '../types/variable';
import { ComputationAppOverview } from '../types/visualization';
import { ioTransformer } from './ioTransformer';

const AppsResponse = type({
  apps: array(ComputationAppOverview),
});

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
);

const HistogramResponseBaseConfig = type({
  incompleteCases: array(number),
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

// scatterplot
export interface ScatterplotRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    //DKDK add bestFitLineWithRaw
    valueSpec:
      | 'raw'
      | 'smoothedMean'
      | 'smoothedMeanWithRaw'
      | 'bestFitLineWithRaw';
    // not quite sure of overlayVariable and facetVariable yet
    // facetVariable?: ZeroToTwoVariables;
    xAxisVariable: {
      entityId: string;
      variableId: string;
    };
    yAxisVariable: {
      entityId: string;
      variableId: string;
    };
    overlayVariable?: {
      entityId: string;
      variableId: string;
    };
  };
}

// unlike API doc, data (response) shows seriesX, seriesY, smoothedMeanX, smoothedMeanY, smoothedMeanSE
const ScatterplotResponseData = array(
  partial({
    // valueSpec = smoothedMean only returns smoothedMean data (no series data)
    seriesX: array(number),
    seriesY: array(number),
    smoothedMeanX: array(number),
    smoothedMeanY: array(number),
    smoothedMeanSE: array(number),
    //DKDK add bestFitLineWithRaw
    bestFitLineX: array(number),
    bestFitLineY: array(number),
    r2: number,
    // need to make sure if below is correct (untested)
    overlayVariableDetails: type({
      entityId: string,
      variableId: string,
      value: string,
    }),
    facetVariableDetails: union([
      tuple([StringVariableValue]),
      tuple([StringVariableValue, StringVariableValue]),
    ]),
  })
);

// define sampleSizeTableArray
const sampleSizeTableArray = array(
  partial({
    // set union for size as it depends on the presence of overlay variable
    size: union([number, array(number)]),
    overlayVariableDetails: type({
      entityId: string,
      variableId: string,
      value: string,
    }),
  })
);
export type ScatterplotResponse = TypeOf<typeof ScatterplotResponse>;
export const ScatterplotResponse = type({
  scatterplot: type({
    data: ScatterplotResponseData,
    config: type({
      incompleteCases: number,
      xVariableDetails: type({
        variableId: string,
        entityId: string,
      }),
      yVariableDetails: type({
        variableId: string,
        entityId: string,
      }),
    }),
  }),
  sampleSizeTable: sampleSizeTableArray,
});

// lineplot
export interface LineplotRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    // not quite sure of overlayVariable and facetVariable yet
    // overlayVariable?: Variable;
    // facetVariable?: ZeroToTwoVariables;
    xAxisVariable: {
      entityId: string;
      variableId: string;
    };
    yAxisVariable: {
      entityId: string;
      variableId: string;
    };
  };
}

const LineplotResponseData = array(
  intersection([
    type({
      seriesX: array(number),
      seriesY: array(number),
    }),
    partial({
      // need to make sure if below is correct (untested)
      overlayVariableDetails: StringVariableValue,
      facetVariableDetails: union([
        tuple([StringVariableValue]),
        tuple([StringVariableValue, StringVariableValue]),
      ]),
    }),
  ])
);

export type LineplotResponse = TypeOf<typeof LineplotResponse>;
export const LineplotResponse = type({
  //DKDK backend issue for lineplot returning scatterplot currently
  // lineplot: type({
  scatterplot: type({
    data: LineplotResponseData,
    config: type({
      incompleteCases: number,
      xVariableDetails: type({
        variableId: string,
        entityId: string,
      }),
      yVariableDetails: type({
        variableId: string,
        entityId: string,
      }),
    }),
  }),
  sampleSizeTable: sampleSizeTableArray,
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
  getNumericHistogramNumBins(
    computationName: string,
    params: NumericHistogramRequestParams
  ): Promise<HistogramNumBinsResponse> {
    return this.getVisualizationData(
      computationName,
      'numeric-histogram-num-bins',
      params,
      HistogramNumBinsResponse
    );
  }

  getNumericHistogramBinWidth(
    computationName: string,
    params: NumericHistogramRequestParams
  ): Promise<NumericHistogramBinWidthResponse> {
    return this.getVisualizationData(
      computationName,
      'numeric-histogram-bin-width',
      params,
      NumericHistogramBinWidthResponse
    );
  }

  getDateHistogramNumBins(
    computationName: string,
    params: DateHistogramRequestParams
  ): Promise<HistogramNumBinsResponse> {
    return this.getVisualizationData(
      computationName,
      'date-histogram-num-bins',
      params,
      HistogramNumBinsResponse
    );
  }

  getDateHistogramBinWidth(
    computationName: string,
    params: DateHistogramRequestParams
  ): Promise<DateHistogramBinWidthResponse> {
    return this.getVisualizationData(
      computationName,
      'date-histogram-bin-width',
      params,
      DateHistogramBinWidthResponse
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

  // Scatterplot
  getScatterplot(
    computationName: string,
    params: ScatterplotRequestParams
  ): Promise<ScatterplotResponse> {
    return this.getVisualizationData(
      computationName,
      'scatterplot',
      params,
      ScatterplotResponse
    );
  }

  // Lineplot
  getLineplot(
    computationName: string,
    params: LineplotRequestParams
  ): Promise<LineplotResponse> {
    return this.getVisualizationData(
      computationName,
      'lineplot',
      params,
      LineplotResponse
    );
  }
}
