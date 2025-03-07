import { useEffect, useMemo, useState, useCallback } from 'react';

import {
  usePromise,
  useStudyEntities,
  useStudyMetadata,
  useStudyRecord,
} from '../../core';

// Utils
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';

// Components
import MySubset from './MySubset';
import CurrentRelease from './CurrentRelease';
import StudyCitation, { getCitationString } from './StudyCitation';

// Hooks
import { useWdkStudyReleases } from '../../core/hooks/study';
import { useEnhancedEntityData } from './hooks/useEnhancedEntityData';
import { DownloadsTabProps, DownloadTabStudyReleases } from './types';
import PastRelease from './PastRelease';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { colors, H5, Paragraph } from '@veupathdb/coreui';
import { useDispatch } from 'react-redux';
import { showLoginForm } from '@veupathdb/wdk-client/lib/Actions/UserSessionActions';
import { useHistory } from 'react-router';
import { parsePath } from 'history';
import Loading from '@veupathdb/wdk-client/lib/Components/Loading/Loading';

export default function Downloads({
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
  const { isUserStudy } = studyMetadata;
  const permission = usePermissions();
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const projectDisplayName = useWdkService(
    async (wdkService) =>
      await wdkService.getConfig().then((config) => config.displayName),
    []
  );
  const studyContacts = useWdkService(
    async (wdkService) =>
      await wdkService
        .getRecord('dataset', studyRecord.id, { tables: ['Contacts'] })
        .then((record) => {
          const contactsArray = record.tables['Contacts'].map(
            (contact) => contact['contact_name']
          );
          return contactsArray.length > 3
            ? contactsArray.slice(0, 3).join(', ') + ', et al'
            : contactsArray.join(', ');
        }),
    []
  );
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
    const studyAccess =
      typeof studyRecord.attributes['study_access'] === 'string'
        ? studyRecord.attributes['study_access']
        : 'Public';
    const hasPermission = permission.loading
      ? undefined
      : permission.permissions.perDataset[studyRecord.id[0].value]
          ?.actionAuthorization['resultsAll'] || false;
    const requestElement = (
      <button className="link" style={{ padding: 0 }} onClick={handleClick}>
        request access
      </button>
    );

    return getDataAccessDeclaration(
      studyAccess,
      requestElement,
      user?.isGuest,
      hasPermission
    );
  }, [user, permission, studyRecord, handleClick]);

  /*
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

  const WDKStudyReleases = useWdkStudyReleases();

  // Get a list of all available study releases according to the Download Service.
  const downloadServiceStudyReleases = usePromise(
    useCallback(async () => {
      // Only fetch study releases if they are expected to be available
      if (permission.loading) return undefined;
      if (permission.permissions.perDataset[datasetId]?.sha1Hash == null)
        return [];
      try {
        return await downloadClient.getStudyReleases(studyMetadata.id);
      } catch (error) {
        console.log(error);
        return [];
      }
    }, [datasetId, downloadClient, permission, studyMetadata.id]),
    { keepPreviousValue: false }
  );

  /**
   * Once we have information from both services on available releases
   * let's merge them together into something more useful.
   *
   * Important note: We take the information on releases from the WDKService
   * to be canonical/official. So, if there is a "release" in the download service
   * that doesn't have a match in the WDKService, it gets disregarded.
   *  */
  const mergedReleaseData = useMemo(() => {
    if (!WDKStudyReleases || !downloadServiceStudyReleases.value)
      return undefined;

    /**
     * It turns out there are many "releases" for which the files
     * you can download haven't really changed at all.
     */
    return downloadServiceStudyReleases.value.reduce<DownloadTabStudyReleases>(
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

  const partialCitationData = useMemo(() => {
    let citationUrl;
    if (analysisState?.analysis && 'analysisId' in analysisState.analysis) {
      citationUrl = window.location.href.replace(
        `${analysisState.analysis.analysisId}/download`,
        'new'
      );
    } else {
      citationUrl = window.location.href.replace('/download', '');
    }
    return {
      studyContacts: studyContacts ?? '',
      studyDisplayName: studyRecord.displayName,
      projectDisplayName: projectDisplayName ?? '',
      citationUrl: citationUrl,
    };
  }, [
    studyContacts,
    studyRecord.displayName,
    projectDisplayName,
    analysisState,
  ]);

  if (mergedReleaseData == null) return <Loading />;

  return (
    <div style={{ display: 'flex', paddingTop: 10 }}>
      <div
        key="Column One"
        style={{
          display: 'flex',
          rowGap: '1.5em',
          flexDirection: 'column',
          marginRight: 75,
        }}
      >
        {projectDisplayName === 'ClinEpiDB' &&
          !isUserStudy &&
          (dataAccessDeclaration ?? '')}
        {mergedReleaseData[0] && (
          <StudyCitation
            partialCitationData={partialCitationData}
            // use current release
            release={mergedReleaseData[0]}
          />
        )}
        {analysisState && (
          <MySubset
            datasetId={datasetId}
            entities={enhancedEntityData}
            analysisState={analysisState}
          />
        )}
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
              citationString={stripHTML(
                getCitationString({
                  partialCitationData,
                  release,
                })
              )}
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
  requestElement: JSX.Element,
  isGuest?: boolean,
  hasPermission?: boolean
): JSX.Element {
  const accessIsControlled = studyAccess === 'Controlled';
  const accessIsProtected = studyAccess === 'Protected';
  const requestIsRequired = accessIsControlled || accessIsProtected;

  const PRERELEASE_STUB =
    'Data downloads for this study are not yet available on this website.';
  const PUBLIC_ACCESS_STUB =
    'Data downloads for this study are public. Data are available without logging in.';
  const LOGIN_REQUEST_SPAN = () => (
    <span>To download data, please {requestElement}.</span>
  );
  const CONTROLLED_ACCESS_STUB =
    ' Data will be available immediately after submitting the request.';
  const PROTECTED_ACCESS_STUB =
    ' Data will be available upon study team review and approval.';
  const ACCESS_GRANTED_STUB =
    ' You have been granted access to download the data.';

  return (
    <div>
      <H5 additionalStyles={{ margin: 0 }}>
        Data Accessibility:{' '}
        <span style={{ fontWeight: 'normal' }}>{studyAccess}</span>
      </H5>
      <Paragraph
        color={colors.gray[600]}
        styleOverrides={{ margin: '0.5em 0 0 0' }}
        textSize="medium"
      >
        {isGuest === undefined || hasPermission === undefined ? (
          <AnimatedLoadingText text="Getting permissions" />
        ) : studyAccess === 'Public' ? (
          <span>{PUBLIC_ACCESS_STUB}</span>
        ) : requestIsRequired ? (
          isGuest || !hasPermission ? (
            <span>
              <LOGIN_REQUEST_SPAN />
              <span>
                {accessIsControlled
                  ? CONTROLLED_ACCESS_STUB
                  : accessIsProtected
                  ? PROTECTED_ACCESS_STUB
                  : ''}
              </span>
            </span>
          ) : (
            <span>{ACCESS_GRANTED_STUB}</span>
          )
        ) : studyAccess === 'Prerelease' ? (
          <span>{PRERELEASE_STUB}</span>
        ) : (
          <span>Unknown study accessibility value.</span>
        )}
      </Paragraph>
    </div>
  );
}

const AnimatedLoadingText = (props: { text?: string }) => {
  const text = props.text ?? 'Loading';
  const [numDots, setNumDots] = useState(1);

  useEffect(() => {
    const nextNumDots = (numDots % 3) + 1;
    setTimeout(() => setNumDots(nextNumDots), 500);
  });

  return (
    <span>
      {text}
      {'.'.repeat(numDots)}
    </span>
  );
};
