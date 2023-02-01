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
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Action } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUiActions';
import {
  getStudyId,
  getStudyRequestNeedsApproval,
} from '@veupathdb/study-data-access/lib/shared/studies';
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
  const permissions = usePermissions();
  console.log({ permissions });
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const attemptAction = useAttemptActionCallback();
  const history = useHistory();
  const dispatch = useDispatch();

  // const handleClick = useCallback(
  //   (event: React.MouseEvent<HTMLButtonElement>) => {
  //     event.preventDefault();
  //     attemptAction(Action.download, {
  //       studyId: datasetId,
  //     });
  //   },
  //   [datasetId, attemptAction]
  // );

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

  // Longitudinal studies on beta.microbiome are not formatted correctly (missing repeated measures) which affects the download files. This will be fixed for b60.
  // For now, warn the user about improperly formatted download files.
  const SHOULD_SHOW_DOWNLOAD_WARNING_KEY = `shouldShowDownloadWarning-${datasetId}`;
  const [
    shouldShowWarning,
    setShouldShowWarning,
  ] = useLocalBackedState<boolean>(
    true,
    SHOULD_SHOW_DOWNLOAD_WARNING_KEY,
    (boolean) => String(boolean),
    (string) => string !== 'false'
  );
  const studiesForDownloadWarning = [
    'DS_b3b3ae9838', // BONUS
    'DS_1102462e80', // Bangladesh
    'DS_a2f8877e68', // DIABIMMUNE
    'DS_5a4f8a1791', // DailyBaby
    'DS_accd1b80f6', // ECAM
    'DS_d20b9c4094', // Eco-CF
    'DS_570856e10e', // HMP V1-V3
    'DS_ca4404e155', // HMP V3-V5
    'DS_72c94486c6', // MAL-ED 2yr
    'DS_2e56313a65', // MAL-ED diarrhea
    'DS_84fcb69f4e', // NICU NEC
    'DS_d1b9f788dc', // Preterm Resistome I
    'DS_b9dc726b20', // Preterm Resistome II
  ];
  const handleCloseWarning = () => {
    setShouldShowWarning(false);
  };
  const downloadWarningMessage = [
    'Download files for this dataset may be formatted improperly. Instead, please download files for this study from ',
    <a href="https://microbiomedb.org">https://microbiomedb.org</a>,
    '. We appreciate your patience as we transfer to the new system.',
  ];
  // End of this section of the temporary solution for funky download files

  const dataAccessDeclaration = useMemo(() => {
    if (
      !user ||
      !permissions ||
      !studyRecord ||
      permissions.loading ||
      !datasetId
    )
      return;
    const studyAccess =
      typeof studyRecord.attributes['study_access'] === 'string'
        ? studyRecord.attributes['study_access']
        : '<status not found>';
    const requestNeedsApproval =
      getStudyRequestNeedsApproval(studyRecord) !== '0';
    console.log({ studyId: studyRecord.id[0].value });
    const permissionsForDataset =
      permissions.permissions.perDataset[studyRecord.id[0].value];
    console.log({ permissionsForDataset });
    // const requestStatus = permissionsForDataset?.accessRequestStatus!;
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
        {/* The following is part of the temporary solution for funky mbio download files */}
        {studiesForDownloadWarning.includes(datasetId) && shouldShowWarning && (
          <Banner
            banner={{
              type: 'warning',
              message: downloadWarningMessage,
              pinned: false,
              intense: false,
            }}
            onClose={handleCloseWarning}
          ></Banner>
        )}
        {/* End temporary solution section */}
        {getDataAccessDeclaration(
          studyAccess,
          requestNeedsApproval,
          user.isGuest,
          hasPermission ?? false,
          requestElement
        )}
      </span>
    );
  }, [
    user,
    permissions,
    studyRecord,
    handleClick,
    datasetId,
    shouldShowWarning,
  ]);

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
    !permissions.loading &&
      permissions.permissions.perDataset[datasetId]?.sha1Hash
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
  requestNeedsApproval: boolean,
  isGuest: boolean,
  hasPermission: boolean = false,
  requestElement: JSX.Element
): JSX.Element {
  console.log({ studyAccess });
  const PUBLIC_ACCESS_STUB =
    'Data downloads for this study are public. Data are available without logging in.';
  const LOGIN_REQUEST_STUB = (
    <span>
      To download data, please {requestElement}. Data will be available upon
      study team review and approval.
    </span>
  );
  // this should probably be non-site-specific
  const PRERELEASE_STUB =
    'Data downloads for this study are not yet available on ClinEpiDB.';
  // const CONTROLLED_ACCESS_STUB =
  //   ' Data will be available immediately following request submission.';
  // const PROTECTED_ACCESS_STUB =
  //   ' Data will be available upon study team review and approval.';
  const ACCESS_GRANTED_STUB =
    ' You have been granted access to download the data.';
  // const ACCESS_PENDING_STUB = 'Your data access request is pending.';

  return (
    <div>
      <H5 additionalStyles={{ margin: 0 }}>
        Data Accessibility:{' '}
        <span style={{ fontWeight: 'normal' }}>{studyAccess}</span>
      </H5>
      <Paragraph styleOverrides={{ margin: 0 }}>
        {studyAccess === 'Public' ? (
          <span>{PUBLIC_ACCESS_STUB}</span>
        ) : isGuest || !hasPermission ? (
          <span>{LOGIN_REQUEST_STUB}</span>
        ) : (
          <span>{ACCESS_GRANTED_STUB}</span>
        )}
      </Paragraph>
    </div>
  );
}
