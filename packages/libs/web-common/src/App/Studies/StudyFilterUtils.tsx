import React from 'react';

import { ucFirst } from '../../App/Utils/Utils';
import { CategoryIcon } from '../Categories';
/* Filtering, defunct until we need study filtering again (AB, 1/8/18) */

interface StudyWithCategories {
  categories?: string[];
}

interface StudyFilter {
  id: string;
  display: JSX.Element;
  predicate: (study: StudyWithCategories) => boolean;
}

export function createStudyCategoryPredicate(
  targetCategory: string
): (study: StudyWithCategories) => boolean {
  return ({ categories }: StudyWithCategories = {}) => {
    return !categories
      ? false
      : categories
          .map((category) => category.toLowerCase())
          .includes(targetCategory.toLowerCase());
  };
}

export function createStudyCategoryFilter(id: string): StudyFilter {
  const display = (
    <label>
      <CategoryIcon category={id} /> {ucFirst(id)}
    </label>
  );
  const predicate = createStudyCategoryPredicate(id);
  return { id, display, predicate };
}

export function getStudyListCategories(
  studies: StudyWithCategories[]
): string[] {
  return studies
    .map(({ categories }) => categories)
    .filter(
      (categories): categories is string[] =>
        categories != null && categories.length > 0
    )
    .reduce((result, set) => {
      const additions = set.filter((cat) => !result.includes(cat));
      return [...result, ...additions];
    }, [] as string[]);
}

export function getStudyCategoryFilters(
  studies: StudyWithCategories[]
): StudyFilter[] {
  const categories = getStudyListCategories(studies);
  return categories.map(createStudyCategoryFilter);
}
