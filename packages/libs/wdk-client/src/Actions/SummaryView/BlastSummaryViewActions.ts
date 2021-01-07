import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { BlastSummaryViewReport } from "wdk-client/Utils/WdkModel";
import {ResultType} from 'wdk-client/Utils/WdkResult';


export const requestBlastSummaryReport = makeActionCreator(
  'blastSummaryView/requestBlastSummaryReport',
  (viewId: string, resultType: ResultType) => ({ viewId, resultType })
);

export const fulfillBlastSummaryReport = makeActionCreator(
  'blastSummaryView/fulfillBlastSummaryReport',
  (viewId: string, resultType: ResultType, blastInfo: BlastSummaryViewReport) => ({ viewId, blastInfo, resultType })
);

export const rejectBlastSummaryReport = makeActionCreator(
  'blastSummaryView/rejectBlastSummaryReport',
  (viewId: string, message: string) => ({ viewId, message })
);

export type Action =
  | InferAction<typeof requestBlastSummaryReport>
  | InferAction<typeof fulfillBlastSummaryReport>
  | InferAction<typeof rejectBlastSummaryReport>
