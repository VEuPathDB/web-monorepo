import { ReactNode, useCallback } from 'react';
import { useRouteMatch } from 'react-router';

import { TreeNode } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import { EDAWorkspaceContainer, FieldWithMetadata } from '../core';
import {
  AnalysisClient,
  ComputeClient,
  DataClient,
  DownloadClient,
  SubsettingClient,
} from '../core/api';
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
  children: ReactNode;
  analysisClient: AnalysisClient;
  computeClient: ComputeClient;
  dataClient: DataClient;
  downloadClient: DownloadClient;
  subsettingClient: SubsettingClient;
  isStudyExplorerWorkspace?: boolean;
}

/** Allows a user to create a new analysis or edit an existing one. */
export function WorkspaceContainer({
  studyId,
  subsettingClient,
  dataClient,
  analysisClient,
  downloadClient,
  computeClient,
  children,
  isStudyExplorerWorkspace = false,
}: Props) {
  const { url } = useRouteMatch();

  const initializeMakeVariableLink = useCallback(
    (fieldTree: TreeNode<FieldWithMetadata>) =>
      ({
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
      className={`${cx()} ${
        isStudyExplorerWorkspace ? 'StudyExplorerWorkspace' : ''
      } ${classes.workspace}`}
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
