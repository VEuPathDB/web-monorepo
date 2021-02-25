import React, { useMemo } from 'react';
import { EDASessionListContainer } from '../core';
import { SubsettingClient } from '../core/api/eda-api';
import { DataClient } from '../core/api/data-service';
import { mockSessionStore } from './Mocks';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { SessionList } from './SessionList';
import { cx } from './Utils';

export interface Props {
  studyId: string;
  edaServiceUrl: string;
  dataServiceUrl: string;
}

export function EDASessionList(props: Props) {
  const subsettingClient: SubsettingClient = useMemo(
    () =>
      new (class extends SubsettingClient {
        async getStudyMetadata() {
          return super.getStudyMetadata('GEMSCC0002-1');
        }
      })({ baseUrl: props.edaServiceUrl }),
    [props.edaServiceUrl]
  );

  const dataClient: DataClient = useMemo(
    () => new DataClient({ baseUrl: props.dataServiceUrl }),
    [props.dataServiceUrl]
  );

  return (
    <EDASessionListContainer
      studyId={props.studyId}
      subsettingClient={subsettingClient}
      dataClient={dataClient}
      className={cx()}
      sessionClient={mockSessionStore}
    >
      <EDAWorkspaceHeading />
      <SessionList sessionStore={mockSessionStore} />
    </EDASessionListContainer>
  );
}
