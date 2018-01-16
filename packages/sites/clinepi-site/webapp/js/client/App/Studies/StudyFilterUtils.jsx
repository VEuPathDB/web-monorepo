import React from 'react';

import { ucFirst } from 'Client/App/Utils/Utils';
/* Filtering, defunct until we need study filtering again (AB, 1/8/18) */

export function createStudyCategoryPredicate (targetCategory) {
  return ({ categories } = {}) => {
    return !categories ? false : categories
      .map(category => category.toLowerCase())
      .includes(targetCategory.toLowerCase());
  };
};

export function createStudyCategoryFilter (id) {
  const display = (<label><CategoryIcon category={id} /> {ucFirst(id)}</label>);
  const predicate = createStudyCategoryPredicate(id);
  return { id, display, predicate };
};

export function getStudyListCategories (studies) {
  return studies
    .map(({ categories }) => categories)
    .filter(categories => categories && categories.length)
    .reduce((result, set) => {
      const additions = set.filter(cat => !result.includes(cat));
      return [ ...result, ...additions ];
    }, []);
};

export function getStudyCategoryFilters (studies) {
  const categories = getStudyListCategories(studies);
  return categories.map(createStudyCategoryFilter);
};
