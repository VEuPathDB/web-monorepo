import React, { useCallback } from 'react';
import { useStudyRecord } from '../core';
import { useRouteMatch, Link, useHistory } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SessionClient } from '../core/api/session-api';
import { usePromise } from '../core/hooks/promise';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  studyId: string;
  sessionStore: SessionClient;
}

export function SessionList(props: Props) {
  const { sessionStore, studyId } = props;
  const studyRecord = useStudyRecord();
  const list = usePromise(async () => {
    const studies = await sessionStore.getSessions();
    return studies.filter((study) => study.id === studyId);
  }, [studyId, sessionStore]);
  const { url } = useRouteMatch();
  const history = useHistory();
  const createSession = useCallback(async () => {
    const { id } = await sessionStore.createSession({
      name: 'Unnamed session',
      studyId,
      visualizations: [],
      variableUISettings: {},
      derivedVariables: [],
      starredVariables: [],
      filters: [],
    });
    history.push(`${url}/${id}`);
  }, [sessionStore, history, studyId, url]);
  return (
    <>
      <h2>Study: {studyRecord.displayName}</h2>
      <h3>Saved Sessions</h3>
      <div>
        <button className="btn" type="button" onClick={createSession}>
          New Session
        </button>
      </div>
      {list.pending ? (
        <Loading />
      ) : list.value?.length === 0 ? (
        <em>You do not have any sessions for this study.</em>
      ) : (
        <ul>
          {list.value?.map((session) => (
            <li>
              <Link to={`${url}/${session.id}`}>{safeHtml(session.name)}</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
