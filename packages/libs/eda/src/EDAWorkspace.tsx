import React from 'react';
import { EDAWorkspaceContainer } from 'ebrc-client/modules/eda-workspace-core/components/EDAWorkspaceContainer';
import { EDAAnalysis } from './EDAAnalysis';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { mockAnalysisStore, mockStudyMetadataStore } from './Mocks';
import { cx } from './Utils';

interface Props {
  studyId: string;
  analysisId: string;
}
export function EDAWorkspace(props: Props) {
  return (
    <EDAWorkspaceContainer
      analysisId={props.analysisId}
      studyId={props.studyId}
      className={cx()}
      analysisStore={mockAnalysisStore}
      studyMetadataStore={mockStudyMetadataStore}
    >
      <EDAWorkspaceHeading/>
      <EDAAnalysis/>
    </EDAWorkspaceContainer>
  );
}
