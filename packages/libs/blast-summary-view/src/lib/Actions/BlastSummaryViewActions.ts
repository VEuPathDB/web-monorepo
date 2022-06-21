import {
  makeActionCreator,
  InferAction,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';

import { BlastSummaryViewReport } from '../Utils/types';

export const requestBlastSummaryReport = makeActionCreator(
  'blastSummaryView/requestBlastSummaryReport',
  (viewId: string, resultType: ResultType) => ({ viewId, resultType })
);

export const fulfillBlastSummaryReport = makeActionCreator(
  'blastSummaryView/fulfillBlastSummaryReport',
  (
    viewId: string,
    resultType: ResultType,
    blastInfo: BlastSummaryViewReport
  ) => ({ viewId, blastInfo, resultType })
);

export const rejectBlastSummaryReport = makeActionCreator(
  'blastSummaryView/rejectBlastSummaryReport',
  (viewId: string, message: string) => ({ viewId, message })
);

export type Action =
  | InferAction<typeof requestBlastSummaryReport>
  | InferAction<typeof fulfillBlastSummaryReport>
  | InferAction<typeof rejectBlastSummaryReport>;
