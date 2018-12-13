import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { AttributesConfig, Pagination, AttributeSortingSpec } from "wdk-client/Utils/WdkModel"
import { Answer } from "wdk-client/Utils/WdkModel";
import { PrimaryKey } from "wdk-client/Utils/WdkModel";

export const openTranscriptsSummaryView = makeActionCreator(
    'transcriptsSummaryView/open',
    (stepId: number) => ({ stepId })
    );
 
