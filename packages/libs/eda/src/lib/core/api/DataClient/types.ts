/* eslint-disable @typescript-eslint/no-redeclare */

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
  unknown,
  nullType,
  keyof,
  boolean,
} from 'io-ts';
import { Filter } from '../../types/filter';
import {
  BinSpec,
  BinWidthSlider,
  TimeUnit,
  NumberOrNull,
  NumberOrDateRange,
} from '../../types/general';
import { VariableDescriptor, StringVariableValue } from '../../types/variable';
import { ComputationAppOverview } from '../../types/visualization';

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
  intersection([
    type({
      size: array(number),
    }),
    partial({
      facetVariableDetails: union([
        tuple([StringVariableValue]),
        tuple([StringVariableValue, StringVariableValue]),
      ]),
      geoAggregateVariableDetails: StringVariableValue,
      overlayVariableDetails: StringVariableValue,
      xVariableDetails: type({
        entityId: string,
        variableId: string,
        value: union([string, array(string)]),
      }),
    }),
  ])
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

export type VariableClass = TypeOf<typeof variableClass>;
const variableClass = keyof({
  native: null,
  derived: null,
  computed: null,
});

export type VariableSpec = TypeOf<typeof variableSpec>;
const variableSpec = type({
  entityId: string,
  variableId: string,
});

export type PlotReferenceValue = TypeOf<typeof plotReferenceValue>;
const plotReferenceValue = keyof({
  xAxis: null,
  yAxis: null,
  zAxis: null,
  overlay: null,
  facet1: null,
  facet2: null,
  geo: null,
  latitude: null,
  longitude: null,
});

export type API_VariableType = TypeOf<typeof API_VariableType>;
const API_VariableType = keyof({
  category: null,
  string: null,
  number: null,
  date: null,
  longitude: null,
  integer: null,
});

export type API_VariableDataShape = TypeOf<typeof API_VariableDataShape>;
const API_VariableDataShape = keyof({
  continuous: null,
  categorical: null,
  ordinal: null,
  binary: null,
});

export type VariableMapping = TypeOf<typeof VariableMapping>;
export const VariableMapping = intersection([
  type({
    variableClass,
    variableSpec,
    plotReference: plotReferenceValue,
    dataType: API_VariableType,
    dataShape: API_VariableDataShape,
    isCollection: boolean,
    imputeZero: boolean,
  }),
  partial({
    displayName: string,
    displayRangeMin: union([string, number]),
    displayRangeMax: union([string, number]),
    vocabulary: array(string),
    members: array(variableSpec),
  }),
]);

export type PlotConfig = TypeOf<typeof plotConfig>;
const plotConfig = type({
  completeCasesAllVars: number,
  completeCasesAxesVars: number,
  variables: array(VariableMapping),
});

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

export type HistogramSummary = TypeOf<typeof histogramSummary>;
const histogramSummary = type({
  min: string,
  q1: string,
  median: string,
  mean: string,
  q3: string,
  max: string,
});

// to be distinguised from geo-viewports
export type NumericViewport = TypeOf<typeof numericViewport>;
const numericViewport = type({
  xMin: string,
  xMax: string,
});

export type HistogramConfig = TypeOf<typeof histogramConfig>;
const histogramConfig = intersection([
  plotConfig,
  type({
    binSlider: BinWidthSlider,
    binSpec: BinSpec,
    summary: histogramSummary,
    viewport: numericViewport,
  }),
]);

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
    config: histogramConfig,
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
    overlayVariable?: VariableDescriptor;
    facetVariable?: ZeroToTwoVariables;
    showMissingness?: 'TRUE' | 'FALSE';
  };
}

export type BarplotResponse = TypeOf<typeof BarplotResponse>;
export const BarplotResponse = type({
  barplot: type({
    config: plotConfig,
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
    valueSpec:
      | 'raw'
      | 'smoothedMean'
      | 'smoothedMeanWithRaw'
      | 'bestFitLineWithRaw';
    xAxisVariable: VariableDescriptor;
    yAxisVariable: VariableDescriptor;
    overlayVariable?: VariableDescriptor;
    facetVariable?: ZeroToTwoVariables;
    showMissingness?: 'TRUE' | 'FALSE';
    maxAllowedDataPoints?: number;
  };
}

// unlike API doc, data (response) shows seriesX, seriesY, smoothedMeanX, smoothedMeanY, smoothedMeanSE
export const ScatterplotResponseData = array(
  partial({
    // valueSpec = smoothedMean only returns smoothedMean data (no series data)
    // changed to string array
    seriesX: array(string),
    seriesY: array(string),
    seriesGradientColorscale: array(string),
    smoothedMeanX: array(string),
    smoothedMeanY: array(number),
    smoothedMeanSE: array(number),
    // add bestFitLineWithRaw
    bestFitLineX: array(string),
    bestFitLineY: array(number),
    // allow null for r2
    r2: NumberOrNull,
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

// typing computedVariableMetadata for computation apps such as alphadiv and abundance
export type ComputedVariableMetadata = TypeOf<typeof ComputedVariableMetadata>;
export const ComputedVariableMetadata = partial({
  displayName: array(string),
  displayRangeMin: string,
  displayRangeMax: string,
  // collectionVariable for abundance app
  collectionVariable: partial({
    collectionType: string,
    collectionValuePlotRef: string, // e.g., yAxisVariable
    collectionVariablePlotRef: string, // e.g., overlayVariable
    collectionVariableDetails: array(VariableDescriptor),
  }),
});

export type ScatterplotResponse = TypeOf<typeof ScatterplotResponse>;
export const ScatterplotResponse = type({
  scatterplot: type({
    data: ScatterplotResponseData,
    config: plotConfig,
  }),
  sampleSizeTable: sampleSizeTableArray,
  completeCasesTable: completeCasesTableArray,
});

////////////////
// Table Data //
////////////////
export interface TableDataRequestParams {
  studyId: string;
  config: {
    outputEntityId: string;
    outputVariable: Array<VariableDescriptor>;
    pagingConfig: {
      numRows: number;
      offset: number;
    };
  };
}

export type TableDataResponse = TypeOf<typeof TableDataResponse>;
export const TableDataResponse = type({
  columns: array(VariableDescriptor),
  rows: array(array(string)),
});

// lineplot
export interface LineplotRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    xAxisVariable: VariableDescriptor;
    yAxisVariable: VariableDescriptor;
    overlayVariable?: VariableDescriptor;
    facetVariable?: ZeroToTwoVariables;
    binSpec: BinSpec;
    viewport?: {
      xMin: string;
      xMax: string;
    };
    showMissingness?: 'TRUE' | 'FALSE';
    valueSpec: 'mean' | 'median' | 'geometricMean' | 'proportion';
    errorBars: 'TRUE' | 'FALSE';
    yAxisNumeratorValues?: string[];
    yAxisDenominatorValues?: string[];
  };
}

const LineplotResponseData = array(
  intersection([
    type({
      seriesX: array(string),
      seriesY: array(union([string, nullType])),
    }),
    partial({
      binStart: array(string),
      binEnd: array(string),
      errorBars: array(
        type({
          lowerBound: union([NumberOrNull, array(unknown)]), // TEMPORARY
          upperBound: union([NumberOrNull, array(unknown)]), // back end will return number or null
          error: string,
        })
      ),
      binSampleSize: union([
        array(
          type({
            N: number,
          })
        ),
        array(
          type({
            numeratorN: number,
            denominatorN: number,
          })
        ),
      ]),
      overlayVariableDetails: StringVariableValue,
      facetVariableDetails: union([
        tuple([StringVariableValue]),
        tuple([StringVariableValue, StringVariableValue]),
      ]),
    }),
  ])
);

export type LineplotConfig = TypeOf<typeof lineplotConfig>;
const lineplotConfig = intersection([
  plotConfig,
  partial({
    binSlider: BinWidthSlider,
    binSpec: BinSpec,
    viewport: numericViewport,
  }),
]);

export type LineplotResponse = TypeOf<typeof LineplotResponse>;
export const LineplotResponse = type({
  lineplot: type({
    data: LineplotResponseData,
    config: lineplotConfig,
  }),
  sampleSizeTable: sampleSizeTableArray,
  completeCasesTable: completeCasesTableArray,
});

interface MosaicRequestConfig {
  outputEntityId: string;
  xAxisVariable: VariableDescriptor;
  yAxisVariable: VariableDescriptor;
  facetVariable: ZeroToTwoVariables;
  showMissingness?: 'TRUE' | 'FALSE';
}

interface TwoByTwoRequestConfig extends MosaicRequestConfig {
  xAxisReferenceValue: string;
  yAxisReferenceValue: string;
}

export interface MosaicRequestParams {
  studyId: string;
  filters: Filter[];
  config: MosaicRequestConfig;
}

export interface TwoByTwoRequestParams extends MosaicRequestParams {
  config: TwoByTwoRequestConfig;
}

export type MosaicResponse = TypeOf<typeof MosaicResponse>;
export const MosaicResponse = type({
  mosaic: type({
    data: array(
      intersection([
        type({
          xLabel: array(string),
          yLabel: array(array(string)),
          value: array(array(number)),
        }),
        partial({
          facetVariableDetails: union([
            tuple([StringVariableValue]),
            tuple([StringVariableValue, StringVariableValue]),
          ]),
        }),
      ])
    ),
    config: plotConfig,
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
  partial({
    statsTable: array(
      partial({
        pvalue: union([number, string]), // TO DO: should these three stats values all be optional?
        degreesFreedom: number,
        chisq: number,
        facetVariableDetails: union([
          tuple([StringVariableValue]),
          tuple([StringVariableValue, StringVariableValue]),
        ]),
      })
    ),
  }),
]);

// typing 2x2 stats table content
export type twoByTwoStatsContent = TypeOf<typeof twoByTwoStatsContent>;
const twoByTwoStatsContent = type({
  confidenceInterval: union([string, nullType]),
  confidenceLevel: union([number, nullType]),
  pvalue: union([string, nullType]),
  value: union([number, nullType]),
});

export type facetVariableDetailsType = TypeOf<typeof facetVariableDetailsType>;
const facetVariableDetailsType = type({
  facetVariableDetails: union([
    tuple([StringVariableValue]),
    tuple([StringVariableValue, StringVariableValue]),
  ]),
});

export type TwoByTwoResponse = TypeOf<typeof TwoByTwoResponse>;
export const TwoByTwoResponse = intersection([
  MosaicResponse,
  partial({
    statsTable: array(
      // typing 2x2 stats table content
      partial({
        chiSq: twoByTwoStatsContent,
        fisher: twoByTwoStatsContent,
        prevalence: twoByTwoStatsContent,
        oddsRatio: twoByTwoStatsContent,
        relativeRisk: twoByTwoStatsContent,
        sensitivity: twoByTwoStatsContent,
        specificity: twoByTwoStatsContent,
        posPredictiveValue: twoByTwoStatsContent,
        negPredictiveValue: twoByTwoStatsContent,
        facetVariableDetails: union([
          tuple([StringVariableValue]),
          tuple([StringVariableValue, StringVariableValue]),
        ]),
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
    mean: 'TRUE' | 'FALSE';
    xAxisVariable: VariableDescriptor;
    yAxisVariable: VariableDescriptor;
    overlayVariable?: VariableDescriptor;
    facetVariable?: ZeroToTwoVariables;
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
      outliers: array(array(number)),
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
    config: plotConfig,
  }),
  sampleSizeTable: sampleSizeTableArray,
  completeCasesTable: completeCasesTableArray,
});

export interface MapMarkersRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    geoAggregateVariable: VariableDescriptor;
    latitudeVariable: VariableDescriptor;
    longitudeVariable: VariableDescriptor;
    viewport: {
      latitude: {
        xMin: number;
        xMax: number;
      };
      longitude: {
        left: number;
        right: number;
      };
    };
  };
}

export type MapMarkersResponse = TypeOf<typeof MapMarkersResponse>;
export const MapMarkersResponse = type({
  mapElements: array(
    type({
      geoAggregateValue: string,
      entityCount: number,
      avgLat: number,
      avgLon: number,
      minLat: number,
      minLon: number,
      maxLat: number,
      maxLon: number,
    })
  ),
  config: type({
    completeCasesGeoVar: number,
  }),
});

export interface MapMarkersOverlayRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    showMissingness:
      | 'TRUE'
      | 'FALSE'
      | 'noVariables'
      | 'allVariables'
      | 'strataVariables';
    xAxisVariable: VariableDescriptor;
    latitudeVariable: VariableDescriptor;
    longitudeVariable: VariableDescriptor;
    geoAggregateVariable: VariableDescriptor;
    valueSpec: 'count' | 'proportion';
    viewport: {
      latitude: {
        xMin: number;
        xMax: number;
      };
      longitude: {
        left: number;
        right: number;
      };
    };
  };
}

export type MapMarkersOverlayConfig = TypeOf<typeof mapMarkersOverlayConfig>;
const mapMarkersOverlayConfig = intersection([
  plotConfig,
  type({
    viewport: type({
      latitude: type({
        xMin: number,
        xMax: number,
      }),
      longitude: type({
        left: number,
        right: number,
      }),
    }),
  }),
  partial({
    binSpec: BinSpec,
    binSlider: BinWidthSlider,
  }),
]);

export type MapMarkersOverlayResponse = TypeOf<
  typeof MapMarkersOverlayResponse
>;
export const MapMarkersOverlayResponse = type({
  mapMarkers: type({
    data: array(
      type({
        label: array(string),
        value: array(number),
        geoAggregateVariableDetails: StringVariableValue,
      })
    ),
    config: mapMarkersOverlayConfig,
  }),
  sampleSizeTable: sampleSizeTableArray,
  completeCasesTable: completeCasesTableArray,
});

// Standalone Map

// OverlayConfig will be used for next-gen 'pass' app visualizations
export type OverlayConfig = {
  overlayVariable: VariableDescriptor;
} & (
  | {
      overlayType: 'categorical';
      overlayValues: string[];
    }
  | {
      overlayType: 'continuous';
      overlayValues: {
        binStart: string;
        binEnd: string;
        binLabel: string;
      }[];
    }
);

export interface StandaloneMapMarkersRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    geoAggregateVariable: VariableDescriptor;
    latitudeVariable: VariableDescriptor;
    longitudeVariable: VariableDescriptor;
    overlayConfig?: OverlayConfig;
    valueSpec: 'count' | 'proportion';
    viewport: {
      latitude: {
        xMin: number;
        xMax: number;
      };
      longitude: {
        left: number;
        right: number;
      };
    };
  };
}

export type StandaloneMapMarkersResponse = TypeOf<
  typeof StandaloneMapMarkersResponse
>;
export const StandaloneMapMarkersResponse = type({
  mapElements: array(
    type({
      geoAggregateValue: string,
      entityCount: number,
      overlayValues: array(
        intersection([
          type({
            binLabel: string,
            value: number,
          }),
          partial({
            binStart: string,
            binEnd: string,
          }),
        ])
      ),
      avgLat: number,
      avgLon: number,
      minLat: number,
      minLon: number,
      maxLat: number,
      maxLon: number,
    })
  ),
});

export interface ContinousVariableMetadataRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    variable: VariableDescriptor;
    metadata: ('binRanges' | 'median')[];
  };
}

export type BinRange = TypeOf<typeof BinRange>;
export const BinRange = type({
  binStart: string,
  binEnd: string,
  binLabel: string,
});

export type ContinousVariableMetadataResponse = TypeOf<
  typeof ContinousVariableMetadataResponse
>;
export const ContinousVariableMetadataResponse = partial({
  binRanges: type({
    equalInterval: array(BinRange),
    quantile: array(BinRange),
    standardDeviation: array(BinRange),
  }),
  median: number,
});
