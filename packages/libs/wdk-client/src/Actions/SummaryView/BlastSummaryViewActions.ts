import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { BlastSummaryViewReport } from "wdk-client/Utils/WdkModel";


export const requestBlastSummaryReport = makeActionCreator(
  'blastSummaryView/requestBlastSummaryReport',
  (stepId: number) => ({ stepId })
);

export const fulfillBlastSummaryReport = makeActionCreator(
  'blastSummaryView/fulfillBlastSummaryReport',
  (blastInfo: BlastSummaryViewReport) => ({ blastInfo })
);

export type Action =
  | InferAction<typeof requestBlastSummaryReport>
  | InferAction<typeof fulfillBlastSummaryReport>
