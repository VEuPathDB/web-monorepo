import { ReactNode, useCallback } from 'react';
import { useRouteMatch } from 'react-router';

import { TreeNode } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import {
  EDAWorkspaceContainer,
  FieldWithMetadata,
  useConfiguredAnalysisClient,
  useConfiguredComputeClient,
  useConfiguredDataClient,
  useConfiguredDownloadClient,
  useConfiguredSubsettingClient,
} from '../core';
import { VariableDescriptor } from '../core/types/variable';
import { cx, findFirstVariable } from './Utils';
import { UnionTestContainer } from './UnionTestContainer';

import { makeStyles } from '@material-ui/core/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../core/api/queryClient';

const useStyles = makeStyles({
  workspace: {
    '& .MuiTypography-root': {
      textTransform: 'none',
    },
  },
});

interface Props {
  studyId: string;
  edaServiceUrl: string;
  analysisId?: string;
  children: ReactNode;
  isStudyExplorerWorkspace?: boolean;
  // overrides default class names
  className?: string;
  /**
   * Comma-separated extra WDK dataset IDs to union in with `studyId`.
   * Only set by the union-merge testbed routes -- when present,
   * studyMetadata is fetched as a merged "union(...)" study instead of the
   * single study identified by `studyId`. */
  extraDatasetIds?: string;
}

/** Allows a user to create a new analysis or edit an existing one. */
export function WorkspaceContainer({
  studyId,
  edaServiceUrl,
  children,
  isStudyExplorerWorkspace = false,
  className,
  extraDatasetIds,
}: Props) {
  const { url } = useRouteMatch();
  const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
  const dataClient = useConfiguredDataClient(edaServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const downloadClient = useConfiguredDownloadClient(edaServiceUrl);
  const computeClient = useConfiguredComputeClient(edaServiceUrl);

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

  const finalClassName =
    className ??
    `${cx()} ${isStudyExplorerWorkspace ? 'StudyExplorerWorkspace' : ''} ${
      classes.workspace
    }`;

  return (
    <QueryClientProvider client={queryClient}>
      {extraDatasetIds ? (
        <UnionTestContainer
          studyId={studyId}
          extraDatasetIds={extraDatasetIds}
          className={finalClassName}
          analysisClient={analysisClient}
          dataClient={dataClient}
          subsettingClient={subsettingClient}
          downloadClient={downloadClient}
          computeClient={computeClient}
          initializeMakeVariableLink={initializeMakeVariableLink}
        >
          {children}
        </UnionTestContainer>
      ) : (
        <EDAWorkspaceContainer
          studyId={studyId}
          className={finalClassName}
          analysisClient={analysisClient}
          dataClient={dataClient}
          subsettingClient={subsettingClient}
          downloadClient={downloadClient}
          computeClient={computeClient}
          initializeMakeVariableLink={initializeMakeVariableLink}
        >
          {children}
        </EDAWorkspaceContainer>
      )}
    </QueryClientProvider>
  );
}
