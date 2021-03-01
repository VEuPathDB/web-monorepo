import React, { useMemo } from 'react';
import { EDASessionListContainer } from '../core';
import { SubsettingClient } from '../core/api/subsetting-api';
import { DataClient } from '../core/api/data-service';
import { mockSessionStore } from './Mocks';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { SessionList } from './SessionList';
import { cx } from './Utils';

export interface Props {
  studyId: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
}

export function EDASessionList(props: Props) {
  const subsettingClient: SubsettingClient = useMemo(
    () => new SubsettingClient({ baseUrl: props.subsettingServiceUrl }),
    [props.subsettingServiceUrl]
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
