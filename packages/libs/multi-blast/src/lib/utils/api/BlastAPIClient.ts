import { memoize } from 'lodash';
import { BlastCompatibleWdkService } from '../wdkServiceIntegration';
import { FetchApiOptions } from '@veupathdb/http-utils';
import { BlastQueryClient } from './BlastQueryClient';
import { BlastReportClient } from './BlastReportClient';

export class BlastAPIClient {
  public static create = memoize(
    (
      baseUrl: string,
      wdkService: BlastCompatibleWdkService,
      reportError: (error: any) => void
    ) => {
      return new BlastAPIClient({ baseUrl }, wdkService, reportError);
    }
  );

  public readonly queryAPI: BlastQueryClient;

  public readonly reportAPI: BlastReportClient;

  constructor(
    options: FetchApiOptions,
    wdkService: BlastCompatibleWdkService,
    reportError: (error: any) => void
  ) {
    this.queryAPI = new BlastQueryClient(options, wdkService, reportError);
    this.reportAPI = new BlastReportClient(options, wdkService, reportError);
  }
}
