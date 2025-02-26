import type { AnalysisState } from '../../core';
import type { DownloadClient } from '../../core/api/DownloadClient';
import type { EntityCounts } from '../../core/hooks/entityCounts';
import type { WdkStudyRelease } from '../../core/hooks/study';

export type DownloadTabStudyRelease = WdkStudyRelease & {
  downloadServiceReleaseId: string;
};

export type DownloadTabStudyReleases = Array<DownloadTabStudyRelease>;

export type DownloadsTabProps = {
  downloadClient: DownloadClient;
  analysisState: AnalysisState | undefined;
  totalCounts: EntityCounts | undefined;
  filteredCounts: EntityCounts | undefined;
};
