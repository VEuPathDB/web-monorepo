import { FetchApiOptions } from '@veupathdb/http-utils';
import { BlastCompatibleWdkService } from '../wdkServiceIntegration';
import { BlastSubClient } from './BlastSubClient';

export class BlastReportClient extends BlastSubClient {
  constructor(
    options: FetchApiOptions,
    wdkService: BlastCompatibleWdkService,
    reportError: (error: any) => void
  ) {
    super(options, wdkService, reportError);
  }
}
