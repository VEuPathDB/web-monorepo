import { ReactNode, useCallback } from 'react';
import { useRouteMatch } from 'react-router';

import { TreeNode } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import { EDAWorkspaceContainer, FieldWithMetadata } from '../core';
import {
  useConfiguredAnalysisClient,
  useConfiguredDataClient,
  useConfiguredSubsettingClient,
  useConfiguredDownloadClient,
  useConfiguredComputeClient,
} from '../core/hooks/client';
import { VariableDescriptor } from '../core/types/variable';
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
  serviceUrl: string;
  children: ReactNode;
}

/** Allows a user to create a new analysis or edit an existing one. */
export function WorkspaceContainer({ studyId, serviceUrl, children }: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = useConfiguredSubsettingClient(serviceUrl);
  const dataClient = useConfiguredDataClient(serviceUrl);
  const analysisClient = useConfiguredAnalysisClient(serviceUrl);
  const downloadClient = useConfiguredDownloadClient(serviceUrl);
  const computeClient = useConfiguredComputeClient(serviceUrl);

  const initializeMakeVariableLink = useCallback(
    (fieldTree: TreeNode<FieldWithMetadata>) => ({
      entityId: maybeEntityId,
      variableId: maybeVariableId,
    }: Partial<VariableDescriptor>) => {
      const entityId = maybeEntityId ?? fieldTree.field.term.split(':')[1];

      const variableId =
        maybeVariableId ??
        (entityId &&
          findFirstVariable(fieldTree, entityId)?.field.term.split('/')[1]);

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
      downloadClient={downloadClient}
      computeClient={computeClient}
      initializeMakeVariableLink={initializeMakeVariableLink}
    >
      {children}
    </EDAWorkspaceContainer>
  );
}
