import { ServiceBase } from 'wdk-client/Service/ServiceBase';
import { ServiceMixins } from 'wdk-client/Service/ServiceMixins';

export default class WdkService extends ServiceMixins(ServiceBase) {

  private static _instances: Map<string, WdkService> = new Map;

  private constructor(protected serviceUrl: string) {
    super(serviceUrl);
  }

  // Ensure that only one instance is craeted for a given serviceUrl.
  public static getInstance(serviceUrl: string): WdkService {
    if (!this._instances.has(serviceUrl)) {
      this._instances.set(serviceUrl, new this(serviceUrl));
    }
    return this._instances.get(serviceUrl) as WdkService;
  }

}
