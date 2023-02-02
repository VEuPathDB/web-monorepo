import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useEffect, useState } from 'react';
import { AnalysisState } from '../../core';
import { VariableDescriptor } from '../../core/types/variable';

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
    activeVisualizationId: t.string,
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
  const { setVariableUISettings } = analysisState;
  const savedState = pipe(
    AppState.decode(
      analysisState.analysis?.descriptor.subset.uiSettings[uiStateKey]
    ),
    getOrElse(() => defaultAppState)
  );
  const [appState, setAppState] = useState<AppState>(savedState);

  useEffect(() => {
    setAppState(savedState);
  }, [savedState]);

  function makeSetter<T extends keyof AppState>(key: T) {
    return function setter(value: AppState[T]) {
      setVariableUISettings((prev) => ({
        ...prev,
        [uiStateKey]: {
          ...appState,
          [key]: value,
        },
      }));
    };
  }

  const setViewport = makeSetter('viewport');
  const setMouseMode = makeSetter('mouseMode');
  const setSelectedOverlayVariable = makeSetter('selectedOverlayVariable');
  const setActiveVisualizationId = makeSetter('activeVisualizationId');

  return {
    appState,
    setViewport,
    setMouseMode,
    setSelectedOverlayVariable,
    setActiveVisualizationId,
  };
}
