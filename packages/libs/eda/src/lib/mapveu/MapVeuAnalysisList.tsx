import React, { useCallback } from 'react';
import { makeNewAnalysis, useStudyRecord } from '../core';
import { useRouteMatch, Link, useHistory } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AnalysisClient } from '../core/api/AnalysisClient';
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
      const analyses = await analysisStore.getAnalyses();
      return analyses.filter((analysis) => analysis.studyId === studyId);
    }, [studyId, analysisStore])
  );
  const { url } = useRouteMatch();
  const history = useHistory();
  const createAnalysis = useCallback(async () => {
    const { analysisId } = await analysisStore.createAnalysis(
      makeNewAnalysis(studyId)
    );
    history.push(`${url}/${analysisId}`);
  }, [analysisStore, history, studyId, url]);
  return (
    <>
      <h2>Study: {safeHtml(studyRecord.displayName)}</h2>
      <h3>Saved Analyses</h3>
      <div>
        <button className="btn" type="button" onClick={createAnalysis}>
          New Analysis
        </button>
      </div>
      {list.pending ? (
        <Loading />
      ) : list.value?.length === 0 ? (
        <em>You do not have any analyses for this study.</em>
      ) : (
        <ul>
          {list.value?.map((analysis) => (
            <li>
              <Link to={`${url}/${analysis.analysisId}`}>
                {safeHtml(analysis.displayName)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
