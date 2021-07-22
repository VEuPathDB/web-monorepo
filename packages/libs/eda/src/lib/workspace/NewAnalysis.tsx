import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
}

export function NewAnalysis(props: Props) {
  const { analysisClient: analysisStore, studyId } = props;
  const history = useHistory();
  useEffect(
    () =>
      Task.fromPromise(
        analysisStore.createAnalysis({
          name: 'Unnamed Analysis',
          studyId,
          filters: [],
          starredVariables: [],
          derivedVariables: [],
          visualizations: [],
          computations: [],
          variableUISettings: {},
        })
      ).run(({ id }) => {
        const newLocation = {
          ...history.location,
          pathname: `./${id}`,
        };
        history.push(newLocation);
      }),
    [analysisStore, history, studyId]
  );
  return <div style={{ fontSize: '3em' }}>Creating new analysis...</div>;
}
