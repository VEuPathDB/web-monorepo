import Path from 'path';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useRouteMatch, useHistory } from 'react-router-dom';
import {
  AnalysisState,
  Filter,
  makeNewAnalysis,
  NewAnalysis,
  Status,
  useAnalysisClient,
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
  const history = useHistory();
  const location = useLocation();
  const { url } = useRouteMatch();
  const createAnalysis = useCallback(
    async (
      newAnalysis: NewAnalysis,
      subPath: string = location.pathname.slice(url.length)
    ) => {
      const { id } = await analysisClient.createAnalysis(newAnalysis);
      const newLocation = {
        ...location,
        pathname: Path.resolve(url, '..', id + subPath),
      };
      history.replace(newLocation);
    },
    [analysisClient, history, location, url]
  );
  const saveAnalysis = useCallback(() => {
    return createAnalysis(analysis);
  }, [analysis, createAnalysis]);
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

  const analysisState = useMemo(
    (): AnalysisState => ({
      analysis,
      setDerivedVariables,
      setFilters,
      setName,
      setStarredVariables,
      setVariableUISettings: (
        variableUISettings: Record<string, VariableUISetting>
      ) => {
        setAnalysis((analysis) => ({ ...analysis, variableUISettings }));
      },
      setVisualizations,
      saveAnalysis,
      status: Status.Loaded,
      hasUnsavedChanges: true,
      canRedo: false,
      canUndo: false,
      undo: () => {},
      redo: () => {},
    }),
    [
      analysis,
      saveAnalysis,
      setDerivedVariables,
      setFilters,
      setName,
      setStarredVariables,
      setVisualizations,
    ]
  );
  return <AnalysisPanel analysisState={analysisState} />;
}
