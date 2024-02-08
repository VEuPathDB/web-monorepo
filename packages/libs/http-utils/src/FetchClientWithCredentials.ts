import { memoize, once } from 'lodash';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { ApiRequest, FetchApiOptions, FetchClient } from './FetchClient';

export class FetchClientWithCredentials extends FetchClient {
  public static getClient = memoize(
    (baseUrl: string, wdkService: WdkService) => {
      return new this({ baseUrl }, wdkService);
    }
  );

  protected readonly getUser = once(() => this.wdkService.getCurrentUser());

  protected readonly findAuthorizationHeaders = once(async (): Promise<
    Record<string, string>
  > => {
    const cookies = Object.fromEntries(
      document.cookie
        .split('; ')
        .map((entry) => entry.split(/=(.*)/).slice(0, 2))
    );

    if ('Authorization' in cookies) {
      return { Authorization: cookies.Authorization };
    }

    const user = await this.getUser();
    if (user.isGuest) {
      return {
        'Auth-Key': String(user.id),
      };
    }

    const wdkCheckAuthCookieValue = cookies.wdk_check_auth;
    if (wdkCheckAuthCookieValue == null) {
      throw new Error(
        `Tried to retrieve a non-existent WDK auth key for user ${user.id}`
      );
    }

    return { 'Auth-Key': wdkCheckAuthCookieValue };
  });

  protected async findAuthorizationQueryString() {
    const authHeader = await this.findAuthorizationHeaders();
    return Object.entries(authHeader)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('');
  }

  constructor(
    options: FetchApiOptions,
    protected readonly wdkService: WdkService
  ) {
    super(options);
  }

  protected async fetch<T>(apiRequest: ApiRequest<T>): Promise<T> {
    const apiRequestWithAuth: ApiRequest<T> = {
      ...apiRequest,
      headers: {
        ...(apiRequest.headers ?? {}),
        ...(await this.findAuthorizationHeaders()),
      },
    };

    return super.fetch(apiRequestWithAuth);
  }

  protected async fetchWithUser<T>(
    callback: (user: User) => ApiRequest<T>
  ): Promise<T> {
    return this.fetch(callback(await this.getUser()));
  }
}
