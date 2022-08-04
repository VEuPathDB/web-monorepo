import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lens } from 'monocle-ts';
import { differenceWith } from 'lodash';

import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { useStateWithHistory } from '@veupathdb/wdk-client/lib/Hooks/StateWithHistory';

import {
  AnalysisClient,
  SingleAnalysisPatchRequest,
} from '../api/analysis-api';
import {
  Analysis,
  AnalysisSummary,
  makeNewAnalysis,
  NewAnalysis,
} from '../types/analysis';
import { isSavedAnalysis } from '../utils/analysis';

import { useAnalysisClient, useStudyMetadata } from './workspace';
import { createComputation } from '../components/computations/Utils';
import { useHistory } from 'react-router-dom';

/**
 * Type definition for function that will set an attribute of an Analysis.
 */
type Setter<T> = (value: T | ((value: T) => T)) => void;

/** Status options for an analysis. */
export enum Status {
  InProgress = 'in-progress',
  Loaded = 'loaded',
  NotFound = 'not-found',
  Error = 'error',
}

export type AnalysisState = {
  /** Current status of the analysis. */
  status: Status;
  hasUnsavedChanges: boolean;
  /** Optional. Previously saved analysis or analysis in construction. */
  analysis?: Analysis | NewAnalysis;
  error?: unknown;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  setName: Setter<Analysis['displayName']>;
  setDescription: Setter<Analysis['description']>;
  setNotes: Setter<Analysis['notes']>;
  setIsPublic: Setter<Analysis['isPublic']>;
  setFilters: Setter<Analysis['descriptor']['subset']['descriptor']>;
  setComputations: Setter<Analysis['descriptor']['computations']>;
  setDerivedVariables: Setter<Analysis['descriptor']['derivedVariables']>;
  setStarredVariables: Setter<Analysis['descriptor']['starredVariables']>;
  setVariableUISettings: Setter<Analysis['descriptor']['subset']['uiSettings']>;
  setDataTableConfig: Setter<Analysis['descriptor']['dataTableConfig']>;

  saveAnalysis: () => Promise<void>;
  copyAnalysis: () => Promise<{ analysisId: string }>;
  deleteAnalysis: () => Promise<void>;
};

// Used to store loaded analyses. Looks to be a performance enhancement.
const analysisCache = new Map<string, Analysis>();

/**
 * Provide access to a user created analysis and associated functionality.
 *
 * Essentially, an "analysis" is a record of how a given user has
 * interacted with a segment of a given study's data.
 * */
export function useAnalysis(
  analysisId: string | undefined,
  singleAppMode?: string
): AnalysisState {
  const analysisClient = useAnalysisClient();
  const { id: studyId } = useStudyMetadata();
  const history = useHistory();
  const creatingAnalysis = useRef(false);

  // Used when `analysisId` is undefined.
  const defaultAnalysis = useMemo(() => {
    // When we only want to use a single app, extract the computation and pass it to
    // makeNewAnalysis so that by default we will only use this single computation.
    const singleAppComputationId =
      singleAppMode === 'pass' ? 'pass-through' : singleAppMode; // for backwards compatibility

    // If using singleAppMode, create a computation object that will be used in our default analysis.
    const computation = singleAppMode
      ? createComputation(
          singleAppMode,
          undefined,
          [],
          [],
          singleAppComputationId
        )
      : undefined;
    return makeNewAnalysis(studyId, computation);
  }, [singleAppMode, studyId]);

  // Used to convert an unsaved analysis to a saved analysis.
  // This will also change the current url to that of the saved analysis.
  const createAnalysis = useCallback(
    async (newAnalysis: NewAnalysis) => {
      if (!creatingAnalysis.current) {
        creatingAnalysis.current = true;

        const { analysisId } = await analysisClient.createAnalysis(newAnalysis);
        const savedAnalysis = await analysisClient.getAnalysis(analysisId);
        // Reuse the newAnalysis.descriptor to preserve referential equality.
        const analysis: Analysis = {
          ...savedAnalysis,
          descriptor: newAnalysis.descriptor,
        };
        analysisCache.set(analysisId, analysis);
        creatingAnalysis.current = false;

        const newLocation = {
          ...history.location,
          pathname: history.location.pathname.replace(/new/, analysisId),
        };
        history.replace(newLocation);
      }
    },
    [analysisClient, history]
  );

  // Allow undo/redo operations. This isn't really used yet.
  // Might consider converting to plain `useState`.
  const {
    current: analysis,
    setCurrent,
    canRedo,
    canUndo,
    redo,
    undo,
  } = useStateWithHistory<NewAnalysis | Analysis>({
    size: 10,
  });

  // Analysis status
  const [status, setStatus] = useState<Status>(Status.InProgress);

  // Error message related to Status.Error
  const [error, setError] = useState<unknown>();

  // Used to track if an analysis has unsaved changes.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Persist the state of the analysis to the backend.
  const saveAnalysis = useCallback(async () => {
    if (analysis == null)
      throw new Error("Attempt to save an analysis that hasn't been loaded.");

    if (!isSavedAnalysis(analysis)) {
      createAnalysis(analysis);
    } else {
      await analysisClient.updateAnalysis(analysis.analysisId, analysis);
      analysisCache.set(analysis.analysisId, analysis);
    }
  }, [analysisClient, analysis, createAnalysis]);

  // Create a copy of a saved analysis.
  const copyAnalysis = useCallback(async () => {
    if (analysis == null)
      throw new Error("Attempt to copy an analysis that hasn't been loaded.");

    if (!isSavedAnalysis(analysis))
      throw new Error('Cannot copy an unsaved analysis.');

    await saveAnalysis();

    const copyResponse = await analysisClient.copyAnalysis(analysis.analysisId);

    await analysisClient.updateAnalysis(copyResponse.analysisId, {
      displayName: `Copy of ${analysis.displayName}`,
    });

    return copyResponse;
  }, [analysisClient, analysis, saveAnalysis]);

  // Delete an analysis from the backend.
  const deleteAnalysis = useCallback(async () => {
    if (!isSavedAnalysis(analysis))
      throw new Error('Cannot delete an unsaved analysis.');

    return analysisClient.deleteAnalysis(analysis.analysisId).then(() => {
      analysisCache.delete(analysis.analysisId);
    });
  }, [analysisClient, analysis]);

  // Helper function to create stable callbacks
  const useSetter = <T>(
    nestedValueLens: Lens<Analysis | NewAnalysis, T>,
    createIfUnsaved = true
  ) => {
    const _hasUnsavedChanges = analysisId != null || createIfUnsaved;
    return useCallback(
      (nestedValue: T | ((nestedValue: T) => T)) => {
        setCurrent((analysis) =>
          updateAnalysis(analysis, nestedValueLens, nestedValue)
        );
        setHasUnsavedChanges(_hasUnsavedChanges);
      },
      [nestedValueLens, _hasUnsavedChanges]
    );
  };

  // Setters
  const setName = useSetter(analysisToNameLens);
  const setDescription = useSetter(analysisToDescriptionLens);
  const setNotes = useSetter(analysisToNotesLens);
  const setIsPublic = useSetter(analysisToIsPublicLens);
  const setFilters = useSetter(analysisToFiltersLens);
  const setComputations = useSetter(analysisToComputationsLens);
  const setDerivedVariables = useSetter(analysisToDerivedVariablesLens);
  const setStarredVariables = useSetter(analysisToStarredVariablesLens);
  const setVariableUISettings = useSetter(
    analysisToVariableUISettingsLens,
    false
  );
  const setDataTableConfig = useSetter(analysisToDataTableConfig);

  // Retrieve an Analysis from the data store whenever `analysisID` updates.
  // FIXME This will run with any deps change.
  useEffect(() => {
    setHasUnsavedChanges(false);

    if (analysisId == null) {
      setStatus(Status.Loaded);
      setError(undefined);

      // FIXME: Should not just set the "current" state,
      // but also clear the state's history
      setCurrent(defaultAnalysis);
    } else {
      const analysisCacheEntry = analysisCache.get(analysisId);

      if (analysisCacheEntry != null) {
        setCurrent(analysisCacheEntry);
        setStatus(Status.Loaded);
        setError(undefined);
      } else {
        setStatus(Status.InProgress);
        analysisClient.getAnalysis(analysisId).then(
          (analysis) => {
            setCurrent(analysis);
            setStatus(Status.Loaded);
            analysisCache.set(analysis.analysisId, analysis);
          },
          (error) => {
            setError(error);
            setStatus(Status.Error);
          }
        );
      }
    }
  }, [defaultAnalysis, analysisId, setCurrent, analysisClient]);

  // Reactively save analysis when it has been modified
  useEffect(() => {
    if (hasUnsavedChanges) {
      saveAnalysis();
      setHasUnsavedChanges(false);
    }
  }, [saveAnalysis, hasUnsavedChanges]);

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
    setNotes,
    setIsPublic,
    setFilters,
    setComputations,
    setDerivedVariables,
    setStarredVariables,
    setVariableUISettings,
    setDataTableConfig,
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
        analysisCache.delete(id);
        setAnalyses((analyses) =>
          analyses?.filter((analysis) => analysis.analysisId !== id)
        );
      } catch (error: any) {
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
          analysisCache.delete(id);
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
      } catch (error: any) {
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
      } catch (error: any) {
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
const analysisToNotesLens = Lens.fromProp<NewAnalysis | Analysis>()('notes');
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

const analysisToDataTableConfig = Lens.fromPath<NewAnalysis | Analysis>()([
  'descriptor',
  'dataTableConfig',
]);

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
