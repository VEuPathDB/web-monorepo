import {
  makeActionCreator,
  InferAction
} from 'wdk-client/Utils/ActionCreatorUtils';
import {
  GenomeSummaryViewReport,
  RecordClass
} from 'wdk-client/Utils/WdkModel';
import {ResultType} from 'wdk-client/Utils/WdkResult';

export const requestGenomeSummaryReport = makeActionCreator(
  'genomeSummaryView/requestGenomeSummaryReport',
  (viewId: string, resultType: ResultType) => ({ viewId, resultType })
);

export const fulfillGenomeSummaryReport = makeActionCreator(
  'genomeSummaryView/fulfillGenomeSummaryReport',
  (
    viewId: string,
    genomeSummaryViewReport: GenomeSummaryViewReport,
    recordClass: RecordClass
  ) => ({ viewId, genomeSummaryViewReport, recordClass })
);

export const rejectGenomeSummaryReport = makeActionCreator(
  'genomeSummaryView/rejectGenomeSummaryReport',
  (viewId: string, message: string) => ({ viewId, message })
);

export const showRegionDialog = makeActionCreator(
  'genomeSummaryView/showRegionDialog',
  (viewId: string, regionId: string) => ({ viewId, regionId })
);

export const hideRegionDialog = makeActionCreator(
  'genomeSummaryView/hideRegionDialog',
  (viewId: string, regionId: string) => ({ viewId, regionId })
);

export const applyEmptyChromosomesFilter = makeActionCreator(
  'genomeSummaryView/applyEmptyChromosomesFilter',
  (viewId: string) => ({ viewId })
);

export const unapplyEmptyChromosomesFilter = makeActionCreator(
  'genomeSummaryView/unapplyEmptyChromosomesFilter',
  (viewId: string) => ({ viewId })
);

export type Action =
  | InferAction<typeof requestGenomeSummaryReport>
  | InferAction<typeof fulfillGenomeSummaryReport>
  | InferAction<typeof rejectGenomeSummaryReport>
  | InferAction<typeof showRegionDialog>
  | InferAction<typeof hideRegionDialog>
  | InferAction<typeof applyEmptyChromosomesFilter>
  | InferAction<typeof unapplyEmptyChromosomesFilter>;
