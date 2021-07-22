import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
}

export function NewAnalysis(props: Props) {
  const { analysisClient: analysisStore, studyId } = props;
  const history = useHistory();
  useEffect(() => {
    let cancelled = false;
    analysisStore
      .createAnalysis({
        name: 'Unnamed Analysis',
        studyId,
        filters: [],
        starredVariables: [],
        derivedVariables: [],
        visualizations: [],
        computations: [],
        variableUISettings: {},
      })
      .then(({ id }) => {
        if (!cancelled) {
          const newLocation = {
            ...history.location,
            pathname: `./${id}`,
          };
          history.push(newLocation);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [analysisStore, history, studyId]);
  return <div style={{ fontSize: '3em' }}>Creating new analysis...</div>;
}
