import * as GenomeSummaryViewActions from './GenomeSummaryViewActions';
import { Action as WdkActions } from '@veupathdb/wdk-client/lib/Actions'

export {
  GenomeSummaryViewActions,
};

export type Action =
  | GenomeSummaryViewActions.Action
  | WdkActions
