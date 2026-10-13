import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// DatasetManagement transitively imports the Sharing components, which pull
// in @veupathdb/wdk-client/lib/Components (a barrel that includes
// jquery-dependent AttributeFilter views). jquery is not declared as a
// dependency of this package, so it cannot resolve under Jest. Stub the
// barrel out; selectDatasetSearches is a pure function and needs no UI.
jest.mock('@veupathdb/wdk-client/lib/Components', () => ({}));

import { selectDatasetSearches } from './DatasetManagement';

function makeQuestion(fullName: string, userDatasetType?: string): Question {
  return {
    fullName,
    urlSegment: fullName,
    displayName: fullName,
    shortDisplayName: fullName,
    outputRecordClassName: 'record-class',
    groups: [],
    defaultAttributes: [],
    defaultSorting: [],
    dynamicAttributes: [],
    defaultSummaryView: 'default',
    noSummaryOnSingleRecord: false,
    summaryViewPlugins: [],
    filters: [],
    isAnalyzable: false,
    paramNames: [],
    isCacheable: false,
    properties: userDatasetType
      ? { userDatasetType: [userDatasetType] }
      : undefined,
  };
}

describe('selectDatasetSearches', () => {
  it('prefers the fetched searches when they match the current dataset type', () => {
    const fetched = makeQuestion('rnaseq_fetched');
    const fromMap = makeQuestion('rnaseq_from_map', 'rnaseq');

    const result = selectDatasetSearches(
      'rnaseq',
      { userDatasetType: 'rnaseq', searches: [fetched] },
      { [fromMap.fullName]: fromMap }
    );

    expect(result).toEqual([fetched]);
  });

  // Regression test for the cross-dataset leak: watching dataset A (type
  // rnaseq) install stores rnaseq searches in the slice. Navigating to
  // already-installed dataset B (type genelist) must NOT render A's rnaseq
  // searches under B's datasetId links — it must fall back to questionMap.
  it('falls back to questionMap when the fetched searches are for a different dataset type', () => {
    const staleRnaseqSearch = makeQuestion('rnaseq_search');
    const genelistFromMap = makeQuestion('genelist_from_map', 'genelist');
    const otherFromMap = makeQuestion('other_from_map', 'other');

    const result = selectDatasetSearches(
      'genelist',
      { userDatasetType: 'rnaseq', searches: [staleRnaseqSearch] },
      {
        [genelistFromMap.fullName]: genelistFromMap,
        [otherFromMap.fullName]: otherFromMap,
      }
    );

    expect(result).toEqual([genelistFromMap]);
    expect(result).not.toContain(staleRnaseqSearch);
  });

  it('prefers an empty fetched result when it matches the current type, rather than falling back', () => {
    const fromMap = makeQuestion('genelist_from_map', 'genelist');

    const result = selectDatasetSearches(
      'genelist',
      { userDatasetType: 'genelist', searches: [] },
      { [fromMap.fullName]: fromMap }
    );

    expect(result).toEqual([]);
  });

  it('falls back to questionMap when there are no fetched searches at all', () => {
    const fromMap = makeQuestion('genelist_from_map', 'genelist');

    const result = selectDatasetSearches('genelist', undefined, {
      [fromMap.fullName]: fromMap,
    });

    expect(result).toEqual([fromMap]);
  });
});
