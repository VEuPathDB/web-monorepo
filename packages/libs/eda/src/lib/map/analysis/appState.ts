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
import { useGetDefaultTimeVariableDescriptor } from './hooks/eztimeslider';
import { defaultViewport } from '@veupathdb/components/lib/map/config/map';
import * as plugins from './mapTypes';
import { STUDIES_ENTITY_ID, STUDY_ID_VARIABLE_ID } from '../constants';
import { AppState } from './Types';

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
      hideVizControl: false,
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
