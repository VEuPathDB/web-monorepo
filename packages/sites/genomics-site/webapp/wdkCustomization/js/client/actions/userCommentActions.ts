import * as UserCommentFormActions from './UserCommentFormActions';
import * as UserCommentShowActions from './UserCommentShowActions';

export {
    UserCommentFormActions,
    UserCommentShowActions
};

export type Action =
  | UserCommentFormActions.Action
  | UserCommentShowActions.Action
