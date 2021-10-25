import { find } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import React, { useCallback } from 'react';
import { useRouteMatch } from 'react-router';
import { EDAWorkspaceContainer, StudyMetadata } from '../core';
import {
  useConfiguredAnalysisClient,
  useConfiguredDataClient,
  useConfiguredSubsettingClient,
} from '../core/hooks/client';
import { VariableDescriptor } from '../core/types/variable';
import { EDAWorkspace } from './EDAWorkspace';
import { cx, findFirstVariable } from './Utils';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    '& .MuiTypography-root': {
      textTransform: 'none',
    },
  },
});

interface Props {
  studyId: string;
  analysisId?: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
  userServiceUrl: string;
}
export function WorkspaceContainer(props: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = useConfiguredSubsettingClient(
    props.subsettingServiceUrl
  );
  const dataClient = useConfiguredDataClient(props.dataServiceUrl);
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
  const classes = useStyles();

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <EDAWorkspaceContainer
        studyId={props.studyId}
        className={`${cx()} ${classes.root}`}
        analysisClient={analysisClient}
        dataClient={dataClient}
        subsettingClient={subsettingClient}
        makeVariableLink={makeVariableLink}
      >
        <EDAWorkspace studyId={props.studyId} analysisId={props.analysisId} />
      </EDAWorkspaceContainer>
    </RestrictedPage>
  );
}
