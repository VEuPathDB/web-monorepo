import React from 'react';
import { EDAWorkspaceContainer } from '@veupathdb/eda-workspace-core';
import { EdaClient } from '@veupathdb/eda-workspace-core/lib/api/eda-api';
import { EDAAnalysis } from './EDAAnalysis';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { mockAnalysisStore } from './Mocks';
import { cx } from './Utils';

interface Props {
  studyId: string;
  analysisId: string;
  edaServiceUrl: string;
}
export function EDAWorkspace(props: Props) {
  const edaClient: EdaClient = new (class extends EdaClient {
    constructor() {
      super({ baseUrl: props.edaServiceUrl });
    }
    async getStudyMetadata() {
      return super.getStudyMetadata('GEMSCC0002-1');
    }
  })();

  return (
    <EDAWorkspaceContainer
      analysisId={props.analysisId}
      studyId={props.studyId}
      className={cx()}
      analysisStore={mockAnalysisStore}
      edaClient={edaClient}
    >
      <EDAWorkspaceHeading />
      <EDAAnalysis />
    </EDAWorkspaceContainer>
  );
}
