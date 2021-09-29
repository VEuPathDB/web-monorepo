import { useCallback, useMemo, useRef, useState } from 'react';
import { Lens } from 'monocle-ts';
import Path from 'path';
import { useLocation, useRouteMatch, useHistory } from 'react-router-dom';
import {
  AnalysisState,
  DataTableSettings,
  makeNewAnalysis,
  NewAnalysis,
  Status,
  useAnalysisClient,
  usePreloadAnalysis,
  useStudyRecord,
  VariableUISetting,
} from '../core';
import { Computation } from '../core/types/visualization';
import { AnalysisPanel } from './AnalysisPanel';

export function NewAnalysisPage() {
  const studyRecord = useStudyRecord();
  const [analysis, setAnalysis] = useState(
    makeNewAnalysis(studyRecord.id[0].value)
  );
  const analysisClient = useAnalysisClient();
  const preloadAnalysis = usePreloadAnalysis();
  const history = useHistory();
  const location = useLocation();
  const { url } = useRouteMatch();
  const creatingAnalysis = useRef(false);

  const createAnalysis = useCallback(
    async (
      newAnalysis: NewAnalysis,
      subPath: string = location.pathname.slice(url.length)
    ) => {
      if (!creatingAnalysis.current) {
        creatingAnalysis.current = true;
        const { analysisId } = await analysisClient.createAnalysis(newAnalysis);
        await preloadAnalysis(analysisId);
        const newLocation = {
          ...location,
          pathname: Path.resolve(url, '..', analysisId + subPath),
        };
        history.replace(newLocation);
      }
    },
    [analysisClient, history, location, preloadAnalysis, url]
  );

  const saveAnalysis = useCallback(() => {
    return createAnalysis(analysis);
  }, [analysis, createAnalysis]);

  const copyAnalysis = useCallback(() => {
    throw new Error('Cannot copy an unsaved analysis.');
  }, []);

  const deleteAnalysis = useCallback(() => {
    throw new Error('Cannot delete an unsaved analysis.');
  }, []);

  // START HERE

  const setName = useSetter(analysisToNameLens, analysis, createAnalysis);
  const setFilters = useSetter(analysisToFiltersLens, analysis, createAnalysis);
  const setStarredVariables = useSetter(
    analysisToStarredVariablesLens,
    analysis,
    createAnalysis
  );
  const setDerivedVariables = useCallback(() => {}, []);
  const setVariableUISettings = useCallback(
    (
      nextVariableUISettings:
        | Record<string, VariableUISetting>
        | ((
            value: Record<string, VariableUISetting>
          ) => Record<string, VariableUISetting>)
    ) => {
      const variableUISettings =
        typeof nextVariableUISettings === 'function'
          ? nextVariableUISettings(analysis.descriptor.subset.uiSettings)
          : nextVariableUISettings;

      setAnalysis(analysisToVariableUISettingsLens.set(variableUISettings));
    },
    [analysis.descriptor.subset.uiSettings]
  );
  const setComputations = useSetter(
    analysisToComputationsLens,
    analysis,
    createAnalysis,
    useCallback(
      (computations: Computation[]) => {
        const computationWithNewVisualization = computations.find(
          ({ visualizations }) => visualizations.length > 0
        );

        const newVisualizationId =
          computationWithNewVisualization?.visualizations[0].visualizationId;

        if (newVisualizationId == null) {
          return undefined;
        }

        return Path.join(
          location.pathname.slice(url.length),
          '..',
          newVisualizationId
        );
      },
      [location.pathname, url.length]
    )
  );

  const setDataTableSettings = useCallback(
    (
      dataTableSettings:
        | DataTableSettings
        | ((dataTableSettings: DataTableSettings) => DataTableSettings)
    ) => {
      createAnalysis({
        ...analysis,
        descriptor: {
          ...analysis.descriptor,
          dataTableSettings:
            typeof dataTableSettings === 'function'
              ? dataTableSettings(analysis.descriptor.dataTableSettings)
              : dataTableSettings,
        },
      });
    },
    [analysis, createAnalysis]
  );

  const analysisState = useMemo(
    (): AnalysisState => ({
      analysis,
      setDerivedVariables,
      setFilters,
      setName,
      setStarredVariables,
      setVariableUISettings,
      setDataTableSettings,
      setComputations,
      saveAnalysis,
      copyAnalysis,
      deleteAnalysis,
      status: Status.Loaded,
      hasUnsavedChanges: true,
      canRedo: false,
      canUndo: false,
      undo: () => {},
      redo: () => {},
    }),
    [
      analysis,
      copyAnalysis,
      deleteAnalysis,
      saveAnalysis,
      setDerivedVariables,
      setFilters,
      setName,
      setStarredVariables,
      setVariableUISettings,
      setDataTableSettings,
      setComputations,
    ]
  );
  return <AnalysisPanel analysisState={analysisState} hideCopyAndSave />;
}

function useSetter<T>(
  nestedValueLens: Lens<NewAnalysis, T>,
  analysis: NewAnalysis,
  createAnalysis: (analysis: NewAnalysis, subPath?: string) => void,
  getSubPath?: (value: T) => string | undefined
) {
  return useCallback(
    (nestedValue: T | ((nestedValue: T) => T)) => {
      const nextNestedValue =
        typeof nestedValue === 'function'
          ? (nestedValue as (nestedValue: T) => T)(
              nestedValueLens.get(analysis)
            )
          : nestedValue;
      const nextAnalysis = nestedValueLens.set(nextNestedValue)(analysis);
      createAnalysis(nextAnalysis, getSubPath && getSubPath(nextNestedValue));
    },
    [analysis, createAnalysis, getSubPath, nestedValueLens]
  );
}

const analysisToNameLens = Lens.fromProp<NewAnalysis>()('displayName');
const analysisToFiltersLens = Lens.fromPath<NewAnalysis>()([
  'descriptor',
  'subset',
  'descriptor',
]);
const analysisToComputationsLens = Lens.fromPath<NewAnalysis>()([
  'descriptor',
  'computations',
]);
const analysisToStarredVariablesLens = Lens.fromPath<NewAnalysis>()([
  'descriptor',
  'starredVariables',
]);
const analysisToVariableUISettingsLens = Lens.fromPath<NewAnalysis>()([
  'descriptor',
  'subset',
  'uiSettings',
]);
