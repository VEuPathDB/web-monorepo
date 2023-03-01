import { useEffect, useMemo, useState, useCallback } from 'react';

import {
  AnalysisState,
  useStudyEntities,
  useStudyMetadata,
  useStudyRecord,
} from '../../core';

// Definitions
import { EntityCounts } from '../../core/hooks/entityCounts';
import { DownloadClient } from '../../core/api/DownloadClient';

// Components
import MySubset from './MySubset';
import CurrentRelease from './CurrentRelease';
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';

// Hooks
import { useWdkStudyReleases } from '../../core/hooks/study';
import { useEnhancedEntityData } from './hooks/useEnhancedEntityData';
import { DownloadTabStudyReleases } from './types';
import PastRelease from './PastRelease';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useLocalBackedState } from '@veupathdb/wdk-client/lib/Hooks/LocalBackedState';
import { H5, Paragraph } from '@veupathdb/coreui';
import { useDispatch } from 'react-redux';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import { useHistory } from 'react-router';
import { parsePath } from 'history';

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
  const entities = useStudyEntities();
  const enhancedEntityData = useEnhancedEntityData(
    entities,
    totalCounts,
    filteredCounts
  );
  const datasetId = studyRecord.id[0].value;
  const permission = usePermissions();
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const loggedInRoute = `/request-access/${datasetId}?redirectUrl=${encodeURIComponent(
        window.location.href
      )}`;

      if (user === undefined || user.isGuest) {
        dispatch(
          showLoginForm(
            window.location.origin +
              history.createHref(parsePath(loggedInRoute))
          )
        );
      } else {
        history.push(loggedInRoute);
      }
    },
    [datasetId, history, user, dispatch]
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
    const permissionsForDataset =
      permission.permissions.perDataset[studyRecord.id[0].value];
    const hasPermission =
      permissionsForDataset?.actionAuthorization['resultsAll'];
    const requestElement = (
      <button className="link" style={{ padding: 0 }} onClick={handleClick}>
        request access
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
        {getDataAccessDeclaration(
          studyAccess,
          user.isGuest,
          hasPermission ?? false,
          requestElement
        )}
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

  // Only fetch study releases if they are expected to be available
  const shouldFetchStudyReleases = Boolean(
    !permission.loading &&
      permission.permissions.perDataset[datasetId]?.sha1Hash
  );

  // Get a list of all available study releases according to the Download Service.
  useEffect(() => {
    if (!shouldFetchStudyReleases) {
      return;
    }

    downloadClient.getStudyReleases(studyMetadata.id).then((result) => {
      setDownloadServiceStudyReleases(result);
    });
  }, [shouldFetchStudyReleases, downloadClient, studyMetadata]);

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
  isGuest: boolean,
  hasPermission: boolean = false,
  requestElement: JSX.Element
): JSX.Element {
  const PUBLIC_ACCESS_STUB =
    'Data downloads for this study are public. Data are available without logging in.';
  const LOGIN_REQUEST_STUB = (
    <span>
      To download data, please {requestElement}. Data will be available upon
      study team review and approval.
    </span>
  );
  const PRERELEASE_STUB =
    'Data downloads for this study are not yet available on this website.';
  const ACCESS_GRANTED_STUB =
    ' You have been granted access to download the data.';

  return (
    <div>
      <H5 additionalStyles={{ margin: 0 }}>
        Data Accessibility:{' '}
        <span style={{ fontWeight: 'normal' }}>{studyAccess}</span>
      </H5>
      <Paragraph styleOverrides={{ margin: 0 }}>
        {studyAccess === 'Public' ? (
          <span>{PUBLIC_ACCESS_STUB}</span>
        ) : studyAccess === 'Controlled' || studyAccess === 'Protected' ? (
          isGuest || !hasPermission ? (
            <span>{LOGIN_REQUEST_STUB}</span>
          ) : (
            <span>{ACCESS_GRANTED_STUB}</span>
          )
        ) : studyAccess === 'Prerelease' ? (
          <span>{PRERELEASE_STUB}</span>
        ) : (
          <span>Unknown study accessibility value</span>
        )}
      </Paragraph>
    </div>
  );
}
