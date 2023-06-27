import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import { useCallback, useEffect } from 'react';
import {
  AllValuesDefinition,
  AnalysisState,
  BinDefinitions,
  useGetDefaultVariableDescriptor,
  useStudyMetadata,
} from '../../core';
import { VariableDescriptor } from '../../core/types/variable';

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

const MarkerType = t.keyof({
  barplot: null,
  pie: null,
});

export type MarkerConfiguration = t.TypeOf<typeof MarkerConfiguration>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MarkerConfiguration = t.intersection([
  t.type({
    type: MarkerType,
    selectedVariable: VariableDescriptor,
  }),
  t.union([
    t.type({
      type: t.literal('barplot'),
      selectedValues: t.union([BinDefinitions, t.array(t.string), t.undefined]), // user-specified selection
      selectedPlotMode: t.union([t.literal('count'), t.literal('proportion')]),
      binningMethod: t.union([
        t.literal('equalInterval'),
        t.literal('quantile'),
        t.literal('standardDeviation'),
        t.undefined,
      ]),
      dependentAxisLogScale: t.boolean,
      selectedCountsOption: t.union([
        t.literal('filtered'),
        t.literal('visible'),
        t.undefined,
      ]),
    }),
    t.type({
      type: t.literal('pie'),
      selectedValues: t.union([t.array(t.string), t.undefined]), // user-specified selection
      binningMethod: t.union([
        t.literal('equalInterval'),
        t.literal('quantile'),
        t.literal('standardDeviation'),
        t.undefined,
      ]),
      selectedCountsOption: t.union([
        t.literal('filtered'),
        t.literal('visible'),
        t.undefined,
      ]),
    }),
  ]),
]);

export const AppState = t.intersection([
  t.type({
    viewport: t.type({
      center: t.tuple([t.number, t.number]),
      zoom: t.number,
    }),
    mouseMode: t.keyof({
      default: null,
      magnification: null,
    }),
    activeMarkerConfigurationType: MarkerType,
    markerConfigurations: t.array(MarkerConfiguration),
  }),
  t.partial({
    activeVisualizationId: t.string,
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

  useEffect(() => {
    if (analysis && !appState) {
      const defaultAppState: AppState = {
        viewport: defaultViewport,
        mouseMode: 'default',
        activeMarkerConfigurationType: 'pie',
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
        ],
      };
      setVariableUISettings((prev) => ({
        ...prev,
        [uiStateKey]: defaultAppState,
      }));
    }
  }, [analysis, appState, defaultVariable, setVariableUISettings, uiStateKey]);

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
    setActiveVisualizationId: useSetter('activeVisualizationId'),
    setBoundsZoomLevel: useSetter('boundsZoomLevel'),
    setIsSubsetPanelOpen: useSetter('isSubsetPanelOpen'),
    setMouseMode: useSetter('mouseMode'),
    setSubsetVariableAndEntity: useSetter('subsetVariableAndEntity'),
    setViewport: useSetter('viewport'),
  };
}
