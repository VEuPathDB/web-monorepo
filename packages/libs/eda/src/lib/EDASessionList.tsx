import * as React from 'react';
import { EDASessionListContainer } from '@veupathdb/eda-workspace-core';
import { mockSessionStore, mockStudyMetadataStore } from './Mocks';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { SessionList } from './SessionList';
import { cx } from './Utils';

export interface Props {
  studyId: string;
}

export function EDASessionList(props: Props) {
  return (
    <EDASessionListContainer
      studyId={props.studyId}
      className={cx()}
      sessionStore={mockSessionStore}
      studyMetadataStore={mockStudyMetadataStore}
    >
      <EDAWorkspaceHeading />
      <SessionList sessionStore={mockSessionStore} />
    </EDASessionListContainer>
  );
}
