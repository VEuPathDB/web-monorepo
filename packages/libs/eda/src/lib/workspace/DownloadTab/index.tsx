import { useEffect, useMemo, useState, useCallback } from 'react';

import { AnalysisState, useStudyMetadata, useStudyRecord } from '../../core';

// Definitions
import { EntityCounts } from '../../core/hooks/entityCounts';
import { DownloadClient } from '../../core/api/DownloadClient';

// Components
import MySubset from './MySubset';
import CurrentRelease from './CurrentRelease';

// Hooks
import { useStudyEntities, useWdkStudyReleases } from '../../core/hooks/study';
import { useEnhancedEntityData } from './hooks/useEnhancedEntityData';
import { DownloadTabStudyReleases } from './types';
import PastRelease from './PastRelease';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Action } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUiActions';
import { getStudyRequestNeedsApproval } from '@veupathdb/study-data-access/lib/shared/studies';

type DownloadsTabProps = {
  downloadClient: DownloadClient;
  analysisState: AnalysisState;
  totalCounts: EntityCounts | undefined;
  filteredCounts: EntityCounts | undefined;
};

export default function DownloadTab({
  downloadClient,
  analysisState,
  totalCounts,
  filteredCounts,
}: DownloadsTabProps) {
  const studyMetadata = useStudyMetadata();
  const studyRecord = useStudyRecord();
  const entities = useStudyEntities(studyMetadata.rootEntity);
  const enhancedEntityData = useEnhancedEntityData(
    entities,
    totalCounts,
    filteredCounts
  );
  const datasetId = studyRecord.id[0].value;
  const permission = usePermissions();
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const attemptAction = useAttemptActionCallback();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      attemptAction(Action.download, {
        studyId: datasetId,
      });
    },
    [datasetId, attemptAction]
  );

  const dataAccessDeclaration = useMemo(() => {
    if (
      !user ||
      !permission ||
      !studyRecord ||
      permission.loading ||
      !datasetId
    )
      return;
    const studyAccess =
      typeof studyRecord.attributes['study_access'] === 'string'
        ? studyRecord.attributes['study_access']
        : '<status not found>';
    const requestNeedsApproval =
      getStudyRequestNeedsApproval(studyRecord) !== '0';
    const hasPermission =
      permission.permissions.perDataset[studyRecord.id[0].value]
        ?.actionAuthorization['resultsAll'];
    const requestElement = (
      <button className="link" style={{ padding: 0 }} onClick={handleClick}>
        Click here to request access.
      </button>
    );
    return (
      <span
        style={{
          lineHeight: '150%',
          fontWeight: 300,
          fontSize: '1.4em',
        }}
      >
        <em>
          {getDataAccessDeclaration(
            studyAccess,
            requestNeedsApproval,
            user.isGuest,
            hasPermission ?? false
          )}
          {studyAccess !== 'Public' &&
            (user.isGuest || !hasPermission) &&
            requestElement}
        </em>
      </span>
    );
  }, [user, permission, studyRecord, handleClick, datasetId]);

  /**
   * Ok, this is confusing, but there are two places where we need
   * to pull information on "releases." The first is from the download
   * service, which just returns an array of string "release identifiers"
   * that is uses internally to reference releases in API endpoints.
   *
   * Second from that, we need to get additional metadata about each
   * release from the WDKService. Which, :laugh-don't-cry:, uses
   * different identifiers fo each release.
   *
   * We'll merge the info together later, but for now, that's why
   * you have two different variables for study releases here.
   */
  const [
    downloadServiceStudyReleases,
    setDownloadServiceStudyReleases,
  ] = useState<Array<string>>([]);
  const WDKStudyReleases = useWdkStudyReleases();

  // Get a list of all available study releases according to the Download Service.
  useEffect(() => {
    downloadClient.getStudyReleases(studyMetadata.id).then((result) => {
      setDownloadServiceStudyReleases(result);
    });
  }, [downloadClient, studyMetadata]);

  /**
   * One we have information from both services on available releases
   * let's merge them together into something more useful.
   *
   * Important note: We take the information on releases from the WDKService
   * to be canonical/official. So, if there is a "release" in the download service
   * that doesn't have a match in the WDKService, it gets disregarded.
   *  */
  const mergedReleaseData = useMemo(() => {
    if (!WDKStudyReleases.length || !downloadServiceStudyReleases.length)
      return [];

    /**
     * It turns out there are many "releases" for which the files
     * you can download haven't really changed at all.
     */
    return downloadServiceStudyReleases.reduce<DownloadTabStudyReleases>(
      (accumlatedValue, currentRelease) => {
        const currentReleaseNumber = currentRelease.split('-')[1];
        const matchingWDKRelease = WDKStudyReleases.find(
          (WDKRelease) => WDKRelease.releaseNumber === currentReleaseNumber
        );

        return matchingWDKRelease
          ? [
              ...accumlatedValue,
              matchingWDKRelease && {
                ...matchingWDKRelease,
                downloadServiceReleaseId: currentRelease,
              },
            ]
          : [...accumlatedValue];
      },
      []
    );
  }, [WDKStudyReleases, downloadServiceStudyReleases]);

  return (
    <div style={{ display: 'flex', paddingTop: 10 }}>
      <div key="Column One" style={{ marginRight: 75 }}>
        {dataAccessDeclaration ?? ''}
        <MySubset
          datasetId={datasetId}
          entities={enhancedEntityData}
          analysisState={analysisState}
        />
        {mergedReleaseData.map((release, index) =>
          index === 0 ? (
            <CurrentRelease
              key={release.releaseNumber}
              datasetId={datasetId}
              studyId={studyMetadata.id}
              release={release}
              downloadClient={downloadClient}
            />
          ) : (
            <PastRelease
              key={release.releaseNumber}
              datasetId={datasetId}
              studyId={studyMetadata.id}
              release={release}
              downloadClient={downloadClient}
            />
          )
        )}
      </div>
      <div key="Column Two">
        {/* In a future release, the items in Column One will be moved here
        and new items will be put into Column One. */}
      </div>
    </div>
  );
}

function getDataAccessDeclaration(
  studyAccess: string,
  requestNeedsApproval: boolean,
  isGuest: boolean,
  hasPermission: boolean = false
): string {
  const DATA_ACCESS_STUB = `Data downloads for this study are ${studyAccess.toLowerCase()}. `;
  const PUBLIC_ACCESS_STUB = 'You can download the data without logging in.';
  const LOGIN_REQUEST_STUB =
    'You must register or log in and request access to download data;';
  const CONTROLLED_ACCESS_STUB =
    ' data can be downloaded immediately following request submission. ';
  const PROTECTED_ACCESS_STUB =
    ' data can be downloaded after the study team reviews your request and grants you access. ';
  const ACCESS_GRANTED_STUB =
    'You have been granted access to download the data.';
  // const ACCESS_PENDING_STUB = 'Your data access request is pending.';

  let dataAccessDeclaration = DATA_ACCESS_STUB;
  if (studyAccess === 'Public') {
    return (dataAccessDeclaration += PUBLIC_ACCESS_STUB);
  } else if (isGuest || !hasPermission) {
    dataAccessDeclaration += LOGIN_REQUEST_STUB;
    return (dataAccessDeclaration += !requestNeedsApproval
      ? CONTROLLED_ACCESS_STUB
      : PROTECTED_ACCESS_STUB);
  } else if (!isGuest && hasPermission) {
    return (dataAccessDeclaration += ACCESS_GRANTED_STUB);
  } else {
    // dataAccessDeclaration += ACCESS_PENDING_STUB;
    return dataAccessDeclaration;
  }
}
