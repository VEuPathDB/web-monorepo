import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import {
  AnalysisState,
  useGetDefaultVariableDescriptor,
  useStudyMetadata,
} from '../../core';
import { VariableDescriptor } from '../../core/types/variable';

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

const MarkerType = t.keyof({
  barplot: null,
  pie: null,
  bubble: null,
});

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
    activeVisualizationId: t.string,
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

export const AppState = t.intersection([
  t.type({
    viewport: t.type({
      center: t.tuple([t.number, t.number]),
      zoom: t.number,
    }),
    activeMarkerConfigurationType: MarkerType,
    markerConfigurations: t.array(MarkerConfiguration),
    isSidePanelExpanded: t.boolean,
  }),
  t.partial({
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
  }),
]);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AppState = t.TypeOf<typeof AppState>;

// export default viewport for custom zoom control
export const defaultViewport: AppState['viewport'] = {
  center: [0, 0],
  zoom: 1,
};

export function useAppState(uiStateKey: string, analysisState: AnalysisState) {
  const { analysis, setVariableUISettings } = analysisState;
  const appState = pipe(
    AppState.decode(
      analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey]
    ),
    getOrElseW(() => undefined)
  );

  const studyMetadata = useStudyMetadata();
  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const defaultVariable = getDefaultVariableDescriptor(
    studyMetadata.rootEntity.id
  );

  const defaultAppState: AppState = useMemo(
    () => ({
      viewport: defaultViewport,
      mouseMode: 'default',
      activeMarkerConfigurationType: 'pie',
      isSidePanelExpanded: true,
      markerConfigurations: [
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
      ],
    }),
    [defaultVariable]
  );

  useEffect(() => {
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

        if (missingMarkerConfigs.length > 0) {
          setVariableUISettings((prev) => ({
            ...prev,
            [uiStateKey]: {
              ...appState,
              markerConfigurations: [
                ...appState.markerConfigurations,
                ...missingMarkerConfigs,
              ],
            },
          }));
        }
      }
    }
  }, [analysis, appState, setVariableUISettings, uiStateKey, defaultAppState]);

  function useSetter<T extends keyof AppState>(key: T) {
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
        });
      },
      [key]
    );
  }

  return {
    appState,
    setActiveMarkerConfigurationType: useSetter(
      'activeMarkerConfigurationType'
    ),
    setMarkerConfigurations: useSetter('markerConfigurations'),
    setBoundsZoomLevel: useSetter('boundsZoomLevel'),
    setIsSidePanelExpanded: useSetter('isSidePanelExpanded'),
    setIsSubsetPanelOpen: useSetter('isSubsetPanelOpen'),
    setSubsetVariableAndEntity: useSetter('subsetVariableAndEntity'),
    setViewport: useSetter('viewport'),
  };
}
