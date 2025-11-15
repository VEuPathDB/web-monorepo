import React from 'react';

import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  parseSearchQueryString,
  areTermsInString,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

import { CategoryIcon } from '../App/Categories';

export function studyFilters(studies: any): any[] {
  return Seq.from(studies.entities || [])
    .flatMap((study: any) => study.categories)
    .orderBy((c: string) => c)
    .uniq()
    .map((category: string) => ({
      id: category,
      display: <CategoryIcon category={category} />,
      predicate: (study: any) => study.categories.includes(category),
    }))
    .toArray();
}

export function studyMatchPredicate(
  searchString: string,
  filterString: string
): boolean {
  const terms = parseSearchQueryString(filterString);
  return areTermsInString(terms, searchString);
}
