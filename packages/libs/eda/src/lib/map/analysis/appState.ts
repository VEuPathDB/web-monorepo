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

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

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
export const MarkerConfiguration = t.type({
  type: t.string,
});

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

  const getDefaultVariableDescriptor = useGetDefaultVariableDescriptor();
  const defaultVariable = getDefaultVariableDescriptor();
  const studyMetadata = useStudyMetadata();

  const getDefaultTimeVariableDescriptor =
    useGetDefaultTimeVariableDescriptor();
  const defaultTimeVariable = getDefaultTimeVariableDescriptor();

  const defaultAppState: AppState = useMemo(
    () => ({
      viewport: defaultViewport,
      mouseMode: 'default',
      activeMarkerConfigurationType: 'pie',
      isSidePanelExpanded: true,
      timeSliderConfig: {
        variable: defaultTimeVariable,
        active: true,
        selectedRange: undefined,
      },
      markerConfigurations: Object.values(plugins).map((plugin) =>
        plugin.getDefaultConfig({ defaultVariable, study: studyMetadata })
      ),
    }),
    [defaultTimeVariable, defaultVariable, studyMetadata]
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

        const timeSliderConfigIsMissing = appState.timeSliderConfig == null;

        if (missingMarkerConfigs.length > 0 || timeSliderConfigIsMissing) {
          setVariableUISettings((prev) => ({
            ...prev,
            [uiStateKey]: {
              ...appState,
              ...(timeSliderConfigIsMissing
                ? { timeSliderConfig: defaultAppState.timeSliderConfig }
                : {}),
              markerConfigurations: [
                ...appState.markerConfigurations,
                ...missingMarkerConfigs,
              ],
            },
          }));
        }
      }
      setAppStateChecked(true);
    }
  }, [
    analysis,
    appState,
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
  };
}
