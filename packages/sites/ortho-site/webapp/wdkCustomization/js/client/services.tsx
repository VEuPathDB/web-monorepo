import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import { wrapWdkService as addMultiBlastService } from '@veupathdb/multi-blast/lib/utils/wdkServiceIntegration';

import {
  ProteomeSummaryRows,
  proteomeSummaryRowsDecoder,
} from 'ortho-client/utils/dataSummary';
import {
  GroupLayoutResponse,
  groupLayoutResponseDecoder,
} from 'ortho-client/utils/groupLayout';
import { TaxonEntries, taxonEntriesDecoder } from 'ortho-client/utils/taxons';

export function wrapWdkService(wdkService: WdkService): OrthoService {
  return {
    ...addMultiBlastService(wdkService),
    getGroupLayout: orthoServiceWrappers.getGroupLayout(wdkService),
    getGroupTreeUrl: orthoServiceWrappers.getGroupTreeUrl(wdkService),
    getGroupTree: orthoServiceWrappers.getGroupTree(wdkService),
    getProteomeSummary: orthoServiceWrappers.getProteomeSummary(wdkService),
    getTaxons: orthoServiceWrappers.getTaxons(wdkService),
  };
}

const orthoServiceWrappers = {
  getGroupLayout: (wdkService: WdkService) => (groupName: string) =>
    wdkService.sendRequest(groupLayoutResponseDecoder, {
      useCache: true,
      method: 'get',
      path: `/group/${groupName}/layout`,
    }),
  getGroupTreeUrl: (wdkService: WdkService) => (groupName: string) =>
    wdkService.serviceUrl + '/newick-protein-tree/' + groupName,
  getGroupTree: (wdkService: WdkService) => (groupName: string) =>
    // this endpoint does not return json, so no need to use helper
    // method `sendRequest`
    window
      .fetch(`${wdkService.serviceUrl}/newick-protein-tree/${groupName}`)
      .then((resp) => resp.text()),
  getProteomeSummary: (wdkService: WdkService) => () =>
    wdkService.sendRequest(proteomeSummaryRowsDecoder, {
      useCache: true,
      method: 'get',
      path: '/data-summary/proteomes',
    }),
  getTaxons: (wdkService: WdkService) => () =>
    wdkService.sendRequest(taxonEntriesDecoder, {
      useCache: true,
      method: 'get',
      path: '/data-summary/taxons',
    }),
};

export interface OrthoService extends WdkService {
  getGroupLayout: (groupName: string) => Promise<GroupLayoutResponse>;
  getGroupTreeUrl: (groupName: string) => string;
  getGroupTree: (groupName: string) => Promise<string>;
  getProteomeSummary: () => Promise<ProteomeSummaryRows>;
  getTaxons: () => Promise<TaxonEntries>;
}

export function isOrthoService(
  wdkService: WdkService
): wdkService is OrthoService {
  return Object.keys(orthoServiceWrappers).every(
    (orthoServiceKey) => orthoServiceKey in wdkService
  );
}
