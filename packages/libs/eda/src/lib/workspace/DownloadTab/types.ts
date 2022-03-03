import { WdkStudyRelease } from '../../core/hooks/study';

export type DownloadTabStudyRelease = WdkStudyRelease & {
  downloadServiceReleaseId: string;
};

export type DownloadTabStudyReleases = Array<DownloadTabStudyRelease>;
