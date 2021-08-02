import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { useStateWithHistory } from '@veupathdb/wdk-client/lib/Hooks/StateWithHistory';
import { useCallback, useEffect, useState } from 'react';
import { useAnalysisClient } from './workspace';
import { Analysis } from '../types/analysis';
import { usePromise } from './promise';
import { AnalysisClient } from '../api/analysis-api';

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
  analysis?: Analysis;
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
  copyAnalysis: () => Promise<{ id: string }>;
  deleteAnalysis: () => Promise<void>;
  saveAnalysis: () => Promise<void>;
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

export function usePinnedAnalyses(analysisClient: AnalysisClient) {
  const [pinnedAnalyses, setPinnedAnalyses] = useState<string[]>([]);

  // load and populate pinnedAnalysies
  useEffect(
    () =>
      Task.fromPromise(() => analysisClient.getPreferences()).run((prefs) =>
        setPinnedAnalyses(prefs.pinnedAnalyses ?? [])
      ),
    [analysisClient]
  );

  const isPinnedAnalysis = useCallback(
    (id: string) => pinnedAnalyses.includes(id),
    [pinnedAnalyses]
  );

  const addOrRemovePinnedAnalysis = useCallback(
    (operation: 'add' | 'remove', id: string) => {
      const nextPinnedAnalyses =
        operation === 'add'
          ? pinnedAnalyses.concat(id)
          : pinnedAnalyses.filter((i) => i !== id);
      setPinnedAnalyses(nextPinnedAnalyses);
      analysisClient.setPreferences({
        pinnedAnalyses: nextPinnedAnalyses,
      });
    },
    [analysisClient, pinnedAnalyses]
  );

  const addPinnedAnalysis = useCallback(
    (id: string) => {
      addOrRemovePinnedAnalysis('add', id);
    },
    [addOrRemovePinnedAnalysis]
  );

  const removePinnedAnalysis = useCallback(
    (id: string) => {
      addOrRemovePinnedAnalysis('remove', id);
    },
    [addOrRemovePinnedAnalysis]
  );

  return {
    pinnedAnalyses,
    isPinnedAnalysis,
    addPinnedAnalysis,
    removePinnedAnalysis,
  };
}
