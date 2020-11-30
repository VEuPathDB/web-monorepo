import { createContext, useCallback, useEffect, useState } from 'react';
import { useStateWithHistory, StateWithHistory } from 'wdk-client/Hooks/StateWithHistory';
import { ApiRequestHandler } from 'ebrc-client/util/api';
import { Analysis, NewAnalysis } from '../types/analysis';
import { usePromise } from './usePromise';
import { AnalysisApi } from '../api/analysis-api';
import { useNonNullableContext } from './useNonNullableContext';

type Setter<T extends keyof Analysis> = (value: Analysis[T]) => void;

export const enum Status {
  InProgress = 'in-progress',
  Loaded = 'loaded',
  NotFound = 'not-found',
  Error = 'error',
}

export type AnalysisState = {
  status: Status;
  hasUnsavedChanges: boolean;
  history: Omit<StateWithHistory<Analysis|undefined>, 'setCurrent'>;
  setName: Setter<'name'>;
  setFilters: Setter<'filters'>;
  setVisualizations: Setter<'visualizations'>;
  setDerivedVariables: Setter<'derivedVariables'>;
  setStarredVariables: Setter<'starredVariables'>;
  setVariableUISettings: Setter<'variableUISettings'>;
  copyAnalysis: () => Promise<string>;
  deleteAnalysis: () => Promise<void>;
  saveAnalysis: () => Promise<void>;
}

export interface AnalysisStore {
  getAnalyses(): Promise<Analysis[]>;
  createAnalysis(newAnalysis: NewAnalysis): Promise<string>;
  getAnalysis(analysisId: string): Promise<Analysis>;
  updateAnalysis(analysis: Analysis): Promise<void>;
  deleteAnalysis(analysisId: string): Promise<void>;
}

export const AnalysisListContext = createContext<Analysis[] | undefined>(undefined);

export function useAnalysisList() {
  return useNonNullableContext(AnalysisListContext);
}

export const AnalysisContext = createContext<AnalysisState | undefined>(undefined);

export function useAnalysis() {
  return useNonNullableContext(AnalysisContext);
}

export function useAnalysisState(analysisId: string, store: AnalysisStore): AnalysisState {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const history = useStateWithHistory<Analysis>({
    size: 10,
    onUndo: useCallback(() => setHasUnsavedChanges(true), [setHasUnsavedChanges]),
    onRedo: useCallback(() => setHasUnsavedChanges(true), [setHasUnsavedChanges])
  });
  const savedAnalysis = usePromise(useCallback((): Promise<Analysis> => {
    return store.getAnalysis(analysisId);
  }, [analysisId, store]));

  useEffect(() => {
    if (savedAnalysis.value) {
      history.setCurrent(savedAnalysis.value);
    }
  }, [savedAnalysis.value]);

  const status = savedAnalysis.pending ? Status.InProgress
               : savedAnalysis.error   ? Status.Error
               : Status.Loaded;

  const useSetter = <T extends keyof Analysis>(propertyName: T) => useCallback((value: Analysis[T]) => {
    history.setCurrent(_a => _a && ({ ..._a, [propertyName]: value }));
    setHasUnsavedChanges(true);
  }, [propertyName]);

  const setName = useSetter('name');
  const setFilters = useSetter('filters');
  const setVisualizations = useSetter('visualizations');
  const setDerivedVariables = useSetter('derivedVariables');
  const setStarredVariables = useSetter('starredVariables');
  const setVariableUISettings = useSetter('variableUISettings');

  const saveAnalysis = useCallback(async () => {
    if (history.current == null) throw new Error("Attempt to save an analysis that hasn't been loaded.");
    await store.updateAnalysis(history.current);
    setHasUnsavedChanges(false);
  }, [store, history.current])

  const copyAnalysis = useCallback(async () => {
    if (history.current == null) throw new Error("Attempt to copy an analysis that hasn't been loaded.");
    if (hasUnsavedChanges) await saveAnalysis();
    return await store.createAnalysis(history.current);
  }, [store, history.current, saveAnalysis, hasUnsavedChanges]);

  const deleteAnalysis = useCallback(async () => {
    return store.deleteAnalysis(analysisId);
  }, [store, analysisId]);

  return {
    status,
    history,
    hasUnsavedChanges,
    setName,
    setFilters,
    setVisualizations,
    setDerivedVariables,
    setStarredVariables,
    setVariableUISettings,
    copyAnalysis,
    deleteAnalysis,
    saveAnalysis
  };
}
