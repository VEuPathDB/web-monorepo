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

  protected readonly findUserRequestAuthKey = once(async () => {
    const user = await this.getUser();
    if (user.isGuest) {
      return String(user.id);
    }

    const wdkCheckAuthEntry = document.cookie
      .split('; ')
      .find((x) => x.startsWith('wdk_check_auth='));

    if (wdkCheckAuthEntry == null) {
      throw new Error(
        `Tried to retrieve a non-existent WDK auth key for user ${user.id}`
      );
    }

    return wdkCheckAuthEntry.replace(/^wdk_check_auth=/, '');
  });

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
        'Auth-Key': await this.findUserRequestAuthKey(),
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
