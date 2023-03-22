import * as UserCommentFormActions from './UserCommentFormActions';
import * as UserCommentShowActions from './UserCommentShowActions';
import { Action as StaticDataActions } from '@veupathdb/wdk-client/lib/Actions/StaticDataActions'

export {
    UserCommentFormActions,
    UserCommentShowActions
};

export type Action =
  | UserCommentFormActions.Action
  | UserCommentShowActions.Action
  | StaticDataActions
