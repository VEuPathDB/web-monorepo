import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnalysis, useGetDefaultVariableDescriptor } from '../../core';
import { useGetDefaultTimeVariableDescriptor } from './hooks/eztimeslider';
import { defaultViewport } from '@veupathdb/components/lib/map/config/map';
import { AppState, makeDefaultMarkerConfigurations } from './appState';

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

  const getDefaultTimeVariableDescriptor =
    useGetDefaultTimeVariableDescriptor();
  const defaultTimeVariable = getDefaultTimeVariableDescriptor();

  const defaultAppState: AppState = useMemo(
    () => ({
      viewport: defaultViewport,
      activeMarkerConfigurationType: 'pie',
      isSidePanelExpanded: true,
      timeSliderConfig: {
        variable: defaultTimeVariable,
        active: true,
        selectedRange: undefined,
      },
      markerConfigurations: makeDefaultMarkerConfigurations(defaultVariable),
    }),
    [defaultTimeVariable, defaultVariable]
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

  // Several keys at once, as a single analysis update.
  const updateAppState = useCallback(
    (partial: Partial<AppState>, createIfUnsaved = false) => {
      setVariableUISettings((prev) => {
        const current = prev[uiStateKey];
        const next = { ...current, ...partial };
        return isEqual(current, next) ? prev : { ...prev, [uiStateKey]: next };
      }, createIfUnsaved);
    },
    [setVariableUISettings, uiStateKey]
  );

  return {
    appState,
    analysisState,
    updateAppState,
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
    setSelection: useSetter('selection'),
    setRecordsEntityId: useSetter('recordsEntityId'),
    setBaseLayer: useSetter('baseLayer'),
  };
}
