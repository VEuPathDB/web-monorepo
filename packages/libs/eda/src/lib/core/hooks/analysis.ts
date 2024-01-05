import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Lens } from 'monocle-ts';
import { differenceWith } from 'lodash';

import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import {
  AnalysisClient,
  SingleAnalysisPatchRequest,
} from '../api/AnalysisClient';
import {
  Analysis,
  AnalysisSummary,
  makeNewAnalysis,
  NewAnalysis,
} from '../types/analysis';
import { isSavedAnalysis } from '../utils/analysis';

import { useAnalysisClient, useStudyRecord } from './workspace';
import { createComputation } from '../components/computations/Utils';
import { useHistory } from 'react-router-dom';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { Computation, Visualization } from '../types/visualization';
import EventEmitter from 'events';

/**
 * Type definition for function that will set an attribute of an Analysis.
 */
type Setter<T> = (
  value: T | ((value: T) => T),
  createIfUnsaved?: boolean
) => void;

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
  /** Indicates if the analysis has changes that have not yet been persisted to storage. */
  hasUnsavedChanges: boolean;
  /** Optional. Previously saved analysis or analysis in construction. */
  analysis?: Analysis | NewAnalysis;
  /** Error object related to loading an analysis */
  error?: unknown;
  /** Set the display name of the analysis. See {@link Setter}. */
  setName: Setter<Analysis['displayName']>;
  /** Set the description of the analysis. See {@link Setter}. */
  setDescription: Setter<Analysis['description']>;
  /** Set the notes of an analysis. See {@link Setter}. */
  setNotes: Setter<Analysis['notes']>;
  /** Set the isPublic flag of an anlysis. See {@link Setter}. */
  setIsPublic: Setter<Analysis['isPublic']>;
  /** Set the filters of an analysis. See {@link Setter}. */
  setFilters: Setter<Analysis['descriptor']['subset']['descriptor']>;
  /** Set the list of configured computations of the analysis. See {@link Setter}. */
  setComputations: Setter<Analysis['descriptor']['computations']>;
  /** Set the list of derived variables of an analysis. See {@link Setter}. */
  setDerivedVariables: Setter<Analysis['descriptor']['derivedVariables']>;
  /** Set the list of starred variables of an analysis. See {@link Setter}. */
  setStarredVariables: Setter<Analysis['descriptor']['starredVariables']>;
  /** Set the UI state of variables in an analysis. See {@link Setter}. */
  setVariableUISettings: Setter<Analysis['descriptor']['subset']['uiSettings']>;
  /** Set the datatable config of an analysis. See {@link Setter}. */
  setDataTableConfig: Setter<Analysis['descriptor']['dataTableConfig']>;

  /** Convenience methods for manipulating visualizations nested inside computations.
   * The getters return undefined if analysis is undefined...
   */

  /** get a flat list of all visualizations, regardless of computation, though you can optionally specify a computation */
  getVisualizations: (computationId?: string) => Visualization[] | undefined;
  /** get one visualization by Id */
  getVisualization: (
    visualizationId: string | undefined
  ) => Visualization | undefined;
  /** get one visualization and its computation by Id all at once */
  getVisualizationAndComputation: (
    visualizationId: string | undefined
  ) => { visualization: Visualization; computation: Computation } | undefined;
  /** update visualization by replacing existing visualization with same Id with the provided version */
  updateVisualization: (visualization: Visualization) => void;
  /** add a new visualization to a computation, removing it if necessary from a previous computation */
  addVisualization: (
    computationId: string,
    visualization: Visualization
  ) => void;
  /** TO DO: copyVisualization? */
  /** delete a visualization, do not remove computation if it ends up empty */
  deleteVisualization: (visualizationId: string) => void;
  /** TO DO: add a deleteIfEmpty mode to deleteVisualization? - see `deleteComputationWithNoVisualizations` in VisualizationsContainer */

  saveAnalysis: () => Promise<void>;
  copyAnalysis: () => Promise<{ analysisId: string }>;
  deleteAnalysis: () => Promise<void>;
};

// Used to store loaded analyses. Looks to be a performance enhancement.
const analysisCache = new Map<string, Analysis>();

class AnalysisEventEmitter {
  private _emitter = new EventEmitter();
  private _analysisUpdateEvent = 'analysis_update';
  private _listUpdateEvent = 'list_update';

  onAnalysisUpdate(callback: (analysis: Analysis) => void) {
    const { _emitter, _analysisUpdateEvent } = this;
    _emitter.on(_analysisUpdateEvent, callback);
    return function cancel() {
      _emitter.off(_analysisUpdateEvent, callback);
    };
  }

  onListUpdate(callback: (analysisList: AnalysisSummary[]) => void) {
    const { _emitter, _listUpdateEvent } = this;
    _emitter.on(_listUpdateEvent, callback);
    return function cancel() {
      _emitter.off(_listUpdateEvent, callback);
    };
  }

  triggerAnalysisUpdate(analysis: Analysis) {
    this._emitter.emit(this._analysisUpdateEvent, analysis);
  }

  triggerListUpdate(list: AnalysisSummary[]) {
    this._emitter.emit(this._listUpdateEvent, list);
  }
}

const analysisEventEmitter = new AnalysisEventEmitter();

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
  const datasetRecord = useStudyRecord();
  const studyId = getStudyId(datasetRecord);
  if (studyId == null)
    throw new Error(
      'Dataset record does not include a dataset id: ' +
        datasetRecord.id.toString()
    );
  const history = useHistory();
  const creatingAnalysis = useRef(false);

  const [analysis, setAnalysis] = useState<NewAnalysis | Analysis>();

  // Ref used for saving (see the save() function below)
  const analysisRef = useRef<Analysis | NewAnalysis>();
  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

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
          descriptor: analysisRef.current?.descriptor ?? newAnalysis.descriptor,
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

  // Analysis status
  const [status, setStatus] = useState<Status>(Status.InProgress);

  // Error message related to Status.Error
  const [error, setError] = useState<unknown>();

  // Used to track if an analysis has unsaved changes.
  const [updateScheduled, setUpdateScheduled] = useState(false);

  // Persist the state of the analysis to the backend.
  const saveAnalysis = useCallback(async () => {
    const analysis = analysisRef.current;
    if (analysis == null)
      throw new Error("Attempt to save an analysis that hasn't been loaded.");

    if (!isSavedAnalysis(analysis)) {
      createAnalysis(analysis);
    }
    // Only save if the analysis has changed
    else if (analysis !== analysisCache.get(analysis.analysisId)) {
      await analysisClient.updateAnalysis(analysis.analysisId, analysis);
      analysisCache.set(analysis.analysisId, analysis);
      analysisEventEmitter.triggerAnalysisUpdate(analysis);
    }
  }, [analysisClient, createAnalysis]);

  // Create a copy of a saved analysis.
  const copyAnalysis = useCallback(async () => {
    const analysis = analysisRef.current;
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
  }, [analysisClient, saveAnalysis]);

  // Delete an analysis from the backend.
  const deleteAnalysis = useCallback(async () => {
    const analysis = analysisRef.current;
    if (!isSavedAnalysis(analysis))
      throw new Error('Cannot delete an unsaved analysis.');

    return analysisClient.deleteAnalysis(analysis.analysisId).then(() => {
      analysisCache.delete(analysis.analysisId);
    });
  }, [analysisClient]);

  // Helper function to create stable callbacks
  const useSetter = <T>(
    nestedValueLens: Lens<Analysis | NewAnalysis, T>,
    _createIfUnsaved = true
  ) => {
    return useCallback(
      (
        nestedValue: T | ((nestedValue: T) => T),
        createIfUnsaved = _createIfUnsaved
      ) => {
        // Always schedule a save, unless it's a "new" analysis and we're being
        // told to not schedule a save.
        const scheduleUpdate = analysisId != null || createIfUnsaved;
        setAnalysis((analysis) => {
          if (analysis == null)
            throw new Error(
              "Cannot update an analysis before it's been loaded."
            );
          return updateAnalysis(analysis, nestedValueLens, nestedValue);
        });
        setUpdateScheduled(scheduleUpdate);
      },
      [nestedValueLens, _createIfUnsaved]
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

  // Visualization manipulations
  const getVisualizations = useCallback(
    (computationId?: string) =>
      analysis?.descriptor.computations
        .filter(
          (computation) =>
            computationId == null || computation.computationId === computationId
        )
        .flatMap((computation) => computation.visualizations),
    [analysis]
  );

  const getVisualization = useCallback(
    (visualizationId: string | undefined) =>
      analysis?.descriptor.computations
        .flatMap((computation) => computation.visualizations)
        .find((viz) => viz.visualizationId === visualizationId),
    [analysis]
  );

  const getVisualizationAndComputation = useCallback(
    (visualizationId: string | undefined) =>
      analysis?.descriptor.computations.reduce((result, comp) => {
        const foundViz = comp.visualizations.find(
          (viz) => viz.visualizationId === visualizationId
        );
        return foundViz != null
          ? {
              computation: comp,
              visualization: foundViz,
            }
          : result;
      }, undefined as { computation: Computation; visualization: Visualization } | undefined),
    [analysis]
  );

  // no-op if the visualization isn't there
  // hope that's OK!
  const deleteVisualization = useCallback(
    (visualizationId: string) =>
      setComputations((computations) =>
        computations.map((computation) => ({
          ...computation,
          visualizations: computation.visualizations.filter(
            (viz) => viz.visualizationId !== visualizationId
          ),
        }))
      ),
    [setComputations]
  );

  // add or move a visualization (silently removes it from any (or none) computation before adding) to a computation
  const addVisualization = useCallback(
    (computationId: string, visualization: Visualization) => {
      setComputations((computations) =>
        computations.map((comp) => ({
          ...comp,
          visualizations: [
            ...comp.visualizations.filter(
              ({ visualizationId }) =>
                visualizationId !== visualization.visualizationId
            ),
            ...(comp.computationId === computationId ? [visualization] : []),
          ],
        }))
      );
    },
    [setComputations]
  );

  const updateVisualization = useCallback(
    (visualization: Visualization) =>
      setComputations((computations) =>
        computations.map((computation) => ({
          ...computation,
          visualizations: computation.visualizations.map((viz) =>
            viz.visualizationId === visualization.visualizationId
              ? visualization
              : viz
          ),
        }))
      ),
    [setComputations]
  );

  // Retrieve an Analysis from the data store whenever `analysisID` updates.
  const loadAnalysis = useCallback(() => {
    setUpdateScheduled(false);
    if (analysisId == null) {
      setStatus(Status.Loaded);
      setError(undefined);
      setAnalysis(defaultAnalysis);
    } else {
      const analysisCacheEntry = analysisCache.get(analysisId);
      if (analysisCacheEntry != null) {
        setAnalysis(analysisCacheEntry);
        setStatus(Status.Loaded);
        setError(undefined);
      } else {
        setStatus(Status.InProgress);
        analysisClient.getAnalysis(analysisId).then(
          (analysis) => {
            setAnalysis(analysis);
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
  }, [analysisClient, analysisId, defaultAnalysis]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  useEffect(() => {
    // TODO only update if the active analysis has changed... or merge in the change!
    return analysisEventEmitter.onListUpdate((list) => {
      if (analysisId == null) return;
      const update = list.find((summary) => summary.analysisId === analysisId);
      if (update) {
        setAnalysis((analysis) => analysis && { ...analysis, ...update });
        const analysis = analysisCache.get(analysisId);
        if (analysis) {
          analysisCache.set(analysisId, { ...analysis, ...update });
        }
      }
    });
  }, [analysisId, loadAnalysis]);

  // Reactively save analysis when it has been modified
  useEffect(() => {
    const id = setTimeout(function deferredSave() {
      if (updateScheduled) {
        saveAnalysis();
        setUpdateScheduled(false);
      }
    }, 1000);
    return function cleanup() {
      clearTimeout(id);
    };
  }, [saveAnalysis, updateScheduled]);

  return {
    status,
    analysis,
    error,
    hasUnsavedChanges: updateScheduled,
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
    getVisualizations,
    getVisualization,
    getVisualizationAndComputation,
    deleteVisualization,
    addVisualization,
    updateVisualization,
  };
}

export function useAnalysisList(analysisClient: AnalysisClient) {
  // const analysisClient = useAnalysisClient();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const loadList = useCallback(() => {
    console.log('loading analyses list');
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

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    // TODO Merge in change!
    return analysisEventEmitter.onAnalysisUpdate(loadList);
  }, [loadList]);

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
        const analysis = analysisCache.get(id);
        if (analysis) {
          analysisCache.set(id, { ...analysis, ...patch });
        }
        analysisCache.delete(id);
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

  useEffect(() => {
    if (analyses) analysisEventEmitter.triggerListUpdate(analyses);
  }, [analyses]);

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

const analysisToNameLens =
  Lens.fromProp<NewAnalysis | Analysis>()('displayName');
const analysisToDescriptionLens =
  Lens.fromProp<NewAnalysis | Analysis>()('description');
const analysisToNotesLens = Lens.fromProp<NewAnalysis | Analysis>()('notes');
const analysisToIsPublicLens =
  Lens.fromProp<NewAnalysis | Analysis>()('isPublic');
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
  const oldNestedValue = nestedValueLens.get(analysis);
  const newNestedValue =
    typeof nestedValue === 'function'
      ? (nestedValue as (nestedValue: T) => T)(oldNestedValue)
      : nestedValue;

  if (oldNestedValue !== newNestedValue) {
    return nestedValueLens.set(newNestedValue)(analysis);
  }
  return analysis;
}
