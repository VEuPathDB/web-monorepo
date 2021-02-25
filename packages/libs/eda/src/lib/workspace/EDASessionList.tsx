import * as React from 'react';
import { EDASessionListContainer } from '@veupathdb/eda-workspace-core';
import { mockSessionStore } from './Mocks';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { SessionList } from './SessionList';
import { cx } from './Utils';
import { SubsettingClient } from '@veupathdb/eda-workspace-core/lib/api/eda-api';

export interface Props {
  studyId: string;
  edaServiceUrl: string;
}

export function EDASessionList(props: Props) {
  const subsettingClient: SubsettingClient = new (class extends SubsettingClient {
    constructor() {
      super({ baseUrl: props.edaServiceUrl });
    }
    async getStudyMetadata() {
      return super.getStudyMetadata('GEMSCC0002-1');
    }
  })();
  return (
    <EDASessionListContainer
      studyId={props.studyId}
      subsettingClient={subsettingClient}
      className={cx()}
      sessionClient={mockSessionStore}
    >
      <EDAWorkspaceHeading />
      <SessionList sessionStore={mockSessionStore} />
    </EDASessionListContainer>
  );
}
