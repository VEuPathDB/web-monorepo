import { FetchClientError } from '@veupathdb/http-utils';
import { AnalysisState } from '../hooks/analysis';
import { Link } from 'react-router-dom';
import * as Path from 'path';

interface Props {
  error: AnalysisState['error'];
  baseAnalysisPath: string;
}

export function AnalysisError(props: Props) {
  const { error, baseAnalysisPath } = props;
  const myAnalysesPath = Path.resolve(baseAnalysisPath, '../..');
  const newAnalysisPath = Path.resolve(baseAnalysisPath, '../new');
  return error instanceof FetchClientError && error.statusCode === 404 ? (
    <>
      <h1>Analysis Not Found</h1>
      <div css={{ fontSize: '1.2em' }}>
        <p>
          The requested analysis does not exist. You might want to try one of
          the following options.
        </p>
        <ul>
          <li>
            <Link to={myAnalysesPath}>See your saved analyses.</Link>
          </li>
          <li>
            <Link to={newAnalysisPath}>Create a new analysis.</Link>
          </li>
        </ul>
      </div>
    </>
  ) : error instanceof FetchClientError && error.statusCode === 403 ? (
    <>
      <h1>Access Denied</h1>
      <div css={{ fontSize: '1.2em' }}>
        <p>
          The requested analysis belongs to a different user. You might want to
          try one of the following options.
        </p>
        <ul>
          <li>
            If this analysis was shared with you, ask the owner to use the{' '}
            <strong>Share</strong> button to generate a share link.
          </li>
          <li>
            <Link to={myAnalysesPath}>See your saved analyses.</Link>
          </li>
          <li>
            <Link to={newAnalysisPath}>Create a new analysis.</Link>
          </li>
        </ul>
      </div>
    </>
  ) : (
    <>
      <h1>Analysis Loading Error</h1>
      <div css={{ fontSize: '1.2em' }}>
        <p>The analysis could not be loaded.</p>
        <p>
          Error message:{' '}
          <code>{error instanceof Error ? error.message : String(error)}</code>
        </p>
      </div>
    </>
  );
}
