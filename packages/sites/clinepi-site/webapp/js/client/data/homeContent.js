import { StudyCard } from 'ebrc-client/App/Studies';
import { SearchCard } from 'ebrc-client/App/Searches';
import { ImageCard } from 'ebrc-client/App/ImageCard';

export default ({ studies, searches, visualizations }) => ([
  {
    title: 'Explore the Studies',
    contentType: 'StudyCardList',
    contentNamePlural: 'studies',
    items: studies.entities,
    isLoading: studies.loading,
    isExpandable: true,
    cardComponent: StudyCard,
    getSearchStringForItem: item => 
      item.name + ' ' + item.headLine + ' ' + item.points.join(' ')
  },
  {
    title: 'Explore Example Searches',
    description: 'ClinEpiDB can be used to employ a sophisticated search strategy system to explore study data. Use the example searches below to jump to saved strategies, view their results and get acquainted with ClinEpiDB capabilities.',
    viewAllAppUrl: '/showApplication.do?tab=public_strat',
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
