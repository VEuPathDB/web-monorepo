import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAnalysis,
  useGetDefaultVariableDescriptor,
  useStudyMetadata,
} from '../../core';
import { VariableDescriptor } from '../../core/types/variable';
import { useGetDefaultTimeVariableDescriptor } from './hooks/eztimeslider';
import { defaultViewport } from '@veupathdb/components/lib/map/config/map';
import * as plugins from './mapTypes';
import { STUDIES_ENTITY_ID, STUDY_ID_VARIABLE_ID } from '../constants';
import {
  DEFAULT_DRAGGABLE_VIZ_DIMENSIONS,
  DEFAULT_DRAGGABLE_VIZ_POSITION,
} from './DraggableVisualization';

export const defaultVisualizationPanelConfig = {
  isVisible: false,
  position: DEFAULT_DRAGGABLE_VIZ_POSITION,
  dimensions: DEFAULT_DRAGGABLE_VIZ_DIMENSIONS,
};

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

const PanelPositionConfig = t.type({
  x: t.number,
  y: t.number,
});

const PanelConfig = t.type({
  isVisible: t.boolean,
  position: PanelPositionConfig,
  dimensions: t.type({
    height: t.union([t.number, t.string]),
    width: t.union([t.number, t.string]),
  }),
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PanelConfig = t.TypeOf<typeof PanelConfig>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PanelPositionConfig = t.TypeOf<typeof PanelPositionConfig>;

/*
const MarkerType = t.keyof({
  barplot: null,
  pie: null,
  bubble: null,
});


const BubbleLegendPositionConfig = t.type({
  variable: PanelPositionConfig,
  count: PanelPositionConfig,
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type BubbleLegendPositionConfig = t.TypeOf<
  typeof BubbleLegendPositionConfig
>;
*/

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
// TODO Make `uknown` and use plugin-specific decoder
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MarkerConfiguration = t.intersection([
  t.type({
    type: t.string,
  }),
  t.partial({
    selectedMarkers: t.array(t.string),
    selectedVariable: VariableDescriptor,
  }),
  /*
  t.union([
    t.intersection([
      t.type({
        type: t.literal('barplot'),
        selectedValues: SelectedValues,
        selectedPlotMode: t.union([
          t.literal('count'),
          t.literal('proportion'),
        ]),
        binningMethod: BinningMethod,
        dependentAxisLogScale: t.boolean,
        selectedCountsOption: SelectedCountsOption,
        legendPanelConfig: PanelPositionConfig,
        visualizationPanelConfig: PanelConfig,
      }),
      t.partial({
        // yes all the modes have selectedMarkers but maybe in the future one won't
        selectedMarkers: t.array(t.string),
      }),
    ]),
    t.intersection([
      t.type({
        type: t.literal('pie'),
        selectedValues: SelectedValues,
        binningMethod: BinningMethod,
        selectedCountsOption: SelectedCountsOption,
        legendPanelConfig: PanelPositionConfig,
        visualizationPanelConfig: PanelConfig,
      }),
      t.partial({
        selectedMarkers: t.array(t.string),
      }),
    ]),
    t.intersection([
      t.type({
        type: t.literal('bubble'),
      }),
      t.partial({
        aggregator: t.union([t.literal('mean'), t.literal('median')]),
        numeratorValues: t.union([t.array(t.string), t.undefined]),
        denominatorValues: t.union([t.array(t.string), t.undefined]),
        selectedMarkers: t.array(t.string),
        legendPanelConfig: BubbleLegendPositionConfig,
        visualizationPanelConfig: PanelConfig,
      }),
    ]),
  ]),
  */
]);

export const AppState = t.intersection([
  t.type({
    viewport: t.type({
      center: t.tuple([t.number, t.number]),
      zoom: t.number,
    }),
    activeMarkerConfigurationType: t.string,
    markerConfigurations: t.array(MarkerConfiguration),
    isSidePanelExpanded: t.boolean,
  }),
  t.partial({
    studyDetailsPanelConfig: PanelConfig,
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
    isSubsetPanelOpen: t.boolean,
    timeSliderConfig: t.type({
      variable: t.union([VariableDescriptor, t.undefined]),
      selectedRange: t.union([
        t.type({
          start: t.string,
          end: t.string,
        }),
        t.undefined,
      ]),
      active: t.boolean,
    }),
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AppState = t.TypeOf<typeof AppState>;

export function useAppState(
  uiStateKey: string,
  analysisId?: string,
  singleAppMode?: string
) {
  const analysisState = useAnalysis(analysisId, singleAppMode);

  // make some backwards compatability updates to the appstate retrieved from the back end
  const [appStateChecked, setAppStateChecked] = useState(false);

  useEffect(() => {
    // flip bit when analysis id changes
    setAppStateChecked(false);
  }, [analysisId]);

  const { analysis, setVariableUISettings } = analysisState;
  const appState = pipe(
    AppState.decode(
      analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey]
    ),
    getOrElseW(() => undefined)
  );

  const studyMetadata = useStudyMetadata();
  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const defaultVariable = getDefaultVariableDescriptor();

  const getDefaultTimeVariableDescriptor =
    useGetDefaultTimeVariableDescriptor();
  const defaultTimeVariable = getDefaultTimeVariableDescriptor();

  const isMegaStudy =
    studyMetadata.rootEntity.id === STUDIES_ENTITY_ID &&
    studyMetadata.rootEntity.variables.find(
      (variable) => variable.id === STUDY_ID_VARIABLE_ID
    ) != null;

  const defaultAppState: AppState = useMemo(
    () => ({
      viewport: defaultViewport,
      mouseMode: 'default',
      activeMarkerConfigurationType: 'pie',
      isSidePanelExpanded: false,
      timeSliderConfig: {
        variable: defaultTimeVariable,
        active: true,
        selectedRange: undefined,
      },
      markerConfigurations: Object.values(plugins).map((plugin) =>
        plugin.getDefaultConfig({ defaultVariable, study: studyMetadata })
      ),
      ...(isMegaStudy
        ? {
            studyDetailsPanelConfig: {
              isVisible: false,
              position: {
                x: Math.max(650, window.innerWidth / 2 - 250),
                y: Math.max(300, window.innerHeight / 2 - 250),
              },
              dimensions: { height: 500, width: 500 },
            },
          }
        : {}),
      /*
      markerConfigurations: [
        {
          type: 'pie',
          selectedVariable: defaultVariable,
          selectedValues: undefined,
          binningMethod: undefined,
          selectedCountsOption: 'filtered',
          legendPanelConfig: DEFAULT_DRAGGABLE_LEGEND_POSITION,
          visualizationPanelConfig: defaultVisualizationPanelConfig,
        },
        {
          type: 'barplot',
          selectedPlotMode: 'count',
          selectedVariable: defaultVariable,
          selectedValues: undefined,
          binningMethod: undefined,
          dependentAxisLogScale: false,
          selectedCountsOption: 'filtered',
          legendPanelConfig: DEFAULT_DRAGGABLE_LEGEND_POSITION,
          visualizationPanelConfig: defaultVisualizationPanelConfig,
        },
        {
          type: 'bubble',
          selectedVariable: defaultVariable,
          aggregator: 'mean',
          numeratorValues: undefined,
          denominatorValues: undefined,
          legendPanelConfig: {
            variable: DEFAULT_DRAGGABLE_LEGEND_POSITION,
            count: {
              x: window.innerWidth,
              y: 420,
            },
          },
          visualizationPanelConfig: defaultVisualizationPanelConfig,
        },
      ],
      */
    }),
    [defaultTimeVariable, isMegaStudy, defaultVariable, studyMetadata]
  );

  useEffect(() => {
    if (appStateChecked) return;
    if (analysis) {
      if (!appState) {
        setVariableUISettings((prev) => ({
          ...prev,
          [uiStateKey]: defaultAppState,
        }));
      } else {
        // Ensures forward compatibility of analyses with new marker types
        const missingMarkerConfigs =
          defaultAppState.markerConfigurations.filter(
            (defaultConfig) =>
              !appState.markerConfigurations.some(
                (config) => config.type === defaultConfig.type
              )
          );

        // Used to track if appState needs to be updated with
        // missing pieces of configuration.
        let nextAppState = appState;

        if (missingMarkerConfigs.length > 0) {
          nextAppState = {
            ...nextAppState,
            markerConfigurations: [
              ...nextAppState.markerConfigurations,
              ...missingMarkerConfigs,
            ],
          };
        }

        if (appState.timeSliderConfig == null) {
          nextAppState = {
            ...nextAppState,
            timeSliderConfig: defaultAppState.timeSliderConfig,
          };
        }

        if (isMegaStudy && appState.studyDetailsPanelConfig == null) {
          nextAppState = {
            ...nextAppState,
            studyDetailsPanelConfig: defaultAppState.studyDetailsPanelConfig,
          };
        }

        // If nextAppState has a new value, then we need to update
        // the analysis object
        if (nextAppState !== appState)
          setVariableUISettings((prev) => ({
            ...prev,
            [uiStateKey]: nextAppState,
          }));
      }
      setAppStateChecked(true);
    }
  }, [
    analysis,
    appState,
    isMegaStudy,
    setVariableUISettings,
    uiStateKey,
    defaultAppState,
    appStateChecked,
  ]);

  function useSetter<T extends keyof AppState>(
    key: T,
    createIfUnsaved = false
  ) {
    return useCallback(
      function setter(value: AppState[T]) {
        setVariableUISettings((prev) => {
          const prevValue = prev[uiStateKey][key];
          if (!isEqual(prevValue, value)) {
            return {
              ...prev,
              [uiStateKey]: {
                ...prev[uiStateKey],
                [key]: value,
              },
            };
          }
          return prev;
        }, createIfUnsaved);
      },
      [key, createIfUnsaved]
    );
  }

  return {
    appState,
    analysisState,
    setActiveMarkerConfigurationType: useSetter(
      'activeMarkerConfigurationType',
      true
    ),
    setMarkerConfigurations: useSetter('markerConfigurations', true),
    setBoundsZoomLevel: useSetter('boundsZoomLevel'),
    setIsSidePanelExpanded: useSetter('isSidePanelExpanded'),
    setSubsetVariableAndEntity: useSetter('subsetVariableAndEntity'),
    setViewport: useSetter('viewport'),
    setTimeSliderConfig: useSetter('timeSliderConfig', true),
    setStudyDetailsPanelConfig: useSetter('studyDetailsPanelConfig'),
  };
}
