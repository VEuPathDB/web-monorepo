import React from 'react';

import { Seq } from 'wdk-client/Utils/IterableUtils';
import { parseSearchQueryString, areTermsInString } from 'wdk-client/Utils/SearchUtils';

import { CategoryIcon } from 'ebrc-client/App/Categories';

export function studyFilters(studies) {
  return Seq.from(studies.entities || [])
    .flatMap(study => study.categories)
    .orderBy(c => c)
    .uniq()
    .map(category => ({
      id: category,
      display: <CategoryIcon category={category}/>,
      predicate: study => study.categories.includes(category)
    }))
    .toArray();
}

export function studyMatchPredicate(searchString, filterString) {
  const terms = parseSearchQueryString(filterString);
  return areTermsInString(terms, searchString);
}
