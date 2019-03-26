import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { GenomeSummaryViewReport, RecordClass } from "wdk-client/Utils/WdkModel";

export const requestGenomeSummaryReport = makeActionCreator(
    'genomeSummaryView/requestGenomeSummaryReport',
    (stepId: number) => ({ stepId })
    );

export const fulfillGenomeSummaryReport = makeActionCreator(
        'genomeSummaryView/fulfillGenomeSummaryReport',
        (genomeSummaryViewReport: GenomeSummaryViewReport, recordClass: RecordClass) => ({ genomeSummaryViewReport, recordClass })
        );
    
export const showRegionDialog = makeActionCreator(
    'genomeSummaryView/showRegionDialog',
    (regionId: string) => ({ regionId })
);

export const hideRegionDialog = makeActionCreator(
    'genomeSummaryView/hideRegionDialog',
    (regionId: string) => ({ regionId })
);

export const applyEmptyChromosomesFilter = makeActionCreator(
    'genomeSummaryView/applyEmptyChromosomesFilter'
);

export const unapplyEmptyChromosomesFilter = makeActionCreator(
    'genomeSummaryView/unapplyEmptyChromosomesFilter'
);

export type Action =
    | InferAction<typeof requestGenomeSummaryReport>
    | InferAction<typeof fulfillGenomeSummaryReport>
    | InferAction<typeof showRegionDialog>
    | InferAction<typeof hideRegionDialog>
    | InferAction<typeof applyEmptyChromosomesFilter>
    | InferAction<typeof unapplyEmptyChromosomesFilter>;
