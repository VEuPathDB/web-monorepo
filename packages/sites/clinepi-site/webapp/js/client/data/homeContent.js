import { StudyCard } from '@veupathdb/web-common/lib/App/Studies';
import { SearchCard } from '@veupathdb/web-common/lib/App/Searches';
import { ImageCard } from '@veupathdb/web-common/lib/App/ImageCard';

import { studyMatchPredicate, studyFilters } from '@veupathdb/web-common/lib/util/homeContent';

export default permissionsValue => ({ studies, searches, visualizations }) => ([
  {
    title: 'Explore the Studies',
    contentType: 'StudyCardList',
    contentNamePlural: 'studies',
    filters: studyFilters(studies),
    filtersLabel: 'disease',
    items: studies.entities,
    isLoading: studies.loading || permissionsValue.loading,
    isExpandable: true,
    tableViewLink: '/search/dataset/Studies/result',
    cardComponent: StudyCard,
    getSearchStringForItem: item => 
      item.searchString,
    matchPredicate: studyMatchPredicate,
    permissions: permissionsValue.permissions
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
