import React, { useCallback } from 'react';
import { useStudyRecord } from '../core';
import { useRouteMatch, Link, useHistory } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AnalysisClient } from '../core/api/analysis-api';
import { usePromise } from '../core/hooks/promise';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  studyId: string;
  analysisStore: AnalysisClient;
}

export function AnalysisList(props: Props) {
  const { analysisStore, studyId } = props;
  const studyRecord = useStudyRecord();
  const list = usePromise(
    useCallback(async () => {
      const studies = await analysisStore.getAnalysiss();
      return studies.filter((study) => study.id === studyId);
    }, [studyId, analysisStore])
  );
  const { url } = useRouteMatch();
  const history = useHistory();
  const createAnalysis = useCallback(async () => {
    const { id } = await analysisStore.createAnalysis({
      name: 'Unnamed analysis',
      studyId,
      visualizations: [],
      variableUISettings: {},
      derivedVariables: [],
      starredVariables: [],
      filters: [],
      computations: [],
    });
    history.push(`${url}/${id}`);
  }, [analysisStore, history, studyId, url]);
  return (
    <>
      <h2>Study: {studyRecord.displayName}</h2>
      <h3>Saved Analysiss</h3>
      <div>
        <button className="btn" type="button" onClick={createAnalysis}>
          New Analysis
        </button>
      </div>
      {list.pending ? (
        <Loading />
      ) : list.value?.length === 0 ? (
        <em>You do not have any analysiss for this study.</em>
      ) : (
        <ul>
          {list.value?.map((analysis) => (
            <li>
              <Link to={`${url}/${analysis.id}`}>
                {safeHtml(analysis.name)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
