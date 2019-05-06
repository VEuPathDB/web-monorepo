import { composeMixins, CompositeService } from 'wdk-client/Service/ServiceMixins';

export default interface WdkService extends CompositeService {
  
}

export default class WdkService {

  private static _instances: Map<string, WdkService> = new Map;

  private constructor(serviceUrl: string) {
    return composeMixins(serviceUrl);
  }

  // Ensure that only one instance is craeted for a given serviceUrl.
  public static getInstance(serviceUrl: string): WdkService {
    if (!this._instances.has(serviceUrl)) {
      this._instances.set(serviceUrl, new this(serviceUrl));
    }
    return this._instances.get(serviceUrl) as WdkService;
  }

}