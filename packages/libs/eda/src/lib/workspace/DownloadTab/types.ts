import { WDKStudyRelease } from '../../core/hooks/study';

export type DownloadTabStudyRelease = WDKStudyRelease & {
  downloadServiceReleaseId: string;
};

export type DownloadTabStudyReleases = Array<DownloadTabStudyRelease>;
