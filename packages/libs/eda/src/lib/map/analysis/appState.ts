import { getOrElseW } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { isEqual } from 'lodash';
import { useCallback, useEffect } from 'react';
import { AnalysisState } from '../../core';
import { VariableDescriptor } from '../../core/types/variable';

const LatLngLiteral = t.type({ lat: t.number, lng: t.number });

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
    selectedOverlayVariable: VariableDescriptor,
    /** markerconfigs [] define marker configs in iots & `activeMarkerType` */
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
    setViewport: useSetter('viewport'),
    setMouseMode: useSetter('mouseMode'),
    setSelectedOverlayVariable: useSetter('selectedOverlayVariable'),
    setActiveVisualizationId: useSetter('activeVisualizationId'),
    setBoundsZoomLevel: useSetter('boundsZoomLevel'),
    setSubsetVariableAndEntity: useSetter('subsetVariableAndEntity'),
    setIsSubsetPanelOpen: useSetter('isSubsetPanelOpen'),
  };
}
