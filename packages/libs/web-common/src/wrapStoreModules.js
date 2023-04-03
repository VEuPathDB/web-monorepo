// import { compose, curryN, set, update } from 'lodash/fp';
import {
  SITE_CONFIG_LOADED,
  BASKETS_LOADED,
  QUICK_SEARCH_LOADED,
} from './actioncreators/GlobalActionCreators';
import * as contactUs from './store-modules/ContactUsStoreModule';
import { getSearchMenuCategoryTree } from './util/category';
import { selectReporterComponent } from './util/reporter';

import * as galaxyTerms from './store-modules/GalaxyTerms';

import reduceStudies from './App/Studies/StudyReducer';
import reduceDataRestriction from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionReducer';
import reduceSearchCards from './App/Searches/SearchCardReducer';
import { newsReducer } from './App/NewsSidebar/NewsModule';

/** Compose reducer functions from right to left */
// const composeReducers = (...reducers) => (state, action) =>
// reducers.reduceRight((state, reducer) => reducer(state, action), state);

// const composeReducerWith = curryN(2, composeReducers);

export default (storeModules) => ({
  ...storeModules,
  searchCards: {
    key: 'searchCards',
    reduce: reduceSearchCards,
  },
  studies: {
    key: 'studies',
    reduce: reduceStudies,
  },
  dataRestriction: {
    key: 'dataRestriction',
    reduce: reduceDataRestriction,
  },
  newsSidebar: {
    key: 'newsSidebar',
    reduce: newsReducer,
  },
  galaxyTerms,
  contactUs,
  globalData: {
    ...storeModules.globalData,
    reduce: (state, action) => {
      state = storeModules.globalData.reduce(state, action);
      return ebrcGlobalData(state, action);
    },
  },
  downloadForm: {
    ...storeModules.downloadForm,
    reduce: storeModules.downloadForm.makeReducer(selectReporterComponent),
  },
});

// export default compose(
//   set('searchCards', { key: 'searchCards', reduce: reduceSearchCards }),
//   set('studies', { key: 'studies', reduce: reduceStudies }),
//   set('dataRestriction', { key: 'dataRestriction', reduce: reduceDataRestriction }),
//   set('newsSidebar', { key: 'newsSidebar', reduce: newsReducer }),
//   set('contactUs', contactUs),
//   set('galaxyTerms', galaxyTerms),
//   update('globalData.reduce', composeReducerWith(ebrcGlobalData)),
//   update('downloadForm', module => ({ ...module, reduce: module.makeReducer(selectReporterComponent) }))
// );

function ebrcGlobalData(state, { type, payload }) {
  switch (type) {
    case SITE_CONFIG_LOADED:
      return Object.assign({}, state, {
        siteConfig: payload.siteConfig,
      });

    case BASKETS_LOADED:
      return Object.assign({}, state, {
        basketCounts: payload.basketCounts,
      });

    case QUICK_SEARCH_LOADED:
      return Object.assign({}, state, {
        quickSearches: payload.questions,
        quickSearchesLoading: false,
      });

    case 'static/all-data-loaded':
      return {
        ...state,
        searchTree: getSearchMenuCategoryTree(
          state.ontology,
          state.recordClasses
        ),
      };

    default:
      return state;
  }
}
