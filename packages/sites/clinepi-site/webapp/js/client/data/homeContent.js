export default ({ studies, searches, visualizations }) => ([
  {
    title: 'Explore the Studies',
    contentType: 'StudyCardList',
    items: studies.entities,
    isLoading: studies.loading
  },
  {
    title: 'Explore Example Searches',
    description: 'ClinEpiDB can be used to employ a sophisticated search strategy system to explore study data. Use the example searches below to jump to saved strategies, view their results and get acquainted with ClinEpiDB capabilities.',
    viewAllAppUrl: '/showApplication.do?tab=public_strat',
    contentType: 'SearchCardList',
    items: searches.entities,
    isLoading: searches.loading
  },
  {
    title: 'Explore Visualization Tools',
    description: 'Gain clear insights into your data and illustrate powerful connections using our visualization and analysis tools. Use the brief tutorials below to get learn how to get started exploring data with these resources.',
    contentType: 'ImageCardList',
    items: visualizations.entities,
    isLoading: visualizations.loading
  }
]);
