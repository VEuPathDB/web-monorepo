import {
  ApiRequest,
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

import { ReleaseFilesResponse, ReleasesResponse } from './types';

/**
 * An API client that allows for interactions with the
 * "Dataset Download Service".
 *
 * For documentation on that API, check out the following
 * url: https://veupathdb.github.io/service-dataset-download/api.html
 * */
export class DownloadClient extends FetchClientWithCredentials {
  // DAVE/JAMIE: This should move up the class hierarchy.
  /**
   * When you need to call an API endpoint that requires info about the
   * current user and project, this is the method you should utilize.
   *
   */
  private async fetchWithDetails<T>(
    callback: (user: User, projectId: string) => ApiRequest<T>
  ): Promise<T> {
    const projectId = (await this.wdkService.getConfig()).projectId;
    return this.fetchWithUser((user) => callback(user, projectId));
  }

  /**
   * Obtain a list of releases for a given studyId.
   *
   * The releases are not currently (2022/02/09) sorted, so we sort them
   * inside of this method.
   *
   * Corresponding API endpoint: /download/{project}/{study-id}
   */
  public async getStudyReleases(studyId: string): Promise<ReleasesResponse> {
    const response = await this.fetchWithDetails((user, projectId) => {
      return createJsonRequest({
        path: `/download/${projectId}/${studyId}`,
        method: 'GET',
        transformResponse: ioTransformer(ReleasesResponse),
      });
    });

    return response.sort(
      (a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1])
    );
  }

  /**
   * Obtain a list of all files available for download for a specific release.
   *
   * Corresponding API endpoint: /download/{project}/{study-id}/{release}
   */
  public async getStudyReleaseFiles(
    studyId: string,
    releaseId: string
  ): Promise<ReleaseFilesResponse> {
    return this.fetchWithDetails((user, projectId) => {
      return createJsonRequest({
        path: `/download/${projectId}/${studyId}/${releaseId}`,
        method: 'GET',
        transformResponse: ioTransformer(ReleaseFilesResponse),
      });
    });
  }

  /**
   * Obtain the URL for downloading a given file.
   *
   * We use this URL to generate an <a> element that will try
   * into default browser download behavior. This was
   * because we found that other options for downloading
   * files had significant downsides.
   * */
  public async downloadStudyFileURL(
    studyId: string,
    releaseId: string,
    fileId: string
  ) {
    const projectId = (await this.wdkService.getConfig()).projectId;
    return `${
      this.baseUrl
    }/download/${projectId}/${studyId}/${releaseId}/${fileId}?Auth-Key=${encodeURIComponent(
      await this.findUserRequestAuthKey()
    )}`;
  }
}
