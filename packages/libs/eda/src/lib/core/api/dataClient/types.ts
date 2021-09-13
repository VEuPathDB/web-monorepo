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
import { Filter } from '../../types/filter';
import { TimeUnit } from '../../types/general';
import { VariableDescriptor, StringVariableValue } from '../../types/variable';
import { ComputationAppOverview } from '../../types/visualization';
import { ioTransformer } from '../ioTransformer';

export const AppsResponse = type({
  apps: array(ComputationAppOverview),
});

type ZeroToTwoVariables =
  | []
  | [VariableDescriptor]
  | [VariableDescriptor, VariableDescriptor];

// define sampleSizeTableArray
export type SampleSizeTableArray = TypeOf<typeof sampleSizeTableArray>;
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

// define completeCases
export type CompleteCasesTableRow = TypeOf<typeof completeCases>;
const completeCases = partial({
  // set union for size as it depends on the presence of overlay variable
  completeCases: number,
  variableDetails: type({
    entityId: string,
    variableId: string,
  }),
});

// define completeCasesTableArray
export type CompleteCasesTable = TypeOf<typeof completeCasesTableArray>;
const completeCasesTableArray = array(completeCases);

export interface HistogramRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    outputEntityId: string;
    valueSpec: 'count' | 'proportion';
    barMode: 'overlay' | 'stack';
    xAxisVariable: VariableDescriptor;
    overlayVariable?: VariableDescriptor; // TO DO: should this be StringVariable??
    facetVariable?: ZeroToTwoVariables; // ditto here
    binSpec: {
      type: 'binWidth' | 'numBins';
      value?: number;
      units?: TimeUnit;
    };
    viewport?: {
      xMin: string;
      xMax: string;
    };
    showMissingness?: 'TRUE' | 'FALSE';
  };
}

export type HistogramResponse = TypeOf<typeof HistogramResponse>;
export const HistogramResponse = type({
  histogram: type({
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
      completeCases: number,
      plottedIncompleteCases: number,
      binSlider: type({
        min: number,
        max: number,
        step: number,
      }),
      xVariableDetails: VariableDescriptor,
      binSpec: intersection([
        type({ type: keyof({ binWidth: null, numBins: null }) }),
        partial({
          value: number,
          units: TimeUnit,
        }),
      ]),
      summary: type({
        min: string,
        q1: string,
        median: string,
        mean: string,
        q3: string,
        max: string,
      }),
      viewport: type({
        xMin: string,
        xMax: string,
      }),
    }),
  }),
  sampleSizeTable: sampleSizeTableArray,
  completeCasesTable: completeCasesTableArray,
});

export interface BarplotRequestParams {
  studyId: string;
  filters: Filter[];
  //  derivedVariables:  // TO DO
  config: {
    outputEntityId: string;
    // add proportion as it seems to be coming
    valueSpec: 'count' | 'identity' | 'proportion';
    barMode: 'group' | 'stack';
    xAxisVariable: VariableDescriptor;
    // barplot add prop
    overlayVariable?: VariableDescriptor;
    showMissingness?: 'TRUE' | 'FALSE';
  };
}

export type BarplotResponse = TypeOf<typeof BarplotResponse>;
export const BarplotResponse = type({
  barplot: type({
    config: type({
      completeCases: number,
      plottedIncompleteCases: number,
      xVariableDetails: type({
        variableId: string,
        entityId: string,
      }),
    }),
    data: array(
      intersection([
        type({
          label: array(string),
          value: array(number),
        }),
        partial({
          overlayVariableDetails: type({
            entityId: string,
            variableId: string,
            value: string,
          }),
          facetVariableDetails: union([
            tuple([StringVariableValue]),
            tuple([StringVariableValue, StringVariableValue]),
          ]),
        }),
      ])
    ),
  }),
  sampleSizeTable: sampleSizeTableArray,
  completeCasesTable: completeCasesTableArray,
});

// scatterplot
export interface ScatterplotRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    // add bestFitLineWithRaw
    valueSpec:
      | 'raw'
      | 'smoothedMean'
      | 'smoothedMeanWithRaw'
      | 'bestFitLineWithRaw';
    // not quite sure of overlayVariable and facetVariable yet
    // facetVariable?: ZeroToTwoVariables;
    xAxisVariable: VariableDescriptor;
    yAxisVariable: VariableDescriptor;
    overlayVariable?: VariableDescriptor;
    showMissingness?: 'TRUE' | 'FALSE';
  };
}

// unlike API doc, data (response) shows seriesX, seriesY, smoothedMeanX, smoothedMeanY, smoothedMeanSE
export const ScatterplotResponseData = array(
  partial({
    // valueSpec = smoothedMean only returns smoothedMean data (no series data)
    // changed to string array
    seriesX: array(string),
    seriesY: array(string),
    smoothedMeanX: array(string),
    smoothedMeanY: array(number),
    smoothedMeanSE: array(number),
    // add bestFitLineWithRaw
    bestFitLineX: array(string),
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

export type ScatterplotResponse = TypeOf<typeof ScatterplotResponse>;
export const ScatterplotResponse = type({
  scatterplot: type({
    data: ScatterplotResponseData,
    config: type({
      completeCases: number,
      plottedIncompleteCases: number,
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
  completeCasesTable: completeCasesTableArray,
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
    xAxisVariable: VariableDescriptor;
    yAxisVariable: VariableDescriptor;
    overlayVariable?: VariableDescriptor;
    showMissingness?: 'TRUE' | 'FALSE';
  };
}

const LineplotResponseData = array(
  intersection([
    type({
      // changed to string array
      seriesX: array(string),
      seriesY: array(string),
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
  // backend issue for lineplot returning scatterplot currently
  // lineplot: type({
  scatterplot: type({
    data: LineplotResponseData,
    config: type({
      completeCases: number,
      plottedIncompleteCases: number,
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
  completeCasesTable: completeCasesTableArray,
});

export interface MosaicRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    xAxisVariable: VariableDescriptor;
    yAxisVariable: VariableDescriptor;
  };
}

export type MosaicResponse = TypeOf<typeof MosaicResponse>;
export const MosaicResponse = type({
  mosaic: type({
    data: array(
      type({
        xLabel: array(string),
        yLabel: array(array(string)),
        value: array(array(number)),
      })
    ),
    config: type({
      completeCases: number,
      plottedIncompleteCases: number,
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
  sampleSizeTable: array(
    type({
      size: array(number),
    })
  ),
  completeCasesTable: completeCasesTableArray,
});

export type ContTableResponse = TypeOf<typeof ContTableResponse>;
export const ContTableResponse = intersection([
  MosaicResponse,
  type({
    statsTable: array(
      partial({
        pvalue: union([number, string]),
        degreesFreedom: number,
        chisq: number,
      })
    ),
  }),
]);

export type TwoByTwoResponse = TypeOf<typeof TwoByTwoResponse>;
export const TwoByTwoResponse = intersection([
  MosaicResponse,
  type({
    statsTable: array(
      partial({
        oddsratio: number,
        pvalue: union([number, string]),
        orInterval: string,
        rrInterval: string,
        relativerisk: number,
      })
    ),
    completeCasesTable: completeCasesTableArray,
  }),
]);

// boxplot
export interface BoxplotRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    // add bestFitLineWithRaw
    points: 'outliers' | 'all';
    // boolean or string?
    // mean: boolean;
    mean: 'TRUE' | 'FALSE';
    // not quite sure of overlayVariable and facetVariable yet
    // facetVariable?: ZeroToTwoVariables;
    xAxisVariable: VariableDescriptor;
    yAxisVariable: VariableDescriptor;
    overlayVariable?: VariableDescriptor;
    showMissingness?: 'TRUE' | 'FALSE';
  };
}

// unlike API doc, data (response) shows seriesX, seriesY, smoothedMeanX, smoothedMeanY, smoothedMeanSE
const BoxplotResponseData = array(
  intersection([
    type({
      lowerfence: array(number),
      upperfence: array(number),
      q1: array(number),
      q3: array(number),
      median: array(number),
      label: array(string),
    }),
    partial({
      // outliers
      // back end is returning {} instead of [], e.g.
      // [ {}, [1,2,3], [4,5,6] ]
      outliers: array(union([array(number), type({})])),
      rawData: array(array(number)),
      // mean: array(number),
      mean: array(number),
      seriesX: union([array(string), array(number)]),
      seriesY: array(number),
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
    }),
  ])
);

export type BoxplotResponse = TypeOf<typeof BoxplotResponse>;
export const BoxplotResponse = type({
  boxplot: type({
    data: BoxplotResponseData,
    config: type({
      completeCases: number,
      plottedIncompleteCases: number,
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
  completeCasesTable: completeCasesTableArray,
});
