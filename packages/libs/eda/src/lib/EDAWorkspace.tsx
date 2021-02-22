import React from 'react';
import { EDAWorkspaceContainer } from '@veupathdb/eda-workspace-core';
import { SubsettingClient } from '@veupathdb/eda-workspace-core/lib/api/eda-api';
import { EDASession } from './EDASession';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { mockSessionStore } from './Mocks';
import { cx } from './Utils';

interface Props {
  studyId: string;
  sessionId: string;
  edaServiceUrl: string;
}
export function EDAWorkspace(props: Props) {
  const subsettingClient: SubsettingClient = new (class extends SubsettingClient {
    constructor() {
      super({ baseUrl: props.edaServiceUrl });
    }
    async getStudyMetadata() {
      return super.getStudyMetadata('GEMSCC0002-1');
    }
  })();

  return (
    <EDAWorkspaceContainer
      sessionId={props.sessionId}
      studyId={props.studyId}
      className={cx()}
      sessionClient={mockSessionStore}
      subsettingClient={subsettingClient}
    >
      <EDAWorkspaceHeading />
      <EDASession sessionId={props.sessionId} />
    </EDAWorkspaceContainer>
  );
}
