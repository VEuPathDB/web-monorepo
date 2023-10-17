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
  literal,
} from 'io-ts';
import { Filter } from '../../types/filter';
import {
  BinSpec,
  BinWidthSlider,
  TimeUnit,
  NumberOrNull,
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
const plotConfig = intersection([
  type({
    variables: array(VariableMapping),
  }),
  partial({
    completeCasesAllVars: number,
    completeCasesAxesVars: number,
  }),
]);

// to be distinguished from geo-viewports
export type NumericViewport = TypeOf<typeof numericViewport>;
const numericViewport = type({
  xMin: string,
  xMax: string,
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
    viewport?: NumericViewport;
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
export const HistogramResponse = intersection([
  type({
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
  }),
  partial({
    sampleSizeTable: sampleSizeTableArray,
    completeCasesTable: completeCasesTableArray,
  }),
]);

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
export const BarplotResponse = intersection([
  type({
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
  }),
  partial({
    sampleSizeTable: sampleSizeTableArray,
    completeCasesTable: completeCasesTableArray,
  }),
]);

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
export const ScatterplotResponse = intersection([
  type({
    scatterplot: type({
      data: ScatterplotResponseData,
      config: plotConfig,
    }),
  }),
  partial({
    sampleSizeTable: sampleSizeTableArray,
    completeCasesTable: completeCasesTableArray,
  }),
]);

// Volcano plot
// The volcano plot response type MUST be the same as the VolcanoPlotData type defined in the components package
export type VolcanoPlotResponse = TypeOf<typeof VolcanoPlotResponse>;

export const VolcanoPlotStatistics = array(
  partial({
    effectSize: string,
    pValue: string,
    adjustedPValue: string,
    pointID: string,
  })
);

export const VolcanoPlotResponse = type({
  effectSizeLabel: string,
  statistics: VolcanoPlotStatistics,
});

export interface VolcanoPlotRequestParams {
  studyId: string;
  filters: Filter[];
  config: {}; // Empty viz config because there are no viz input vars
}

// Bipartite network
export type BipartiteNetworkResponse = TypeOf<typeof BipartiteNetworkResponse>;

const NodeData = type({
  id: string,
});

export const BipartiteNetworkResponse = type({
  column1NodeIDs: array(string),
  column2NodeIDs: array(string),
  nodes: array(NodeData),
  links: array(
    type({
      source: NodeData,
      target: NodeData,
      linkColor: string,
      linkWeight: string,
    })
  ),
});

export interface BipartiteNetworkRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    correlationCoefThreshold?: number;
    significanceThreshold?: number;
  };
}

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
    viewport?: NumericViewport;
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
export const LineplotResponse = intersection([
  type({
    lineplot: type({
      data: LineplotResponseData,
      config: lineplotConfig,
    }),
  }),
  partial({
    sampleSizeTable: sampleSizeTableArray,
    completeCasesTable: completeCasesTableArray,
  }),
]);

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
export const MosaicResponse = intersection([
  type({
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
  }),
  partial({
    sampleSizeTable: array(
      // is this right? everything else is sampleSizeTableArray
      type({
        size: array(number),
      })
    ),
    completeCasesTable: completeCasesTableArray,
  }),
]);

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
    xAxisVariable?: VariableDescriptor; // can be provided by compute
    yAxisVariable?: VariableDescriptor; // can be provided by compute
    overlayVariable?: VariableDescriptor;
    facetVariable?: ZeroToTwoVariables;
    showMissingness?: 'TRUE' | 'FALSE';
  };
  computeConfig?: unknown;
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
export const BoxplotResponse = intersection([
  type({
    boxplot: type({
      data: BoxplotResponseData,
      config: plotConfig,
    }),
  }),
  partial({
    sampleSizeTable: sampleSizeTableArray,
    completeCasesTable: completeCasesTableArray,
  }),
]);

export type LatLonViewport = TypeOf<typeof latLonViewport>;
const latLonViewport = type({
  latitude: type({
    xMin: number,
    xMax: number,
  }),
  longitude: type({
    left: number,
    right: number,
  }),
});

interface MapMarkersConfig {
  outputEntityId: string;
  geoAggregateVariable: VariableDescriptor;
  latitudeVariable: VariableDescriptor;
  longitudeVariable: VariableDescriptor;
  viewport: LatLonViewport;
}

export interface MapMarkersRequestParams {
  studyId: string;
  filters: Filter[];
  config: MapMarkersConfig;
}

type MapElement = TypeOf<typeof MapElement>;
const MapElement = type({
  geoAggregateValue: string,
  entityCount: number,
  avgLat: number,
  avgLon: number,
  minLat: number,
  minLon: number,
  maxLat: number,
  maxLon: number,
});

export type MapMarkersResponse = TypeOf<typeof MapMarkersResponse>;
export const MapMarkersResponse = type({
  mapElements: array(MapElement),
  config: type({
    completeCasesGeoVar: number,
  }),
});

export interface MapMarkersOverlayRequestParams {
  studyId: string;
  filters: Filter[];
  config: MapMarkersConfig & {
    showMissingness:
      | 'TRUE'
      | 'FALSE'
      | 'noVariables'
      | 'allVariables'
      | 'strataVariables';
    xAxisVariable: VariableDescriptor;
    valueSpec: 'count' | 'proportion';
  };
}

export type MapMarkersOverlayConfig = TypeOf<typeof mapMarkersOverlayConfig>;
const mapMarkersOverlayConfig = intersection([
  plotConfig,
  type({
    viewport: latLonViewport,
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

// OverlayConfig will be used for all next-gen visualizations eventually

export type BinDefinitions = TypeOf<typeof BinDefinitions>;
export const BinDefinitions = array(
  type({
    binStart: string,
    binEnd: string,
    binLabel: string,
  })
);

export type AllValuesDefinition = TypeOf<typeof AllValuesDefinition>;
export const AllValuesDefinition = type({
  label: string,
  count: number,
});

export type OverlayConfig = TypeOf<typeof OverlayConfig>;
export const OverlayConfig = intersection([
  type({
    overlayVariable: VariableDescriptor,
  }),
  union([
    type({
      overlayType: literal('categorical'),
      overlayValues: array(string),
    }),
    type({
      overlayType: literal('continuous'),
      overlayValues: BinDefinitions,
    }),
  ]),
]);

export type BubbleOverlayConfig = TypeOf<typeof BubbleOverlayConfig>;
export const BubbleOverlayConfig = type({
  overlayVariable: VariableDescriptor,
  aggregationConfig: union([
    type({
      overlayType: literal('categorical'),
      numeratorValues: array(string),
      denominatorValues: array(string),
    }),
    type({
      overlayType: literal('continuous'),
      aggregator: keyof({ mean: null, median: null }),
    }),
  ]),
});

export interface StandaloneMapMarkersRequestParams {
  studyId: string;
  filters: Filter[];
  config: MapMarkersConfig & {
    overlayConfig?: Omit<OverlayConfig, 'binningMethod'>;
    valueSpec: 'count' | 'proportion';
  };
}

export type StandaloneMapMarkersResponse = TypeOf<
  typeof StandaloneMapMarkersResponse
>;
export const StandaloneMapMarkersResponse = type({
  mapElements: array(
    intersection([
      MapElement,
      type({
        overlayValues: array(
          intersection([
            type({
              binLabel: string,
              value: number,
              count: number,
            }),
            partial({
              binStart: string,
              binEnd: string,
            }),
          ])
        ),
      }),
    ])
  ),
});

export interface StandaloneMapBubblesRequestParams {
  studyId: string;
  filters: Filter[];
  config: MapMarkersConfig & {
    overlayConfig?: BubbleOverlayConfig;
    valueSpec: 'count';
  };
}

export type StandaloneMapBubblesResponse = TypeOf<
  typeof StandaloneMapBubblesResponse
>;
export const StandaloneMapBubblesResponse = type({
  mapElements: array(
    intersection([
      MapElement,
      type({
        overlayValue: number,
      }),
    ])
  ),
});

export interface StandaloneMapBubblesLegendRequestParams {
  studyId: string;
  filters: Filter[];
  config: {
    outputEntityId: string;
    colorLegendConfig: {
      geoAggregateVariable: VariableDescriptor;
      quantitativeOverlayConfig: BubbleOverlayConfig;
    };
    sizeConfig: {
      geoAggregateVariable: VariableDescriptor;
    };
  };
}

export type StandaloneMapBubblesLegendResponse = TypeOf<
  typeof StandaloneMapBubblesLegendResponse
>;
export const StandaloneMapBubblesLegendResponse = type({
  minColorValue: number,
  maxColorValue: number,
  minSizeValue: number,
  maxSizeValue: number,
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

export type LabeledRange = TypeOf<typeof LabeledRange>;
export const LabeledRange = intersection([
  type({
    label: string,
  }),
  partial({
    max: string,
    min: string,
  }),
]);

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
