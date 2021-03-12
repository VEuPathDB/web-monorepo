import React, { useCallback, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import {
  DataClient,
  EDAWorkspaceContainer,
  EntityDiagram,
  SubsettingClient,
} from '../core';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { mockSessionStore } from './Mocks';
import { SessionPanel } from './SessionPanel';
import { cx } from './Utils';

interface Props {
  studyId: string;
  sessionId: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
}
export function WorkspaceContainer(props: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = useMemo(
    () => new SubsettingClient({ baseUrl: props.subsettingServiceUrl }),
    [props.subsettingServiceUrl]
  );
  const dataClient = useMemo(
    () => new DataClient({ baseUrl: props.subsettingServiceUrl }),
    [props.subsettingServiceUrl]
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
      dataClient={dataClient}
      subsettingClient={subsettingClient}
      makeVariableLink={makeVariableLink}
    >
      <EDAWorkspaceHeading />
      <EntityDiagram
        sessionId={props.sessionId}
        expanded={true}
        orientation="horizontal"
      />
      <SessionPanel sessionId={props.sessionId} />
    </EDAWorkspaceContainer>
  );
}
