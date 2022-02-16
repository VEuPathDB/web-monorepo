import { useEffect, useMemo, useState } from 'react';

import {
  AnalysisState,
  useConfiguredDownloadClient,
  useStudyMetadata,
} from '../../core';

// Definitions
import { EntityCounts } from '../../core/hooks/entityCounts';

// Components
import MySubset from './MySubset';
import CurrentRelease from './CurrentRelease';

// Hooks
import { useStudyEntities, useWDKStudyReleases } from '../../core/hooks/study';
import { useEnhancedEntityData } from './hooks/useEnhancedEntityData';
import { DownloadTabStudyReleases } from './types';
import PastRelease from './PastRelease';

type DownloadsTabProps = {
  analysisState: AnalysisState;
  totalCounts: EntityCounts | undefined;
  filteredCounts: EntityCounts | undefined;
};

export default function DownloadTab({
  analysisState,
  totalCounts,
  filteredCounts,
}: DownloadsTabProps) {
  const downloadClient = useConfiguredDownloadClient('/eda-user-service');

  const studyMetadata = useStudyMetadata();
  const entities = useStudyEntities(studyMetadata.rootEntity);
  const enhancedEntityData = useEnhancedEntityData(
    entities,
    totalCounts,
    filteredCounts
  );

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
  const WDKStudyReleases = useWDKStudyReleases();

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
    // console.log('WDK', WDKStudyReleases);
    // console.log('Download Service', downloadServiceStudyReleases);

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
    <div style={{ display: 'flex', paddingTop: 20 }}>
      <div key="Column One" style={{ marginRight: 75 }}>
        <MySubset entities={enhancedEntityData} />
        {mergedReleaseData.map((release, index) =>
          index === 0 ? (
            <CurrentRelease
              studyId={studyMetadata.id}
              release={release}
              downloadClient={downloadClient}
            />
          ) : (
            <PastRelease
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
