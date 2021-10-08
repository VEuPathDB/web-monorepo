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
import { useConfiguredAnalysisClient } from '../core/hooks/analysisClient';
import { VariableDescriptor } from '../core/types/variable';
import { cx, findFirstVariable } from './Utils';
import {
  EDAWorkspaceNewAnalysis,
  EDAWorkspaceSavedAnalysis,
} from './EDAWorkspace';

interface Props {
  studyId: string;
  analysisId?: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
  userServiceUrl: string;
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
  const analysisClient = useConfiguredAnalysisClient(props.userServiceUrl);
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
        maybeVariableId ??
        (entity.variables.length !== 0 &&
          findFirstVariable(entity.variables)?.id);
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
        analysisClient={analysisClient}
        dataClient={dataClient}
        subsettingClient={subsettingClient}
        makeVariableLink={makeVariableLink}
      >
        {props.analysisId == null ? (
          <EDAWorkspaceNewAnalysis />
        ) : (
          <EDAWorkspaceSavedAnalysis analysisId={props.analysisId} />
        )}
      </EDAWorkspaceContainer>
    </RestrictedPage>
  );
}
