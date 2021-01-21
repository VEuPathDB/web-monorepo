import * as React from 'react';
import { EDAAnalysisListContainer } from '@veupathdb/eda-workspace-core';
import { mockAnalysisStore, mockStudyMetadataStore } from './Mocks';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisList } from './AnalysisList';
import { cx } from './Utils';

export interface Props {
  studyId: string;
}

export function EDAAnalysisList(props: Props) {
  return (
    <EDAAnalysisListContainer
      studyId={props.studyId}
      className={cx()}
      analysisStore={mockAnalysisStore}
      studyMetadataStore={mockStudyMetadataStore}
    >
      <EDAWorkspaceHeading />
      <AnalysisList analysisStore={mockAnalysisStore} />
    </EDAAnalysisListContainer>
  );
}
