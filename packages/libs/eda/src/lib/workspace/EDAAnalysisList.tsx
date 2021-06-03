import React, { useMemo } from 'react';
import { EDAAnalysisListContainer } from '../core';
import { SubsettingClient } from '../core/api/subsetting-api';
import { DataClient } from '../core/api/data-api';
import { mockAnalysisStore } from './Mocks';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisList } from './AnalysisList';
import { cx } from './Utils';

export interface Props {
  studyId: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
}

export function EDAAnalysisList(props: Props) {
  const subsettingClient: SubsettingClient = useMemo(
    () => new SubsettingClient({ baseUrl: props.subsettingServiceUrl }),
    [props.subsettingServiceUrl]
  );

  const dataClient: DataClient = useMemo(
    () => new DataClient({ baseUrl: props.dataServiceUrl }),
    [props.dataServiceUrl]
  );

  return (
    <EDAAnalysisListContainer
      studyId={props.studyId}
      subsettingClient={subsettingClient}
      dataClient={dataClient}
      className={cx()}
      analysisClient={mockAnalysisStore}
    >
      <EDAWorkspaceHeading />
      <AnalysisList analysisStore={mockAnalysisStore} />
    </EDAAnalysisListContainer>
  );
}
