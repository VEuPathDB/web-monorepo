import React, { useCallback, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import { EDAWorkspaceContainer, SubsettingClient } from '../core';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { mockSessionStore } from './Mocks';
import { SessionPanel } from './SessionPanel';
import { cx } from './Utils';

interface Props {
  studyId: string;
  sessionId: string;
  edaServiceUrl: string;
}
export function WorkspaceContainer(props: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = useMemo(
    () =>
      new SubsettingClient({
        baseUrl: props.edaServiceUrl,
      }),
    [props.edaServiceUrl]
  );
  const makeVariableLink = useCallback(
    (entityId: string, variableId: string) =>
      `${url}/variables/${entityId}/${variableId}`,
    [url]
  );
  return (
    <EDAWorkspaceContainer
      sessionId={props.sessionId}
      studyId={props.studyId}
      className={cx()}
      sessionClient={mockSessionStore}
      subsettingClient={subsettingClient}
      makeVariableLink={makeVariableLink}
    >
      <EDAWorkspaceHeading />
      <SessionPanel sessionId={props.sessionId} />
    </EDAWorkspaceContainer>
  );
}
