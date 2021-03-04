import React, { useCallback, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import {
  EDAWorkspaceContainer,
  SubsettingClient,
  DataClient,
  EntityDiagram,
} from '../core';
import { EDASession } from './EDASession';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { mockSessionStore } from './Mocks';
import { cx } from './Utils';

interface Props {
  studyId: string;
  sessionId: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
}
export function EDAWorkspace(props: Props) {
  const { url } = useRouteMatch();
  const subsettingClient: SubsettingClient = useMemo(
    () =>
      new (class extends SubsettingClient {
        async getStudyMetadata() {
          return super.getStudyMetadata('GEMSCC0002-1');
        }
      })({ baseUrl: props.subsettingServiceUrl }),
    [props.subsettingServiceUrl]
  );

  const dataClient: DataClient = useMemo(
    () => new DataClient({ baseUrl: props.dataServiceUrl }),
    [props.dataServiceUrl]
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
      dataClient={dataClient}
      makeVariableLink={makeVariableLink}
    >
      <EDAWorkspaceHeading />
      <EntityDiagram
        studyId={props.studyId}
        sessionId={props.sessionId}
        subsettingClient={subsettingClient}
        expanded={true}
        orientation="horizontal"
      />
      <EDASession sessionId={props.sessionId} />
    </EDAWorkspaceContainer>
  );
}
