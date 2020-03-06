import React from 'react';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { StudyCard } from 'ebrc-client/App/Studies';
import { SearchCard } from 'ebrc-client/App/Searches';
import { ImageCard } from 'ebrc-client/App/ImageCard';
import { CategoryIcon } from 'ebrc-client/App/Categories';

import { studyMatchPredicate } from 'ebrc-client/util/homeContent';

export default ({ studies, searches, visualizations }) => ([
  {
    title: 'Explore the Studies',
    contentType: 'StudyCardList',
    contentNamePlural: 'studies',
    filters: Seq.from(studies.entities || [])
      .flatMap(study => study.categories)
      .uniq()
      .map(category => ({
        id: category,
        display: <CategoryIcon category={category}/>,
        predicate: study => study.categories.includes(category)
      }))
      .toArray(),
    items: studies.entities,
    isLoading: studies.loading,
    isExpandable: true,
    tableViewLink: '/search/dataset/Studies/result',
    cardComponent: StudyCard,
    getSearchStringForItem: item => 
      item.searchString,
    matchPredicate: studyMatchPredicate
  },
  {
    title: 'Explore Example Searches',
    description: 'ClinEpiDB can be used to employ a sophisticated search strategy system to explore study data. Use the example searches below to jump to saved strategies, view their results and get acquainted with ClinEpiDB capabilities.',
    viewAllAppUrl: '/app/workspace/strategies/public',
    contentType: 'SearchCardList',
    contentNamePlural: 'searches',
    items: searches.entities,
    isLoading: searches.loading,
    cardComponent: SearchCard,
    getSearchStringForItem: item =>
      item.name + ' ' + item.description
  },
  {
    title: 'Explore Visualization Tools',
    description: 'Gain clear insights into your data and illustrate powerful connections using our visualization and analysis tools. Use the brief examples below to get learn how to get started exploring data with these resources.',
    contentType: 'ImageCardList',
    contentNamePlural: 'visualization tools',
    items: visualizations.entities,
    isLoading: visualizations.loading,
    cardComponent: ImageCard,
    getSearchStringForItem: item =>
      item.title + ' ' + item.description
  }
]);
