import { Action } from '../actions/userCommentActions';
import { UserCommentGetResponse } from '../types/userCommentTypes';
import {
  fulfillUserComments,
  openUserCommentShow,
  closeUserCommentShow,
  requestDeleteUserComment,
  fulfillDeleteUserComment,
} from '../actions/UserCommentShowActions';
import {
  takeEpicInWindow,
  mergeMapRequestActionsToEpic as mrate,
  InferAction,
} from '@veupathdb/wdk-client/lib/Utils/ActionCreatorUtils';

import { combineEpics, StateObservable } from 'redux-observable';
import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';
import { allDataLoaded } from '@veupathdb/wdk-client/lib/Actions/StaticDataActions';
import { isGenomicsService } from '../wrapWdkService';

const USER_COMMENTS_ERR_MSG =
  'Tried to use a UserComments method via a misconfigured GenomicsService';

export const key = 'userCommentShow';

export type UserCommentShowState = {
  userComments: UserCommentGetResponse[];
  loadingUser: boolean;
  loadingUserComments: boolean;
};

const initialState: UserCommentShowState = {
  userComments: [],
  loadingUser: true,
  loadingUserComments: true,
};

export const reduce = (
  state: UserCommentShowState = initialState,
  action: Action
): UserCommentShowState => {
  switch (action.type) {
    case openUserCommentShow.type: {
      return {
        ...state,
        loadingUserComments: true,
      };
    }
    case allDataLoaded.type: {
      return {
        ...state,
        loadingUser: false,
      };
    }
    case fulfillUserComments.type: {
      return {
        ...state,
        userComments: action.payload.userComments,
        loadingUserComments: false,
      };
    }
    case requestDeleteUserComment.type: {
      return {
        ...state,
        userComments: state.userComments.filter(
          ({ id }) => id !== action.payload.commentId
        ),
      };
    }
    default: {
      return state;
    }
  }
};

async function getFulfillUserComments(
  [openAction]: [InferAction<typeof openUserCommentShow>],
  state$: StateObservable<UserCommentShowState>,
  { wdkService }: EpicDependencies
) {
  if (!isGenomicsService(wdkService)) {
    throw new Error(USER_COMMENTS_ERR_MSG);
  }
  return fulfillUserComments(
    openAction.payload.targetType,
    openAction.payload.targetId,
    await wdkService.getUserComments(
      openAction.payload.targetType,
      openAction.payload.targetId
    )
  );
}

async function getFulfillDeleteUserComment(
  [requestAction]: [InferAction<typeof requestDeleteUserComment>],
  state$: StateObservable<UserCommentShowState>,
  { wdkService }: EpicDependencies
) {
  if (!isGenomicsService(wdkService)) {
    throw new Error(USER_COMMENTS_ERR_MSG);
  }
  await wdkService.deleteUserComment(requestAction.payload.commentId);

  return fulfillDeleteUserComment(requestAction.payload.commentId);
}

export const observe = takeEpicInWindow(
  {
    startActionCreator: openUserCommentShow,
    endActionCreator: closeUserCommentShow,
  },
  combineEpics(
    mrate([openUserCommentShow], getFulfillUserComments),
    mrate([requestDeleteUserComment], getFulfillDeleteUserComment)
  )
);
