import { useStateWithHistory } from '@veupathdb/wdk-client/lib/Hooks/StateWithHistory';
import { useCallback, useEffect, useState } from 'react';
import { useAnalysisClient } from './workspace';
import { Analysis, NewAnalysis } from '../types/analysis';
import { usePromise } from './promise';

type Setter<T extends keyof Analysis> = (value: Analysis[T]) => void;

export enum Status {
  InProgress = 'in-progress',
  Loaded = 'loaded',
  NotFound = 'not-found',
  Error = 'error',
}

export type AnalysisState = {
  status: Status;
  hasUnsavedChanges: boolean;
  analysis?: Analysis | NewAnalysis;
  error?: unknown;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setName: Setter<'name'>;
  setFilters: Setter<'filters'>;
  setVisualizations: Setter<'visualizations'>;
  setDerivedVariables: Setter<'derivedVariables'>;
  setStarredVariables: Setter<'starredVariables'>;
  setVariableUISettings: Setter<'variableUISettings'>;
  saveAnalysis: () => Promise<void>;
  copyAnalysis?: () => Promise<{ id: string }>;
  deleteAnalysis?: () => Promise<void>;
};

export function useAnalysis(analysisId: string): AnalysisState {
  const analysisClient = useAnalysisClient();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const {
    current: analysis,
    setCurrent,
    canRedo,
    canUndo,
    redo,
    undo,
  } = useStateWithHistory<Analysis>({
    size: 10,
    onUndo: useCallback(() => setHasUnsavedChanges(true), [
      setHasUnsavedChanges,
    ]),
    onRedo: useCallback(() => setHasUnsavedChanges(true), [
      setHasUnsavedChanges,
    ]),
  });
  const savedAnalysis = usePromise(
    useCallback((): Promise<Analysis> => {
      return analysisClient.getAnalysis(analysisId);
    }, [analysisId, analysisClient])
  );

  useEffect(() => {
    if (savedAnalysis.value) {
      setCurrent(savedAnalysis.value);
    }
  }, [savedAnalysis.value, setCurrent]);

  const status = savedAnalysis.pending
    ? Status.InProgress
    : savedAnalysis.error
    ? Status.Error
    : Status.Loaded;

  const useSetter = <T extends keyof Analysis>(propertyName: T) =>
    useCallback(
      (value: Analysis[T]) => {
        setCurrent((_a) => _a && { ..._a, [propertyName]: value });
        setHasUnsavedChanges(true);
      },
      [propertyName]
    );

  const setName = useSetter('name');
  const setFilters = useSetter('filters');
  const setVisualizations = useSetter('visualizations');
  const setDerivedVariables = useSetter('derivedVariables');
  const setStarredVariables = useSetter('starredVariables');
  const setVariableUISettings = useSetter('variableUISettings');

  const saveAnalysis = useCallback(async () => {
    if (analysis == null)
      throw new Error("Attempt to save an analysis that hasn't been loaded.");
    await analysisClient.updateAnalysis(analysis);
    setHasUnsavedChanges(false);
  }, [analysisClient, analysis]);

  const copyAnalysis = useCallback(async () => {
    if (analysis == null)
      throw new Error("Attempt to copy an analysis that hasn't been loaded.");
    if (hasUnsavedChanges) await saveAnalysis();
    return await analysisClient.createAnalysis({
      ...analysis,
      name: `Copy of ${analysis.name}`,
    });
  }, [analysisClient, analysis, saveAnalysis, hasUnsavedChanges]);

  const deleteAnalysis = useCallback(async () => {
    return analysisClient.deleteAnalysis(analysisId);
  }, [analysisClient, analysisId]);

  useEffect(() => {
    if (hasUnsavedChanges) saveAnalysis();
  }, [saveAnalysis, hasUnsavedChanges]);

  return {
    status,
    analysis,
    error: savedAnalysis.error,
    canRedo,
    canUndo,
    hasUnsavedChanges,
    redo,
    undo,
    setName,
    setFilters,
    setVisualizations,
    setDerivedVariables,
    setStarredVariables,
    setVariableUISettings,
    copyAnalysis,
    deleteAnalysis,
    saveAnalysis,
  };
}
