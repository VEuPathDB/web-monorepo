import { makeActionCreator, InferAction } from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';
import { UserCommentGetResponse } from '../types/userCommentTypes';

export const openUserCommentShow = makeActionCreator(
  'user-comment-show/open-user-comment-show',
  (targetType: string, targetId: string) => ({ targetType, targetId })
);

export const closeUserCommentShow = makeActionCreator(
  'user-comment-show/close-user-comment-show',
  () => ({ })
);

export const fulfillUserComments = makeActionCreator(
  'user-comment-show/fulfill-user-comments',
  (targetType: string, targetId: string, userComments: UserCommentGetResponse[]) => ({ targetType, targetId, userComments })
);

export const requestDeleteUserComment = makeActionCreator(
  'user-comment-show/request-delete-user-comment',
  (commentId: number) => ({ commentId })
);

export const fulfillDeleteUserComment = makeActionCreator(
  'user-comment-show/fulfill-delete-user-comment',
  (commentId: number) => ({ commentId })
);

export type Action =
  | InferAction<typeof openUserCommentShow>
  | InferAction<typeof closeUserCommentShow>
  | InferAction<typeof fulfillUserComments>
  | InferAction<typeof requestDeleteUserComment>
  | InferAction<typeof fulfillDeleteUserComment>;
