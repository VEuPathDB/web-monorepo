import { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Path from 'path';

import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

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
  const [error, setError] = useState<string | ImportAnalysisError | null>(null);

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
          /**
           * 'error' may be an Error object or a JSON string so let's
           * 1. "normalize" the error to be an Error object
           * 2. set the error
           *    - try to parse the error message as if it's JSON
           *    - if above fails, error will be the Error object's message
           */
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
    [user, dispatch]
  );

  return (
    <div>
      <h1>{error == null ? 'Importing Analysis...' : 'Import Unsuccessful'}</h1>
      {error && (
        <ErrorMessage error={error} user={user} handleLogin={handleClick} />
      )}
    </div>
  );
}

type ErrorMessageProps = {
  error: string | ImportAnalysisError | null;
  user?: User;
  handleLogin: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

function ErrorMessage({ error, user, handleLogin }: ErrorMessageProps) {
  if (!error) return null;
  if (typeof error === 'object') {
    if (error.status === 'forbidden') {
      return (
        <>
          <p>
            Unable to import this analysis. You do not have access to the study.
          </p>
          <p>
            {user === undefined || user.isGuest ? (
              <>
                <button className="link" onClick={handleLogin}>
                  Please login
                </button>{' '}
                and try again.
              </>
            ) : (
              <>Please request access from the owner of the study.</>
            )}
          </p>
        </>
      );
    } else {
      return (
        <pre>
          status: {error.status}; message: {error.message}
        </pre>
      );
    }
  } else {
    return <pre>{error}</pre>;
  }
}
