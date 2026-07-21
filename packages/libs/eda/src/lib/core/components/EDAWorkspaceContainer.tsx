import { ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { TreeNode } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';

import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { AnalysisClient } from '../api/AnalysisClient';
import {
  MakeVariableLink,
  WorkspaceContext,
} from '../context/WorkspaceContext';
import {
  HookValue as WdkStudyRecord,
  useStudyMetadata,
  useWdkStudyRecord,
} from '../hooks/study';

import { FieldWithMetadata, StudyMetadata } from '..';

import { useFieldTree, useFlattenedFields } from './variableSelectors/hooks';
import { DownloadClient } from '../api/DownloadClient';
import { entityTreeToArray } from '../utils/study-metadata';
import { ComputeClient } from '../api/ComputeClient';
import { useDeepValue } from '../hooks/immutability';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

export interface Props {
  studyId: string;
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

/** Just a data container... but note that it also provides a material ui theme... */
export function EDAWorkspaceContainer(props: Props) {
  const { studyId, subsettingClient } = props;

  const wdkStudyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, subsettingClient);

  if (studyMetadata.error)
    return (
      <Banner
        banner={{
          type: 'warning',
          fontSize: '120%',
          message: studyId.includes('EDAUD_') ? (
            <>
              This is a user dataset; either it is not available or there are
              none available to this user. Would you like to{' '}
              <Link to="/workspace/datasets/new">upload</Link> one?
            </>
          ) : (
            <>
              The dataset you requested either does not exist or is not
              available to your user. Please{' '}
              <Link to="/contact-us">contact us</Link> if you consider it
              should.
            </>
          ),
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
    <EDAWorkspaceContainerWithLoadedData
      {...props}
      wdkStudyRecord={wdkStudyRecordState}
      studyMetadata={studyMetadata.value}
    />
  );
}

export interface LoadedDataProps extends Props {
  wdkStudyRecord: WdkStudyRecord;
  studyMetadata: StudyMetadata;
}

function EDAWorkspaceContainerWithLoadedData({
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
