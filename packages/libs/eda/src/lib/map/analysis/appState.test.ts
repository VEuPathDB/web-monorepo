import { isRight } from 'fp-ts/lib/Either';
import { AppState, makeDefaultMarkerConfigurations } from './appState';

// A map UI state as saved by the previous (pre-redesign) map, including
// the floating panel, mega-study and per-marker selection settings that
// no longer exist.
const legacySavedState = {
  viewport: { center: [0, 0], zoom: 1 },
  mouseMode: 'default',
  activeMarkerConfigurationType: 'barplot',
  isSidePanelExpanded: false,
  hideVizControl: false,
  studyDetailsPanelConfig: {
    isVisible: false,
    position: { x: 650, y: 300 },
    dimensions: { height: 500, width: 500 },
  },
  timeSliderConfig: {
    variable: { entityId: 'e1', variableId: 'date' },
    active: true,
    selectedRange: { start: '2020-01-01', end: '2021-01-01' },
  },
  markerConfigurations: [
    {
      type: 'pie',
      selectedVariable: { entityId: 'e1', variableId: 'v1' },
      selectedValues: undefined,
      binningMethod: undefined,
      selectedCountsOption: 'filtered',
      geoEntityId: 'e1',
      selectedMarkers: ['u4p'],
      legendPanelConfig: { x: 10, y: 10 },
      visualizationPanelConfig: {
        isVisible: false,
        position: { x: 0, y: 0 },
        dimensions: { height: 100, width: 100 },
      },
    },
    {
      type: 'barplot',
      selectedPlotMode: 'count',
      selectedVariable: { entityId: 'e1', variableId: 'v1' },
      selectedValues: ['a'],
      binningMethod: undefined,
      dependentAxisLogScale: false,
      selectedCountsOption: 'visible',
      activeVisualizationId: 'viz-1',
      legendPanelConfig: { x: 10, y: 10 },
      visualizationPanelConfig: {
        isVisible: true,
        hideVizControl: true,
        position: { x: 0, y: 0 },
        dimensions: { height: '50%', width: 100 },
      },
    },
    {
      type: 'bubble',
      selectedVariable: { entityId: 'e1', variableId: 'v2' },
      aggregator: 'median',
      numeratorValues: undefined,
      denominatorValues: undefined,
      legendPanelConfig: {
        variable: { x: 1, y: 2 },
        count: { x: 3, y: 4 },
      },
      visualizationPanelConfig: {
        isVisible: false,
        position: { x: 0, y: 0 },
        dimensions: { height: 100, width: 100 },
      },
    },
  ],
};

describe('AppState codec', () => {
  it('decodes map states saved by the previous map UI', () => {
    const result = AppState.decode(legacySavedState);
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right.activeMarkerConfigurationType).toBe('barplot');
      expect(result.right.markerConfigurations[0].geoEntityId).toBe('e1');
    }
  });

  it('decodes the new defaults', () => {
    const state: AppState = {
      viewport: { center: [0, 0], zoom: 1 },
      activeMarkerConfigurationType: 'pie',
      markerConfigurations: makeDefaultMarkerConfigurations({
        entityId: 'e',
        variableId: 'v',
      }),
      geoEntityId: 'e',
      selection: {
        geoEntityId: 'e',
        prefixes: ['u4'],
      },
      baseLayer: 'Satellite',
    };
    expect(isRight(AppState.decode(state))).toBe(true);
  });

  it('rejects malformed selections', () => {
    expect(
      isRight(
        AppState.decode({
          ...legacySavedState,
          selection: { prefixes: 'u4' },
        })
      )
    ).toBe(false);
  });
});
