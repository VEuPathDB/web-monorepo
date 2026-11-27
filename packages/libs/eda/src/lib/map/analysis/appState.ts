import * as t from 'io-ts';
import { VariableDescriptor } from '../../core/types/variable';

/**
 * Map UI state, stored in the analysis' variable UI settings under
 * `@@mapApp@@` (see ./useAppState).
 *
 * Compatibility: analyses saved by the previous map UI decode with this
 * codec, because every field that was removed is now simply ignored (io-ts
 * `t.type` tolerates extra properties) and every new field is optional.
 * Removed fields: `studyDetailsPanelConfig`, `isSubsetPanelOpen`, and per
 * marker configuration `legendPanelConfig`, `visualizationPanelConfig`,
 * `activeVisualizationId` and `selectedMarkers`. The former per-marker
 * `geoEntityId` is still read as a fallback for the top-level `geoEntityId`.
 */

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

export const MarkerType = t.keyof({
  pie: null,
  barplot: null,
  bubble: null,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type MarkerType = t.TypeOf<typeof MarkerType>;

// user-specified selection
export type SelectedValues = t.TypeOf<typeof SelectedValues>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const SelectedValues = t.union([t.array(t.string), t.undefined]);

export type BinningMethod = t.TypeOf<typeof BinningMethod>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BinningMethod = t.union([
  t.literal('equalInterval'),
  t.literal('quantile'),
  t.literal('standardDeviation'),
  t.undefined,
]);

export type SelectedCountsOption = t.TypeOf<typeof SelectedCountsOption>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const SelectedCountsOption = t.union([
  t.literal('filtered'),
  t.literal('visible'),
  t.undefined,
]);

export type MarkerConfiguration = t.TypeOf<typeof MarkerConfiguration>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MarkerConfiguration = t.intersection([
  t.type({
    type: MarkerType,
    selectedVariable: VariableDescriptor,
  }),
  t.partial({
    /** legacy: the location entity used to be stored per marker type */
    geoEntityId: t.string,
  }),
  t.union([
    t.type({
      type: t.literal('barplot'),
      selectedValues: SelectedValues,
      selectedPlotMode: t.union([t.literal('count'), t.literal('proportion')]),
      binningMethod: BinningMethod,
      dependentAxisLogScale: t.boolean,
      selectedCountsOption: SelectedCountsOption,
    }),
    t.type({
      type: t.literal('pie'),
      selectedValues: SelectedValues,
      binningMethod: BinningMethod,
      selectedCountsOption: SelectedCountsOption,
    }),
    t.intersection([
      t.type({
        type: t.literal('bubble'),
      }),
      t.partial({
        aggregator: t.union([t.literal('mean'), t.literal('median')]),
        numeratorValues: t.union([t.array(t.string), t.undefined]),
        denominatorValues: t.union([t.array(t.string), t.undefined]),
      }),
    ]),
  ]),
]);

/**
 * What the user has selected on the map, as geohash prefixes of the
 * location entity's geohash variables (see utils/geohashSelection).
 */
export type MapSelection = t.TypeOf<typeof MapSelection>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MapSelection = t.type({
  geoEntityId: t.string,
  prefixes: t.array(t.string),
});

export const BaseLayer = t.keyof({
  Street: null,
  Terrain: null,
  Satellite: null,
  OSM: null,
});

export type LegacyRedirectState = t.TypeOf<typeof LegacyRedirectState>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LegacyRedirectState = t.union([
  t.undefined,
  t.type({
    projectId: t.union([t.string, t.undefined]),
    showLegacyMapRedirectModal: t.boolean,
  }),
]);

export const TimeSliderConfig = t.type({
  variable: t.union([VariableDescriptor, t.undefined]),
  selectedRange: t.union([
    t.type({
      start: t.string,
      end: t.string,
    }),
    t.undefined,
  ]),
  active: t.boolean,
});

export const AppState = t.intersection([
  t.type({
    viewport: t.type({
      center: t.tuple([t.number, t.number]),
      zoom: t.number,
    }),
    activeMarkerConfigurationType: MarkerType,
    markerConfigurations: t.array(MarkerConfiguration),
  }),
  t.partial({
    /** is the left-hand map settings panel open? */
    isSidePanelExpanded: t.boolean,
    /** entity whose geo-variables place the markers */
    geoEntityId: t.string,
    selection: MapSelection,
    /** entity whose records are listed for the selection */
    recordsEntityId: t.string,
    baseLayer: BaseLayer,
    boundsZoomLevel: t.type({
      zoomLevel: t.number,
      bounds: t.type({
        southWest: LatLngLiteral,
        northEast: LatLngLiteral,
      }),
    }),
    subsetVariableAndEntity: t.partial({
      entityId: t.string,
      variableId: t.string,
    }),
    timeSliderConfig: TimeSliderConfig,
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AppState = t.TypeOf<typeof AppState>;

export function makeDefaultMarkerConfigurations(
  defaultVariable: VariableDescriptor
): MarkerConfiguration[] {
  return [
    {
      type: 'pie',
      selectedVariable: defaultVariable,
      selectedValues: undefined,
      binningMethod: undefined,
      selectedCountsOption: 'filtered',
    },
    {
      type: 'barplot',
      selectedPlotMode: 'count',
      selectedVariable: defaultVariable,
      selectedValues: undefined,
      binningMethod: undefined,
      dependentAxisLogScale: false,
      selectedCountsOption: 'filtered',
    },
    {
      type: 'bubble',
      selectedVariable: defaultVariable,
      aggregator: 'mean',
      numeratorValues: undefined,
      denominatorValues: undefined,
    },
  ];
}
