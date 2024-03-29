import { MesaSortObject } from '@veupathdb/coreui/lib/components/Mesa/types';
import { makeActionCreator, InferAction } from '../Utils/ActionCreatorUtils';
import { StrategySummary } from '../Utils/WdkUser';

export const requestPublicStrategies = makeActionCreator(
  'publicStrategies/requestPublicStrategies'
);

export const fulfillPublicStrategies = makeActionCreator(
  'publicStrategies/fulfillPublicStrategies',
  (publicStrategies: StrategySummary[]) => ({ publicStrategies })
);

export const fulfillPublicStrategiesError = makeActionCreator(
  'publicStrategies/fulfillPublicStrategiesError'
);

export const setSearchTerm = makeActionCreator(
  'publicStrategies/setSearchTerm',
  (searchTerm: string) => ({ searchTerm })
);

export const setSort = makeActionCreator(
  'publicStrategies/setSort',
  (sort: MesaSortObject) => ({ sort })
);

export const setPrioritizeExamples = makeActionCreator(
  'publicStrategies/setPrioritizeExamples',
  (prioritizeExamples: boolean) => ({ prioritizeExamples })
);

export type Action =
  | InferAction<typeof requestPublicStrategies>
  | InferAction<typeof fulfillPublicStrategies>
  | InferAction<typeof fulfillPublicStrategiesError>
  | InferAction<typeof setSearchTerm>
  | InferAction<typeof setSort>
  | InferAction<typeof setPrioritizeExamples>;
