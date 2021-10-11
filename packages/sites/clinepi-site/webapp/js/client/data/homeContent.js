import { StudyCard } from '@veupathdb/web-common/lib/App/Studies';
import { AnalysisCard } from '@veupathdb/web-common/lib/App/Analyses';

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
    tableViewLinkText: 'Study summaries table',
    cardComponent: StudyCard,
    getSearchStringForItem: item => 
      item.searchString,
    matchPredicate: studyMatchPredicate,
    permissions: permissionsValue.permissions
  },
  {
    title: 'Explore Example Analyses',
    description: 'ClinEpiDB can be used to explore and visualize study data. Use the example analyses below to see some examples.',
    viewAllAppUrl: '/app/workspace/analyses/public',
    contentType: 'AnalysisCardList',
    contentNamePlural: 'analyses',
    items: searches.entities,
    isLoading: searches.loading,
    cardComponent: AnalysisCard,
    getSearchStringForItem: item =>
      item.name + ' ' + item.description,
    loadItems,
  },
]);

async function loadItems({ analysisClient, wdkService }) {
  const overviews = await analysisClient.getPublicAnalyses();
  const studies = await wdkService.getStudies();
  return overviews.flatMap(overview => {
    const study = studies.records.find(study => study.attributes.dataset_id === overview.studyId);
    if (study == null) return [];
    return [{
      displayName: overview.displayName,
      studyDisplayName: study.displayName,
      description: overview.description,
      studyId: overview.studyId,
      analysisId: overview.analysisId,
      ownerUserId: overview.userId,
      ownerName: overview.userName,
    }];
  });
}