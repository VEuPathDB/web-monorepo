import { useCallback } from 'react';
import { useLocation } from 'react-router';

import Path from 'path';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { AnalysisClient, usePublicAnalysisList } from '../core';
import { useWdkStudyRecords } from '../core/hooks/study';

import { PublicAnalyses, StudyRecordMetadata } from './PublicAnalyses';
import SubsettingClient from '../core/api/SubsettingClient';
import { isVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';
import { map } from 'lodash';
import {
  getStudyId,
  getStudyName,
} from '@veupathdb/study-data-access/lib/shared/studies';
import { diyUserDatasetIdToWdkRecordId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

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
  const communityDatasets = useWdkService(async (wdkService) => {
    if (isVdiCompatibleWdkService(wdkService))
      return wdkService.getCommunityDatasets();
    return [];
  }, []);

  const studyRecordsMetadata: StudyRecordMetadata[] = [
    ...map(studyRecords, (record) => ({
      id: getStudyId(record)!,
      displayName: getStudyName(record) ?? 'Unknown Study',
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
