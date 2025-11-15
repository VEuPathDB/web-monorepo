import { keyBy, get } from 'lodash';

import { fetchStudies, Study } from '../../App/Studies/StudyActionCreators';
import { SearchCard } from './SearchCardReducer';
import WdkService from '@veupathdb/wdk-client/lib/Service/WdkService';
import { RecordClass } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { StrategySummary } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

export const SEARCHES_LOADING = 'search-cards/loading';
export const SEARCHES_LOADED = 'search-cards/loaded';
export const SEARCHES_ERROR = 'search-cards/error';

export type SearchesLoadingAction = {
  type: typeof SEARCHES_LOADING;
};

export type SearchesLoadedAction = {
  type: typeof SEARCHES_LOADED;
  payload: { searches: SearchCard[] };
};

export type SearchesErrorAction = {
  type: typeof SEARCHES_ERROR;
  payload: { error: string };
};

export type SearchesAction =
  | SearchesLoadingAction
  | SearchesLoadedAction
  | SearchesErrorAction;

export const loadSearches =
  (userEmails?: string[]) =>
  ({ wdkService }: { wdkService: WdkService }) =>
    [
      { type: SEARCHES_LOADING },
      fetchAndFormatSearches(wdkService, userEmails).then(
        (searches): SearchesLoadedAction => ({
          type: SEARCHES_LOADED,
          payload: { searches },
        }),
        (error): SearchesErrorAction => ({
          type: SEARCHES_ERROR,
          payload: { error: error.message },
        })
      ),
    ];

async function fetchAndFormatSearches(
  wdkService: WdkService,
  userEmails?: string[]
): Promise<SearchCard[]> {
  const [recordClasses, strategies, [studies]] = await Promise.all([
    wdkService.getRecordClasses(),
    userEmails
      ? wdkService.getPublicStrategies({ userEmail: userEmails })
      : wdkService.getPublicStrategies(),
    fetchStudies(wdkService),
  ]);

  const recordClassesByUrlSegment: Record<string, RecordClass> = keyBy(
    recordClasses,
    'urlSegment'
  );

  return strategies
    .filter((strategy: StrategySummary) => strategy.isValid)
    .map((strategy: StrategySummary): SearchCard => ({
      icon: get(
        recordClassesByUrlSegment[strategy.recordClassName ?? ''],
        'iconName',
        'question'
      ),
      recordClassDisplayName: get(
        recordClassesByUrlSegment[strategy.recordClassName ?? ''],
        'displayNamePlural',
        'Uknown record type'
      ),
      name: strategy.name,
      studyName: getStudyNameByRecordClassName(
        studies,
        strategy.recordClassName ?? ''
      ),
      appUrl: `/app/workspace/strategies/import/${strategy.signature}`,
      description: strategy.description ?? '',
    }));
}

function getStudyNameByRecordClassName(
  studies: Study[],
  recordClassName: string
): string | undefined {
  const study = studies.find((study) => recordClassName.startsWith(study.id));
  return study && study.name;
}
