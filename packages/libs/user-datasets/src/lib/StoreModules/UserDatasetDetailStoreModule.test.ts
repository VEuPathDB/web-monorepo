import { Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// UserDatasetsActions transitively imports the Sharing components, which
// pull in @veupathdb/wdk-client/lib/Components (a barrel that includes
// jquery-dependent AttributeFilter views). jquery is not declared as a
// dependency of this package, so it cannot resolve under Jest. Stub the
// barrel out; only action creators/types are needed here, not any UI.
jest.mock('@veupathdb/wdk-client/lib/Components', () => ({}));

import { searchesReceived } from '../Actions/UserDatasetsActions';
import { reduce, State } from './UserDatasetDetailStoreModule';

function makeQuestion(fullName: string): Question {
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
  };
}

const baseState: State = {
  userDatasetUpdating: false,
  userDatasetLoading: false,
  userDatasetRemoving: false,
  sharingModalOpen: false,
  sharingDatasetPending: false,
  shareError: undefined,
  shareSuccessful: undefined,
  updateDatasetCommunityVisibilityError: undefined,
  updateDatasetCommunityVisibilityPending: false,
  updateDatasetCommunityVisibilitySuccess: false,
  serviceMetadata: undefined,
};

describe('UserDatasetDetailStoreModule reducer', () => {
  describe('SEARCHES_RECEIVED', () => {
    it('stores the searches tagged with the dataset type they were fetched for', () => {
      const rnaseqQuestion = makeQuestion('rnaseq_search');

      const nextState = reduce(
        baseState,
        searchesReceived('rnaseq', [rnaseqQuestion])
      );

      expect(nextState.userDatasetSearches).toEqual({
        userDatasetType: 'rnaseq',
        searches: [rnaseqQuestion],
      });
    });

    it('overwrites searches stored for a previous dataset type, but still tags them correctly', () => {
      const rnaseqQuestion = makeQuestion('rnaseq_search');
      const genelistQuestion = makeQuestion('genelist_search');

      const afterFirst = reduce(
        baseState,
        searchesReceived('rnaseq', [rnaseqQuestion])
      );
      const afterSecond = reduce(
        afterFirst,
        searchesReceived('genelist', [genelistQuestion])
      );

      // Regression guard for the cross-dataset leak: consumers must be able
      // to tell that the stored searches no longer belong to 'rnaseq' just
      // by inspecting the stored type, without having to compare search
      // contents. If this ever regresses to a bare array with no recorded
      // type, this assertion has nothing to check against and the leak is
      // undetectable from the reducer alone.
      expect(afterSecond.userDatasetSearches?.userDatasetType).toBe('genelist');
      expect(afterSecond.userDatasetSearches?.searches).toEqual([
        genelistQuestion,
      ]);
    });

    it('records an empty result together with the type it was fetched for', () => {
      const nextState = reduce(baseState, searchesReceived('genelist', []));

      expect(nextState.userDatasetSearches).toEqual({
        userDatasetType: 'genelist',
        searches: [],
      });
    });
  });
});
