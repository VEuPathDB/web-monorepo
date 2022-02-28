import { useEffect } from 'react';

// Utilities
import { DownloadClient } from '../../../core/api/DownloadClient';

// Definitions
import { DownloadTabStudyRelease } from '../types';

export type ReleaseFile = {
  fileName: string;
  fileSize: string;
  fileType: string;
  fileDescription: string;
  fileUrl: string | undefined;
};

/**
 * Obtain information from the Download service about the
 * files that are available to download for a given release.
 */
export function useGetReleaseFiles(
  studyId: string,
  release: DownloadTabStudyRelease,
  downloadClient: DownloadClient,
  setReleaseFiles: React.Dispatch<React.SetStateAction<Array<ReleaseFile>>>
) {
  useEffect(() => {
    async function getReleaseFiles() {
      const filesFromAPI = await downloadClient.getStudyReleaseFiles(
        studyId,
        release.downloadServiceReleaseId
      );

      const filesData: Array<ReleaseFile> = filesFromAPI
        .map((file) => {
          const [fileDescription, ...rest] = file.name.split('.');

          return {
            fileName: file.name,
            fileSize: (parseInt(file.size) / Math.pow(1024, 2)).toFixed(2),
            fileType: rest.join('.'),
            fileDescription: fileDescription,
            fileUrl: undefined,
          };
        })
        /**
         * Filter out any files returned by the API that are
         * actually "hidden" Linux files like .htaccess or .env -
         * which can identify here as naving no real name (just an
         * extension).
         */
        .filter((fileData) => fileData.fileDescription.length)
        /**
         * Sort alphabetically on fileDescription
         */
        .sort((a, b) => a.fileDescription.localeCompare(b.fileDescription));
      // Augment the URL each valid file.
      for (const fileData of filesData) {
        const fileUrl = await downloadClient.downloadStudyFileURL(
          studyId,
          release.downloadServiceReleaseId,
          fileData.fileName
        );
        fileData.fileUrl = fileUrl;
      }

      setReleaseFiles(filesData);
    }

    // Call our async function.
    getReleaseFiles();
  }, [
    studyId,
    release.downloadServiceReleaseId,
    downloadClient,
    setReleaseFiles,
  ]);
}
