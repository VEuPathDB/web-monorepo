import { ReactNode, useCallback } from 'react';
import { useRouteMatch } from 'react-router';

import { find } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { EDAWorkspaceContainer, StudyMetadata } from '../core';
import {
  useConfiguredAnalysisClient,
  useConfiguredDataClient,
  useConfiguredSubsettingClient,
} from '../core/hooks/client';
import { VariableDescriptor } from '../core/types/variable';
import { EDAWorkspace } from './EDAWorkspace';
import { cx, findFirstVariable } from './Utils';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  workspace: {
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
  children: ReactNode;
}

/** Allows a user to create a new analysis or edit an existing one. */
export function WorkspaceContainer({
  studyId,
  analysisId,
  subsettingServiceUrl,
  dataServiceUrl,
  userServiceUrl,
  children,
}: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = useConfiguredSubsettingClient(subsettingServiceUrl);
  const dataClient = useConfiguredDataClient(dataServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(userServiceUrl);
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
  const classes = useStyles();

  return (
    <EDAWorkspaceContainer
      studyId={studyId}
      className={`${cx()} ${classes.workspace}`}
      analysisClient={analysisClient}
      dataClient={dataClient}
      subsettingClient={subsettingClient}
      makeVariableLink={makeVariableLink}
    >
      {children}
    </EDAWorkspaceContainer>
  );
}
