import { memoize, once } from 'lodash';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { ApiRequest, FetchApiOptions, FetchClient } from './FetchClient';

interface AuthorizationToken {
  type: 'wdk' | 'bearer';
  value: string;
}

interface Constructor<M> {
  new (...args: any[]): M;
}

const getMemoizedInstance = memoize(function getInstance<
  T extends FetchClientWithCredentials
>(ctor: Constructor<T>, baseUrl: string, wdkService: WdkService) {
  return new ctor({ baseUrl }, wdkService);
});

export class FetchClientWithCredentials extends FetchClient {
  public static getClient<T extends FetchClientWithCredentials>(
    this: Constructor<T>,
    baseUrl: string,
    wdkService: WdkService
  ) {
    return getMemoizedInstance(this, baseUrl, wdkService);
  }

  protected readonly getUser = once(() => this.wdkService.getCurrentUser());

  private readonly findAuthorizationToken = once(
    async (): Promise<AuthorizationToken> => {
      const cookies = Object.fromEntries(
        document.cookie
          .split('; ')
          .map((entry) => entry.split(/=(.*)/).slice(0, 2))
      );

      if ('Authorization' in cookies) {
        return {
          type: 'bearer',
          value: cookies.Authorization,
        };
      }

      const user = await this.getUser();
      const authKeyValue = user.isGuest
        ? String(user.id)
        : cookies.wdk_check_auth;
      if (authKeyValue == null) {
        throw new Error(
          `Tried to retrieve a non-existent WDK auth key for user ${user.id}`
        );
      }
      return {
        type: 'wdk',
        value: authKeyValue,
      };
    }
  );

  protected async findAuthorizationHeaders(): Promise<Record<string, string>> {
    const authKey = await this.findAuthorizationToken();
    return authKey.type === 'bearer'
      ? {
          Authorization: 'Bearer ' + authKey.value,
        }
      : {
          'Auth-Key': authKey.value,
        };
  }

  protected async findAuthorizationQueryParams(): Promise<URLSearchParams> {
    const authKey = await this.findAuthorizationToken();
    return new URLSearchParams(
      authKey.type === 'bearer'
        ? `access_token=${authKey.value}`
        : `Auth-Key=${authKey.value}`
    );
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
