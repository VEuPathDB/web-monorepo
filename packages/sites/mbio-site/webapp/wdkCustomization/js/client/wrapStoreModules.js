import { compose, curryN, update, partition } from 'lodash/fp';
import { getLeaves } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

/** Compose reducer functions from right to left */
const composeReducers = (...reducers) => (state, action) =>
  reducers.reduceRight((state, reducer) => reducer(state, action), state);

const composeReducerWith = curryN(2, composeReducers);

export default compose(
  update('globalData.reduce', composeReducerWith(mbioGlobalData)),
  update('studies.reduce', composeReducerWith(applyCustomDisplayNameToStudySearches)),
  update('searchCards.reduce', composeReducerWith(applyCustomIconToSearchCards))
)


function mbioGlobalData(state, action) {
  switch(action.type) {
    // flatten search tree
    case 'static/all-data-loaded': return {
      ...state,
      searchTree: {
        children: getLeaves(state.searchTree, node => node.children)
      }
    }
    default: return state;
  }
}

function applyCustomDisplayNameToStudySearches(studies) {
  return {
    ...studies,
    entities: studies.entities && studies.entities.map(study => ({
      ...study,
      searches: study.searches.map(search => ({
        ...search,
        displayName: search.icon.toLowerCase().includes('details') ? 'Sample Details' : 'Taxon Abundance'
      }))
    }))
  };
}

const iconDirectiveRe = /^\s*#\s*iconType=(\w+)\s*$/;

function applyCustomIconToSearchCards(searchCards) {
  return {
    ...searchCards,
    entities: searchCards.entities && searchCards.entities.map(search => {
      const [ directives, descriptionLines ] = partition(line => iconDirectiveRe.test(line), search.description.split('\n'));
      const description = descriptionLines.join('\n').trim();
      const icon = directives.length === 0
        ? search.icon
        : getIconByType(directives[0].match(iconDirectiveRe)[1]);

      return {
        ...search,
        description,
        icon
      };
    })
  };
}

function getIconByType(type = '') {
  switch(type) {
    case 'taxon':
    case 'taxa':
      return 'ebrc-icon-taxaQuery_light';
    default:
      return 'ebrc-icon-sampleDetails_light';

  }
}
