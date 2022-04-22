import * as BlastSummaryViewActions from './BlastSummaryViewActions';
import * as GenomeSummaryViewActions from './GenomeSummaryViewActions';
import { Action as WdkActions} from '@veupathdb/wdk-client/lib/Actions'

export {
  BlastSummaryViewActions,
  GenomeSummaryViewActions,
};

export type Action =
  | BlastSummaryViewActions.Action
  | GenomeSummaryViewActions.Action
  | WdkActions
