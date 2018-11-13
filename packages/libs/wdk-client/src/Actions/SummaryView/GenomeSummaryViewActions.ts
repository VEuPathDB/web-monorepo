import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { GenomeSummaryViewReport } from "wdk-client/Utils/WdkModel";

export const requestGenomeSummaryReport = makeActionCreator(
    'genomeSummaryView/requestGenomeSummaryReport',
    (stepId: number) => ({ stepId })
    );

export const fulfillGenomeSummaryReport = makeActionCreator(
        'genomeSummaryView/fulfillGenomeSummaryReport',
        (genomeSummaryViewReport: GenomeSummaryViewReport) => ({ genomeSummaryViewReport })
        );
    
export type Action =
    | InferAction<typeof requestGenomeSummaryReport>
    | InferAction<typeof fulfillGenomeSummaryReport>
