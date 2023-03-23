import React from 'react';

import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  parseSearchQueryString,
  areTermsInString,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

import { CategoryIcon } from '../App/Categories';

export function studyFilters(studies) {
  return Seq.from(studies.entities || [])
    .flatMap((study) => study.categories)
    .orderBy((c) => c)
    .uniq()
    .map((category) => ({
      id: category,
      display: <CategoryIcon category={category} />,
      predicate: (study) => study.categories.includes(category),
    }))
    .toArray();
}

export function studyMatchPredicate(searchString, filterString) {
  const terms = parseSearchQueryString(filterString);
  return areTermsInString(terms, searchString);
}
