import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import {
  ProteomeSummaryRows,
  proteomeSummaryRowsDecoder,
} from 'ortho-client/utils/dataSummary';
import {
  GroupLayoutResponse,
  groupLayoutResponseDecoder,
} from 'ortho-client/utils/groupLayout';
import { TaxonEntries, taxonEntriesDecoder } from 'ortho-client/utils/taxons';
import {
  GroupTreeResponse,
  groupTreeResponseDecoder,
} from 'ortho-client/utils/tree';

export function wrapWdkService(wdkService: WdkService): OrthoService {
  return {
    ...wdkService,
    getGroupLayout: orthoServiceWrappers.getGroupLayout(wdkService),
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
  getGroupTree: (wdkService: WdkService) => (groupName: string) =>
    wdkService.sendRequest(groupTreeResponseDecoder, {
      useCache: true,
      method: 'get',
      path: `/newick-protein-tree/${groupName}`,
    }),
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
  getGroupTree: (groupName: string) => Promise<GroupTreeResponse>;
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
