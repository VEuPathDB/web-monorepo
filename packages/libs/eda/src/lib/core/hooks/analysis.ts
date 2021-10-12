import { differenceWith } from 'lodash';
import { Lens } from 'monocle-ts';

import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { useStateWithHistory } from '@veupathdb/wdk-client/lib/Hooks/StateWithHistory';
import { useCallback, useEffect, useState } from 'react';

import {
  AnalysisClient,
  SingleAnalysisPatchRequest,
} from '../api/analysis-api';
import { Analysis, AnalysisSummary, NewAnalysis } from '../types/analysis';
import { isNewAnalysis, isSavedAnalysis } from '../utils/analysis';

import { useAnalysisClient } from './workspace';

type Setter<T> = (value: T | ((value: T) => T)) => void;

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
  setName: Setter<Analysis['displayName']>;
  setDescription: Setter<Analysis['description']>;
  setIsPublic: Setter<Analysis['isPublic']>;
  setFilters: Setter<Analysis['descriptor']['subset']['descriptor']>;
  setComputations: Setter<Analysis['descriptor']['computations']>;
  setDerivedVariables: Setter<Analysis['descriptor']['derivedVariables']>;
  setStarredVariables: Setter<Analysis['descriptor']['starredVariables']>;
  setVariableUISettings: Setter<Analysis['descriptor']['subset']['uiSettings']>;
  saveAnalysis: () => Promise<void>;
  copyAnalysis: () => Promise<{ analysisId: string }>;
  deleteAnalysis: () => Promise<void>;
};

const analysisCache: Record<string, Analysis | undefined> = {};

export function usePreloadAnalysis() {
  const analysisClient = useAnalysisClient();
  return async function preloadAnalysis(id: string) {
    analysisCache[id] = await analysisClient.getAnalysis(id);
  };
}

export function useAnalysis(
  defaultAnalysis: NewAnalysis,
  createAnalysis: (analysis: NewAnalysis) => void,
  analysisId?: string
): AnalysisState {
  const analysisClient = useAnalysisClient();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const {
    current: analysis,
    setCurrent,
    canRedo,
    canUndo,
    redo,
    undo,
  } = useStateWithHistory<NewAnalysis | Analysis>({
    size: 10,
    onUndo: useCallback(() => setHasUnsavedChanges(true), [
      setHasUnsavedChanges,
    ]),
    onRedo: useCallback(() => setHasUnsavedChanges(true), [
      setHasUnsavedChanges,
    ]),
  });

  const [savedAnalysis, setSavedAnalysis] = useState(
    analysisId == null ? undefined : analysisCache[analysisId]
  );
  const [status, setStatus] = useState<Status>(Status.InProgress);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    if (analysisId == null) {
      setSavedAnalysis(undefined);
      setStatus(Status.Loaded);
      setError(undefined);

      // FIXME: Should not just set the "current" state,
      // but also clear the state's history
      setCurrent(defaultAnalysis);
    } else {
      setSavedAnalysis(analysisCache[analysisId]);
      setStatus(Status.InProgress);
      setError(undefined);
    }
  }, [defaultAnalysis, analysisId, setCurrent]);

  useEffect(() => {
    if (savedAnalysis || analysisId == null) return;
    setStatus(Status.InProgress);
    analysisClient.getAnalysis(analysisId).then(
      (analysis) => {
        setSavedAnalysis(analysis);
        setStatus(Status.Loaded);
        analysisCache[analysis.analysisId] = analysis;
      },
      (error) => {
        setError(error);
        setStatus(Status.Error);
      }
    );
  }, [analysisClient, analysisId, savedAnalysis]);

  useEffect(() => {
    // FIXME: Should not just set the "current" state,
    // but also clear the state's history
    if (savedAnalysis) {
      setCurrent(savedAnalysis);
    }
  }, [savedAnalysis, setCurrent]);

  const useSetter = <T>(
    nestedValueLens: Lens<Analysis | NewAnalysis, T>,
    analysis: NewAnalysis | Analysis | undefined,
    createAnalysis: (newAnalysis: NewAnalysis) => void,
    createAnalysisOnChange = true
  ) =>
    useCallback(
      (nestedValue: T | ((nestedValue: T) => T)) => {
        if (analysis == null)
          throw new Error(
            "Attempt to update an analysis that hasn't been loaded."
          );

        if (isNewAnalysis(analysis) && createAnalysisOnChange) {
          createAnalysis(
            updateAnalysis(analysis, nestedValueLens, nestedValue)
          );
          return;
        }

        setCurrent((_a) => {
          const newNestedValue =
            typeof nestedValue === 'function'
              ? (nestedValue as (nestedValue: T) => T)(nestedValueLens.get(_a))
              : nestedValue;

          return nestedValueLens.set(newNestedValue)(_a);
        });
        setHasUnsavedChanges(true);
      },
      [analysis, createAnalysis, nestedValueLens, createAnalysisOnChange]
    );

  const setName = useSetter(analysisToNameLens, analysis, createAnalysis);
  const setDescription = useSetter(
    analysisToDescriptionLens,
    analysis,
    createAnalysis
  );
  const setIsPublic = useSetter(
    analysisToIsPublicLens,
    analysis,
    createAnalysis
  );
  const setFilters = useSetter(analysisToFiltersLens, analysis, createAnalysis);
  const setComputations = useSetter(
    analysisToComputationsLens,
    analysis,
    createAnalysis
  );
  const setDerivedVariables = useSetter(
    analysisToDerivedVariablesLens,
    analysis,
    createAnalysis
  );
  const setStarredVariables = useSetter(
    analysisToStarredVariablesLens,
    analysis,
    createAnalysis
  );
  const setVariableUISettings = useSetter(
    analysisToVariableUISettingsLens,
    analysis,
    createAnalysis
  );

  const saveAnalysis = useCallback(async () => {
    if (analysis == null)
      throw new Error("Attempt to save an analysis that hasn't been loaded.");

    if (!isSavedAnalysis(analysis)) {
      createAnalysis(analysis);
      return;
    }

    await analysisClient.updateAnalysis(analysis.analysisId, analysis);
    analysisCache[analysis.analysisId] = analysis;
    setHasUnsavedChanges(false);
  }, [analysisClient, analysis, createAnalysis]);

  const copyAnalysis = useCallback(async () => {
    if (analysis == null)
      throw new Error("Attempt to copy an analysis that hasn't been loaded.");

    if (!isSavedAnalysis(analysis))
      throw new Error('Cannot copy an unsaved analysis.');

    if (hasUnsavedChanges) await saveAnalysis();

    const copyResponse = await analysisClient.copyAnalysis(analysis.analysisId);

    await analysisClient.updateAnalysis(copyResponse.analysisId, {
      displayName: `Copy of ${analysis.displayName}`,
    });

    return copyResponse;
  }, [analysisClient, analysis, saveAnalysis, hasUnsavedChanges]);

  const deleteAnalysis = useCallback(async () => {
    if (!isSavedAnalysis(analysis))
      throw new Error('Cannot delete an unsaved analysis.');

    return analysisClient.deleteAnalysis(analysis.analysisId).then(() => {
      delete analysisCache[analysis.analysisId];
    });
  }, [analysisClient, analysis]);

  useEffect(() => {
    if (isSavedAnalysis(analysis) && hasUnsavedChanges) saveAnalysis();
  }, [saveAnalysis, analysis, hasUnsavedChanges]);

  return {
    status,
    analysis,
    error,
    canRedo,
    canUndo,
    hasUnsavedChanges,
    redo,
    undo,
    setName,
    setDescription,
    setIsPublic,
    setFilters,
    setComputations,
    setDerivedVariables,
    setStarredVariables,
    setVariableUISettings,
    copyAnalysis,
    deleteAnalysis,
    saveAnalysis,
  };
}

export function useAnalysisList(analysisClient: AnalysisClient) {
  // const analysisClient = useAnalysisClient();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  useEffect(() => {
    setLoading(true);
    analysisClient.getAnalyses().then(
      (analyses) => {
        setAnalyses(analyses);
        setLoading(false);
      },
      (error) => {
        setError(error instanceof Error ? error.message : String(error));
        setLoading(false);
      }
    );
  }, [analysisClient]);

  const deleteAnalysis = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await analysisClient.deleteAnalysis(id);
        delete analysisCache[id];
        setAnalyses((analyses) =>
          analyses?.filter((analysis) => analysis.analysisId !== id)
        );
      } catch (error) {
        setError(error.message ?? String(error));
      } finally {
        setLoading(false);
      }
    },
    [analysisClient]
  );

  const deleteAnalyses = useCallback(
    async (ids: Iterable<string>) => {
      setLoading(true);
      try {
        await analysisClient.deleteAnalyses(ids);
        for (const id of ids) {
          delete analysisCache[id];
        }
        setAnalyses(
          (analyses) =>
            analyses &&
            differenceWith(
              analyses,
              Array.from(ids),
              (analysis, id) => analysis.analysisId === id
            )
        );
      } catch (error) {
        setError(error.message ?? String(error));
      } finally {
        setLoading(false);
      }
    },
    [analysisClient]
  );

  const updateAnalysis = useCallback(
    async (id: string, patch: SingleAnalysisPatchRequest) => {
      setLoading(true);
      try {
        await analysisClient.updateAnalysis(id, patch);
        setAnalyses(
          (analyses) =>
            analyses &&
            analyses.map((analysis) =>
              analysis.analysisId !== id ? analysis : { ...analysis, ...patch }
            )
        );
      } catch (error) {
        setError(error.message ?? String(error));
      } finally {
        setLoading(false);
      }
    },
    [analysisClient]
  );

  return {
    analyses,
    loading,
    error,
    deleteAnalyses,
    deleteAnalysis,
    updateAnalysis,
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

const analysisToNameLens = Lens.fromProp<NewAnalysis | Analysis>()(
  'displayName'
);
const analysisToDescriptionLens = Lens.fromProp<NewAnalysis | Analysis>()(
  'description'
);
const analysisToIsPublicLens = Lens.fromProp<NewAnalysis | Analysis>()(
  'isPublic'
);
const analysisToFiltersLens = Lens.fromPath<NewAnalysis | Analysis>()([
  'descriptor',
  'subset',
  'descriptor',
]);
const analysisToComputationsLens = Lens.fromPath<NewAnalysis | Analysis>()([
  'descriptor',
  'computations',
]);
const analysisToDerivedVariablesLens = Lens.fromPath<NewAnalysis | Analysis>()([
  'descriptor',
  'derivedVariables',
]);
const analysisToStarredVariablesLens = Lens.fromPath<NewAnalysis | Analysis>()([
  'descriptor',
  'starredVariables',
]);
const analysisToVariableUISettingsLens = Lens.fromPath<
  NewAnalysis | Analysis
>()(['descriptor', 'subset', 'uiSettings']);

function updateAnalysis<T>(
  analysis: NewAnalysis | Analysis,
  nestedValueLens: Lens<NewAnalysis | Analysis, T>,
  nestedValue: T | ((nestedValue: T) => T)
) {
  const newNestedValue =
    typeof nestedValue === 'function'
      ? (nestedValue as (nestedValue: T) => T)(nestedValueLens.get(analysis))
      : nestedValue;

  return nestedValueLens.set(newNestedValue)(analysis);
}
