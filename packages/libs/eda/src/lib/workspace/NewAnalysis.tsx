import Path from 'path';
import React, { useCallback, useMemo, useState } from 'react';
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
import { AnalysisPanel } from './AnalysisPanel';
import { Visualization } from '../core/types/visualization';

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
  const createAnalysis = useCallback(
    async (
      newAnalysis: NewAnalysis,
      subPath: string = location.pathname.slice(url.length)
    ) => {
      const { id } = await analysisClient.createAnalysis(newAnalysis);
      await preloadAnalysis(id);
      const newLocation = {
        ...location,
        pathname: Path.resolve(url, '..', id + subPath),
      };
      history.replace(newLocation);
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
  const setName = useSetter('name', analysis, createAnalysis);
  const setFilters = useSetter('filters', analysis, createAnalysis);
  const setStarredVariables = useSetter(
    'starredVariables',
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
          ? nextVariableUISettings(analysis.variableUISettings)
          : nextVariableUISettings;
      setAnalysis((analysis) => ({ ...analysis, variableUISettings }));
    },
    [analysis.variableUISettings]
  );
  const setVisualizations = useSetter(
    'visualizations',
    analysis,
    createAnalysis,
    useCallback(
      (visualizations: Visualization[]) =>
        Path.join(
          location.pathname.slice(url.length),
          '..',
          visualizations[0].id
        ),
      [location.pathname, url.length]
    )
  );
  const analysisState = useMemo(
    (): AnalysisState => ({
      analysis,
      setDerivedVariables,
      setFilters,
      setName,
      setStarredVariables,
      setVariableUISettings,
      setVisualizations,
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
      setVisualizations,
    ]
  );
  return <AnalysisPanel analysisState={analysisState} hideCopyAndSave />;
}

function useSetter<T extends keyof NewAnalysis>(
  property: T,
  analysis: NewAnalysis,
  createAnalysis: (analysis: NewAnalysis, subPath?: string) => void,
  getSubPath?: (value: NewAnalysis[T]) => string
) {
  return useCallback(
    (value: NewAnalysis[T] | ((value: NewAnalysis[T]) => NewAnalysis[T])) => {
      const nextValue =
        typeof value === 'function' ? value(analysis[property]) : value;
      const nextAnalysis = {
        ...analysis,
        [property]: nextValue,
      };
      createAnalysis(nextAnalysis, getSubPath && getSubPath(nextValue));
    },
    [analysis, createAnalysis, getSubPath, property]
  );
}
