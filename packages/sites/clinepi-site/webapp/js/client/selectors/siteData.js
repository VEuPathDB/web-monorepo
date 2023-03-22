import { get } from 'lodash';

import visualizations from '../data/visualizations.json';

export const getEntities = name => state =>
  get(state, name);

export const getSearches = getEntities('searchCards');
export const getStudies = getEntities('studies')

export const getStaticSiteData = state => ({
  studies: getStudies(state),
  searches: getSearches(state),
  visualizations: { isLoading: false, entities: visualizations }
});

export const getStudyByQuestionName = questionName => state =>
  get(getStudies(state), 'entities', []).find(study =>
    study.searches.some(search => search.name === questionName)
  );
