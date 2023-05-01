import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import { useCallback, useEffect } from 'react';
import { AnalysisState } from '../../core';
import { VariableDescriptor } from '../../core/types/variable';

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

const MarkerType = t.keyof({
  barplot: null,
  pie: null,
});

const MarkerConfiguration = t.intersection([
  t.type({
    type: MarkerType,
    selectedVariable: VariableDescriptor,
  }),
  t.union([
    t.type({
      type: t.literal('barplot'),
      selectedPlotMode: t.union([t.literal('count'), t.literal('proportion')]),
    }),
    t.type({
      type: t.literal('pie'),
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
  }),
  t.partial({
    activeMarkerConfigurationType: MarkerType,
    markerConfigurations: t.array(MarkerConfiguration),
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

const defaultAppState: AppState = {
  viewport: {
    center: [0, 0],
    zoom: 4,
  },
  mouseMode: 'default',
  activeMarkerConfigurationType: 'pie',
};

export function useAppState(uiStateKey: string, analysisState: AnalysisState) {
  const { analysis, setVariableUISettings } = analysisState;
  const appState = pipe(
    AppState.decode(
      analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey]
    ),
    getOrElseW(() => undefined)
  );

  useEffect(() => {
    if (analysis && !appState) {
      setVariableUISettings((prev) => ({
        ...prev,
        [uiStateKey]: defaultAppState,
      }));
    }
  }, [analysis, appState, setVariableUISettings, uiStateKey]);

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
