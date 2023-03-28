import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Path from 'path';

import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

interface Props {
  analysisClient: AnalysisClient;
  analysisId: string;
}

type ImportAnalysisError = {
  status: string;
  message: string;
};

export function ImportAnalysis({ analysisClient, analysisId }: Props) {
  const history = useHistory();
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const dispatch = useDispatch();
  const [error, setError] =
    useState<string | ImportAnalysisError | undefined>();

  useSetDocumentTitle(
    error == null ? 'Importing Analysis' : 'Import Unsuccessful'
  );

  useEffect(() => {
    return Task.fromPromise(() => analysisClient.importAnalysis(analysisId))
      .chain(({ analysisId: analysisCopyId }) =>
        Task.fromPromise(() => analysisClient.getAnalysis(analysisCopyId)).map(
          ({ studyId }) => ({
            analysisCopyId,
            studyId,
          })
        )
      )
      .run(
        ({ analysisCopyId, studyId }) => {
          const newLocation = {
            ...history.location,
            pathname: Path.join(
              history.location.pathname,
              '../..',
              studyId,
              analysisCopyId
            ),
          };
          history.replace(newLocation);
        },
        (error) => {
          const enforcedErrorObject =
            error instanceof Error ? error : new Error(String(error));
          const errorMessageList = enforcedErrorObject.message.split('\n');
          try {
            setError(JSON.parse(errorMessageList[1]));
          } catch {
            setError(enforcedErrorObject.message);
          }
        }
      );
  }, [analysisClient, history, analysisId]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (user === undefined || user.isGuest) {
        dispatch(showLoginForm());
      }
    },
    [history, user, dispatch]
  );

  const errorMessage =
    error && typeof error === 'object' ? (
      error.status === 'forbidden' ? (
        <>
          <p>
            Unable to import this analysis. You do not have access to the study.
          </p>
          <p>
            {user === undefined || user.isGuest ? (
              <>
                <button className="link" onClick={handleClick}>
                  Please login
                </button>{' '}
                or{' '}
              </>
            ) : (
              <>Please</>
            )}{' '}
            request access from the owner of the study.
          </p>
        </>
      ) : (
        <pre>
          status: {error.status}; message: {error.message}
        </pre>
      )
    ) : (
      <pre>{error}</pre>
    );

  return (
    <div>
      <h1>{error == null ? 'Importing Analysis...' : 'Import Unsuccessful'}</h1>
      {errorMessage}
    </div>
  );
}
