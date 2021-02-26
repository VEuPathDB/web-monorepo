import * as React from 'react';
import { EDASessionListContainer } from '../core';
import { SubsettingClient } from '../core/api/eda-api';
import { mockSessionStore } from './Mocks';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { SessionList } from './SessionList';
import { cx } from './Utils';
import { useMemo } from 'react';

export interface Props {
  studyId: string;
  edaServiceUrl: string;
}

export function EDASessionList(props: Props) {
  const subsettingClient = useMemo(
    () =>
      new SubsettingClient({
        baseUrl: props.edaServiceUrl,
      }),
    [props.edaServiceUrl]
  );
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
