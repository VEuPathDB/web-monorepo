import { find } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { RestrictedPage } from '@veupathdb/web-common/lib/App/DataRestriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import React, { useCallback, useMemo } from 'react';
import { useRouteMatch } from 'react-router';
import {
  DataClient,
  EDAWorkspaceContainer,
  StudyMetadata,
  SubsettingClient,
} from '../core';
import { VariableDescriptor } from '../core/types/variable';
import {
  AnalysisEDAWorkspaceHeading,
  EDAWorkspaceHeading,
} from './EDAWorkspaceHeading';
import { mockAnalysisStore } from './Mocks';
import { cx, findFirstVariable } from './Utils';
import { SavedAnalysis } from './SavedAnalysis';
import { NewAnalysisPage } from './NewAnalysis';

interface Props {
  studyId: string;
  analysisId?: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
}
export function WorkspaceContainer(props: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = useMemo(
    () => new SubsettingClient({ baseUrl: props.subsettingServiceUrl }),
    [props.subsettingServiceUrl]
  );
  const dataClient = useMemo(
    () => new DataClient({ baseUrl: props.dataServiceUrl }),
    [props.dataServiceUrl]
  );
  const makeVariableLink = useCallback(
    (
      {
        entityId: maybeEntityId,
        variableId: maybeVariableId,
      }: Partial<VariableDescriptor>,
      studyMetadata: StudyMetadata
    ) => {
      const entityId = maybeEntityId ?? studyMetadata.rootEntity.id;
      const entity = find(
        (entity) => entity.id === entityId,
        preorder(studyMetadata.rootEntity, (e) => e.children ?? [])
      );
      const variableId =
        maybeVariableId ?? findFirstVariable(entity.variables, entityId)?.id;
      return entityId && variableId
        ? `${url}/variables/${entityId}/${variableId}`
        : entityId
        ? `${url}/variables/${entityId}`
        : `${url}/variables`;
    },
    [url]
  );
  const approvalStatus = useApprovalStatus(props.studyId, 'analysis');

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <EDAWorkspaceContainer
        studyId={props.studyId}
        className={cx()}
        analysisClient={mockAnalysisStore}
        dataClient={dataClient}
        subsettingClient={subsettingClient}
        makeVariableLink={makeVariableLink}
      >
        {props.analysisId == null ? (
          <EDAWorkspaceHeading />
        ) : (
          <AnalysisEDAWorkspaceHeading analysisId={props.analysisId} />
        )}
        {props.analysisId == null ? (
          <NewAnalysisPage />
        ) : (
          <SavedAnalysis analysisId={props.analysisId} />
        )}
      </EDAWorkspaceContainer>
    </RestrictedPage>
  );
}
