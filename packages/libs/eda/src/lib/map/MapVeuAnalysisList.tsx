import React, { useCallback } from 'react';
import { makeNewAnalysis, useAnalysisList, useStudyRecord } from '../core';
import { useRouteMatch, Link, useHistory } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { AnalysisClient } from '../core/api/AnalysisClient';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { createComputation } from '../core/components/computations/Utils';

interface Props {
  studyId: string;
  analysisStore: AnalysisClient;
  singleAppMode?: string;
}

export function AnalysisList(props: Props) {
  const { analysisStore, studyId, singleAppMode } = props;
  const studyRecord = useStudyRecord();
  const { analyses } = useAnalysisList(analysisStore);
  const list = analyses?.filter((analysis) => analysis.studyId === studyId);
  const { url } = useRouteMatch();
  const history = useHistory();
  const createAnalysis = useCallback(async () => {
    // FIXME Only create computation if singleAppMode is defined
    // If using singleAppMode, create a computation object that will be used in our default analysis.
    const computation = singleAppMode
      ? createComputation(
          singleAppMode,
          undefined,
          [],
          [],
          undefined,
          'Unnamed computation'
        )
      : undefined;
    const { analysisId } = await analysisStore.createAnalysis(
      makeNewAnalysis(studyId, computation)
    );
    history.push(`${url}/${analysisId}`);
  }, [analysisStore, history, singleAppMode, studyId, url]);
  return (
    <>
      <h2>Study: {safeHtml(studyRecord.displayName)}</h2>
      <h3>Saved Analyses</h3>
      <div>
        <button className="btn" type="button" onClick={createAnalysis}>
          New Analysis
        </button>
      </div>
      {list == null ? (
        <Loading />
      ) : list.length === 0 ? (
        <em>You do not have any analyses for this study.</em>
      ) : (
        <ul>
          {list.map((analysis) => (
            <li key={analysis.analysisId}>
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
