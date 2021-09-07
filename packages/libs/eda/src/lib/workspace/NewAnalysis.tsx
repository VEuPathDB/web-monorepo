import Path from 'path';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useRouteMatch, useHistory } from 'react-router-dom';
import {
  AnalysisState,
  DataTableSettings,
  Filter,
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

  const setName = useCallback(
    (name: string) => {
      createAnalysis({ ...analysis, name });
    },
    [analysis, createAnalysis]
  );
  const setFilters = useCallback(
    (filters: Filter[]) => {
      createAnalysis({ ...analysis, filters });
    },
    [analysis, createAnalysis]
  );
  const setStarredVariables = useCallback(
    (starredVariables: string[]) => {
      createAnalysis({ ...analysis, starredVariables });
    },
    [analysis, createAnalysis]
  );
  const setDerivedVariables = useCallback(() => {}, []);
  const setVariableUISettings = useCallback(
    (variableUISettings: Record<string, VariableUISetting>) => {
      setAnalysis((analysis) => ({ ...analysis, variableUISettings }));
    },
    []
  );
  const setVisualizations = useCallback(
    (visualizations: Visualization[]) => {
      createAnalysis(
        { ...analysis, visualizations },
        Path.resolve(
          location.pathname.slice(url.length),
          '..',
          visualizations[0].id
        )
      );
    },
    [analysis, createAnalysis, location.pathname, url.length]
  );

  const setDataTableSettings = useCallback(
    (dataTableSettings: DataTableSettings) => {
      createAnalysis({ ...analysis, dataTableSettings });
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
      setVisualizations,
      setDataTableSettings,
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
      setDataTableSettings,
    ]
  );
  return <AnalysisPanel analysisState={analysisState} hideCopyAndSave />;
}
