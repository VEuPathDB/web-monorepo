import {
  ApiRequest,
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { AnyType } from 'io-ts';
import { AnalysisPreferences } from '../..';
import { ReleaseFilesResponse, ReleasesResponse } from './types';

/**
 * An API client that allows for interactions with the
 * "Dataset Download Service".
 *
 * For documentation on that API, check out the following
 * url: https://veupathdb.github.io/service-dataset-download/api.html
 * */
export class DownloadClient extends FetchClientWithCredentials {
  /**
   * When you need to call an API endpoint that requires info about the
   * current user and project, this is the method you should utilize.
   *
   * @param callback
   * @returns
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

    return response.sort().reverse();
  }

  /**
   * Obtain a list of all files available for download for a specific release.
   *
   * The releases are not currently (2022/02/09) sorted, so we sort them
   * inside of this method.
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
}
