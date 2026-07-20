import { ReactNode, useMemo } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { TreeNode } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';

import SubsettingClient from '../core/api/SubsettingClient';
import DataClient from '../core/api/DataClient';
import { AnalysisClient } from '../core/api/AnalysisClient';
import { DownloadClient } from '../core/api/DownloadClient';
import { ComputeClient } from '../core/api/ComputeClient';
import {
  MakeVariableLink,
  WorkspaceContext,
} from '../core/context/WorkspaceContext';
import {
  HookValue as WdkStudyRecord,
  useWdkStudyRecord,
} from '../core/hooks/study';
import { useCachedPromise } from '../core/hooks/cachedPromise';
import { useDeepValue } from '../core/hooks/immutability';
import {
  useFieldTree,
  useFlattenedFields,
} from '../core/components/variableSelectors/hooks';
import { entityTreeToArray } from '../core/utils/study-metadata';
import { FieldWithMetadata, StudyMetadata } from '../core';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

export interface Props {
  /**
   * The primary (real) WDK dataset ID. Its WDK record and permissions
   * continue to drive access-gating and UI chrome (display name, is_public,
   * download tab, etc.) unchanged -- we are not attempting to merge WDK
   * records for this testbed.
   */
  studyId: string;
  /** Comma-separated additional WDK dataset IDs to union in with `studyId`. */
  extraDatasetIds: string;
  children: ReactNode;
  className?: string;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  downloadClient: DownloadClient;
  dataClient: DataClient;
  computeClient: ComputeClient;
  initializeMakeVariableLink?: (
    fieldTree: TreeNode<FieldWithMetadata>
  ) => MakeVariableLink;
}

/**
 * Union-merge testbed variant of EDAWorkspaceContainer.
 *
 * The WDK record (access-gating, display name, download-tab config) is
 * always sourced from the primary `studyId` dataset, exactly as the normal
 * workspace does. `studyMetadata`, however, is fetched directly from the
 * subsetting service using a "union(...)" study ID built from every listed
 * dataset's real EDA study ID -- this exercises the actual union-merge
 * logic in the experimental service branch, rather than faking a merged
 * entity tree client-side.
 */
export function UnionTestContainer(props: Props) {
  const { studyId, extraDatasetIds, subsettingClient } = props;

  const wdkStudyRecordState = useWdkStudyRecord(studyId);
  const permissionsResponse = usePermissions();

  const datasetIds = useDeepValue(
    useMemo(
      () => [studyId, ...extraDatasetIds.split(',').map((id) => id.trim())],
      [studyId, extraDatasetIds]
    )
  );

  const unionStudyId = permissionsResponse.loading
    ? undefined
    : datasetIds
        .map((id) => permissionsResponse.permissions.perDataset[id]?.studyId)
        .every((edaStudyId): edaStudyId is string => edaStudyId != null)
    ? `union(${datasetIds
        .map((id) => permissionsResponse.permissions.perDataset[id]!.studyId)
        .join(',')})`
    : '__not_found__';

  const studyMetadata = useCachedPromise(async () => {
    if (unionStudyId === '__not_found__' || unionStudyId == null) {
      throw new Error(
        `Could not resolve EDA Study IDs for one or more of: ${datasetIds.join(
          ', '
        )}.`
      );
    }
    return await subsettingClient.getStudyMetadata(unionStudyId);
  }, [unionStudyId, subsettingClient]);

  if (studyMetadata.error)
    return (
      <Banner
        banner={{
          type: 'warning',
          fontSize: '120%',
          message: `Could not load merged study metadata for "${unionStudyId}". See the console for details.`,
        }}
      />
    );

  if (
    wdkStudyRecordState == null ||
    studyMetadata.value == null ||
    studyMetadata.pending
  )
    return <Loading />;

  return (
    <UnionTestContainerWithLoadedData
      {...props}
      wdkStudyRecord={wdkStudyRecordState}
      studyMetadata={studyMetadata.value}
    />
  );
}

interface LoadedDataProps extends Props {
  wdkStudyRecord: WdkStudyRecord;
  studyMetadata: StudyMetadata;
}

function UnionTestContainerWithLoadedData({
  children,
  className = 'EDAWorkspace',
  analysisClient,
  subsettingClient,
  dataClient,
  downloadClient,
  computeClient,
  initializeMakeVariableLink,
  wdkStudyRecord,
  studyMetadata,
}: LoadedDataProps) {
  const entities = useMemo(
    () => entityTreeToArray(studyMetadata.rootEntity),
    [studyMetadata.rootEntity]
  );
  const variableTreeFields = useFlattenedFields(entities, 'variableTree');
  const variableTree = useFieldTree(variableTreeFields);

  const makeVariableLink = useMemo(
    () => initializeMakeVariableLink?.(variableTree),
    [initializeMakeVariableLink, variableTree]
  );

  const contextValue = useDeepValue({
    ...wdkStudyRecord,
    studyMetadata,
    analysisClient,
    subsettingClient,
    dataClient,
    downloadClient,
    computeClient,
    makeVariableLink,
  });

  return (
    <WorkspaceContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </WorkspaceContext.Provider>
  );
}
