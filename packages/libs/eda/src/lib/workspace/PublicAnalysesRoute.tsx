import { useCallback } from 'react';
import { useLocation } from 'react-router';

import Path from 'path';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { AnalysisClient, usePublicAnalysisList } from '../core';
import { useWdkStudyRecords } from '../core/hooks/study';

import { PublicAnalyses, StudyRecordMetadata } from './PublicAnalyses';
import SubsettingClient from '../core/api/SubsettingClient';
import { useWdkServiceWithVdi } from '@veupathdb/user-datasets/lib/Hooks/wdkServiceWithVdi';
import { map } from 'lodash';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { diyUserDatasetIdToWdkRecordId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';

export interface Props {
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  exampleAnalysesAuthors?: number[];
}

export function PublicAnalysesRoute({
  analysisClient,
  subsettingClient,
  exampleAnalysesAuthors,
}: Props) {
  const publicAnalysisListState = usePublicAnalysisList(analysisClient);
  const studyRecords = useWdkStudyRecords(subsettingClient);
  const communityDatasets = useWdkServiceWithVdi(
    (wdkService) => wdkService.getCommunityDatasets(),
    []
  );

  const studyRecordsMetadata: StudyRecordMetadata[] | undefined =
    studyRecords &&
      communityDatasets && [
        ...map(studyRecords, (record) => ({
          id: getStudyId(record)!,
          displayName: record.displayName ?? 'Unknown Study',
        })),
        ...map(communityDatasets, (ud) => ({
          id: diyUserDatasetIdToWdkRecordId(ud.datasetId),
          displayName: ud.name,
        })),
      ];

  const location = useLocation();
  const makeAnalysisLink = useCallback(
    (analysisId: string) =>
      Path.join(location.pathname, '..', analysisId, 'import'),
    [location.pathname]
  );

  useSetDocumentTitle('Public Analyses');

  return (
    <PublicAnalyses
      analysisClient={analysisClient}
      publicAnalysisListState={publicAnalysisListState}
      studyRecordsMetadata={studyRecordsMetadata}
      makeAnalysisLink={makeAnalysisLink}
      exampleAnalysesAuthors={exampleAnalysesAuthors}
    />
  );
}
