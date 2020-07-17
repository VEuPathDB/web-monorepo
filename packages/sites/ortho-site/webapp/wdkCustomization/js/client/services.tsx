import { WdkService } from 'wdk-client/Core';
import { ok } from 'wdk-client/Utils/Json';

import { genomeSourcesRowsDecoder, GenomeSourcesRows } from './utils/dataSummary';
import { GroupLayout, groupLayoutDecoder } from './utils/groupLayout';
import { TaxonEntries, taxonEntriesDecoder } from './utils/taxons';

export function wrapWdkService(wdkService: WdkService): OrthoService {
  return ({
    ...wdkService,
    getGenomeSources: orthoServiceWrappers.getGenomeSources(wdkService),
    getGenomeStatistics: orthoServiceWrappers.getGenomeStatistics(wdkService),
    getGroupLayout: orthoServiceWrappers.getGroupLayout(wdkService),
    getTaxons: orthoServiceWrappers.getTaxons(wdkService)
  });
};

const orthoServiceWrappers = {
  getGenomeSources: (wdkService: WdkService) => () =>
    wdkService.sendRequest(
      genomeSourcesRowsDecoder,
      {
        useCache: true,
        method: 'get',
        path: '/data-summary/genome-sources'
      }
    ),
  getGenomeStatistics: (wdkService: WdkService) => () =>
    wdkService.sendRequest<unknown>(
      ok,
      {
        useCache: true,
        method: 'get',
        path: '/data-summary/genome-statistics'
      }
    ),
  getGroupLayout: (wdkService: WdkService) => (groupName: string) =>
    wdkService.sendRequest(
      groupLayoutDecoder,
      {
        useCache: true,
        method: 'get',
        path: `/group/${groupName}/layout`
      }
    ),
  getTaxons: (wdkService: WdkService) => () =>
    wdkService.sendRequest(
      taxonEntriesDecoder,
      {
        useCache: true,
        method: 'get',
        path: '/data-summary/taxons'
      }
    )
};

export interface OrthoService extends WdkService {
  getGenomeSources: () => Promise<GenomeSourcesRows>;
  getGenomeStatistics: () => Promise<unknown>;
  getGroupLayout: (groupName: string) => Promise<GroupLayout>;
  getTaxons: () => Promise<TaxonEntries>;
}

export function isOrthoService(wdkService: WdkService): wdkService is OrthoService {
  return Object.keys(orthoServiceWrappers).every(
    orthoServiceKey => orthoServiceKey in wdkService
  );
}
