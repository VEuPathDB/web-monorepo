import { Lens } from 'monocle-ts';
import Path from 'path';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useRouteMatch, useHistory } from 'react-router-dom';
import {
  AnalysisState,
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
  const analysisState = useMemo(
    (): AnalysisState => ({
      analysis,
      setDerivedVariables,
      setFilters,
      setName,
      setDescription,
      setIsPublic,
      setStarredVariables,
      setVariableUISettings,
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
      setDescription,
      setIsPublic,
      setStarredVariables,
      setVariableUISettings,
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
const analysisToDescriptionLens = Lens.fromProp<NewAnalysis>()('description');
const analysisToIsPublicLens = Lens.fromProp<NewAnalysis>()('isPublic');
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
