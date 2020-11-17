import { WdkService } from 'wdk-client/Core';

import {
  ProteomeSummaryRows,
  proteomeSummaryRowsDecoder
} from 'ortho-client/utils/dataSummary';
import { GroupLayout, groupLayoutDecoder } from 'ortho-client/utils/groupLayout';
import { TaxonEntries, taxonEntriesDecoder } from 'ortho-client/utils/taxons';

export function wrapWdkService(wdkService: WdkService): OrthoService {
  return ({
    ...wdkService,
    getGroupLayout: orthoServiceWrappers.getGroupLayout(wdkService),
    getProteomeSummary: orthoServiceWrappers.getProteomeSummary(wdkService),
    getTaxons: orthoServiceWrappers.getTaxons(wdkService)
  });
};

const orthoServiceWrappers = {
  getGroupLayout: (wdkService: WdkService) => (groupName: string) =>
    wdkService.sendRequest(
      groupLayoutDecoder,
      {
        useCache: true,
        method: 'get',
        path: `/group/${groupName}/layout`
      }
    ),
  getProteomeSummary: (wdkService: WdkService) => () =>
    wdkService.sendRequest(
      proteomeSummaryRowsDecoder,
      {
        useCache: true,
        method: 'get',
        path: '/data-summary/proteomes'
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
  getGroupLayout: (groupName: string) => Promise<GroupLayout>;
  getProteomeSummary: () => Promise<ProteomeSummaryRows>;
  getTaxons: () => Promise<TaxonEntries>;
}

export function isOrthoService(wdkService: WdkService): wdkService is OrthoService {
  return Object.keys(orthoServiceWrappers).every(
    orthoServiceKey => orthoServiceKey in wdkService
  );
}
