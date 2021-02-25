import { useSession, useStudyRecord, useStudyMetadata } from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

interface Props {
  sessionId: string;
}
export function MapVeuSession(props: Props) {
  const { sessionId } = props;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const { session } = useSession(sessionId);
  if (session == null) return <div>No session found</div>;
  const entities = Array.from(
    preorder(studyMetadata.rootEntity, (e) => e.children ?? [])
  );
  return (
    <>
      <h2>Study: {studyRecord.displayName}</h2>
      <h3>Study details</h3>
      <dl>
        <dt>Entities</dt>
        <dd>
          <ul>
            {entities.map((e) => (
              <li>{safeHtml(e.displayName)}</li>
            ))}
          </ul>
        </dd>
      </dl>
      <h3>Session details</h3>
      <dl>
        {' '}
        <dt>Name</dt>
        <dd>{session?.name}</dd>
        <dt>Created</dt>
        <dd>{session.created}</dd>
      </dl>
    </>
  );
}
