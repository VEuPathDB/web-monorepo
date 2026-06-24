import React, { ReactNode } from 'react';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import PageController from '@veupathdb/wdk-client/lib/Core/Controllers/PageController';
import { RootState, UserCommentGetResponse } from '../types/userCommentTypes';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { createSelector } from 'reselect';
import { UserCommentShowState } from '../storeModules/UserCommentShowStoreModule';
import {
  openUserCommentShow,
  requestDeleteUserComment,
} from '../actions/UserCommentShowActions';
import {
  UserCommentShowViewProps,
  UserCommentShowView,
} from '../components/userComments/UserCommentShow/UserCommentShowView';
import { GlobalData } from '@veupathdb/wdk-client/lib/StoreModules/GlobalData';
import { get, capitalize } from 'lodash';
import { Link } from '@veupathdb/wdk-client/lib/Components';

type StateProps = {
  userId: number;
  documentTitle: string;
  userComments: UserCommentGetResponse[];
  loading: boolean;
  title: ReactNode;
  webAppUrl: string;
};

type DispatchProps = {
  loadUserComments: (targetType: string, targetId: string) => void;
  deleteUserComment: (commentId: number) => void;
};

type OwnProps = {
  targetType: string;
  targetId: string;
  initialCommentId?: number;
};

type MergedProps = UserCommentShowViewProps & {
  documentTitle: string;
  loading: boolean;
  loadUserComments: (targetType: string, targetId: string) => void;
  targetType: string;
  targetId: string;
};

type Props = MergedProps;

const globalData = ({ globalData }: RootState) => globalData;
const userCommentShow = ({ userCommentShow }: RootState) => userCommentShow;

const targetType = (state: RootState, props: OwnProps) => {
  return props.targetType;
};

const targetId = (state: RootState, props: OwnProps) => {
  return props.targetId;
};

const userId = createSelector<RootState, GlobalData, number>(
  globalData,
  (globalData: GlobalData) => get(globalData, 'user.id', 0)
);

const webAppUrl = createSelector<RootState, GlobalData, string>(
  globalData,
  (globalData: GlobalData) => get(globalData, 'siteConfig.webAppUrl', '')
);

const documentTitle = createSelector(
  globalData,
  targetId,
  (globalDataState: GlobalData, targetId: string) => {
    const displayName = get(globalDataState, 'config.displayName', '');

    return displayName
      ? `${displayName}.org :: User Comments on ${targetId}`
      : displayName;
  }
);

const userComments = createSelector<
  RootState,
  UserCommentShowState,
  UserCommentGetResponse[]
>(userCommentShow, ({ userComments }) => userComments);

const loadingUser = createSelector<RootState, UserCommentShowState, boolean>(
  userCommentShow,
  ({ loadingUser }) => loadingUser
);

const loadingUserComments = createSelector<
  RootState,
  UserCommentShowState,
  boolean
>(userCommentShow, ({ loadingUserComments }) => loadingUserComments);

const loading = createSelector<RootState, boolean, boolean, boolean>(
  loadingUser,
  loadingUserComments,
  (loadingUser, loadingUserComments) => loadingUser || loadingUserComments
);

const returnUrl = createSelector(
  targetType,
  targetId,
  (targetType: string, targetId: string) => {
    if (targetType === 'gene') {
      return `/record/gene/${targetId}`;
    } else if (targetType === 'isolate') {
      return `/record/popsetSequence/${targetId}`;
    } else {
      return `/record/genomic-sequence/${targetId}`;
    }
  }
);

const title = createSelector(
  userComments,
  targetType,
  targetId,
  returnUrl,
  (userComments, targetType, targetId, returnUrl) => (
    <>
      <h1>
        {capitalize(targetType)} comments on{' '}
        <Link to={returnUrl} target="_blank">
          {targetId}
        </Link>
      </h1>
      {userComments.length === 0 && (
        <p>There's currently no comments for {targetId}.</p>
      )}
    </>
  )
);

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  userId: userId(state),
  documentTitle: documentTitle(state, props),
  userComments: userComments(state),
  loading: loading(state),
  title: title(state, props),
  webAppUrl: webAppUrl(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadUserComments: (targetType: string, targetId: string) =>
    dispatch(openUserCommentShow(targetType, targetId)),
  deleteUserComment: (commentId: number) =>
    dispatch(requestDeleteUserComment(commentId)),
});

const mergeProps = (
  {
    documentTitle,
    userId,
    userComments,
    loading,
    title,
    webAppUrl,
  }: StateProps,
  { loadUserComments, deleteUserComment }: DispatchProps,
  { targetId, targetType, initialCommentId }: OwnProps
) => ({
  className: 'wdk-UserComments wdk-UserComments-Show',
  headerClassName: 'wdk-UserComments-Show-Header',
  bodyClassName: 'wdk-UserComments-Show-Body',
  documentTitle,
  title,
  userComments,
  userId,
  webAppUrl,
  initialCommentId,
  loading,
  loadUserComments,
  deleteUserComment,
  targetType,
  targetId,
});

class UserCommentShowController extends PageController<Props> {
  loadData(prevProps?: Props) {
    if (
      prevProps == null ||
      this.props.targetType !== prevProps.targetType ||
      this.props.targetId !== prevProps.targetId
    ) {
      this.props.loadUserComments(this.props.targetType, this.props.targetId);
    }
  }

  getTitle() {
    return this.props.documentTitle;
  }

  isRenderDataLoaded() {
    return !this.props.loading;
  }

  renderView() {
    const {
      documentTitle,
      loading,
      loadUserComments,
      targetType,
      targetId,
      ...viewProps
    } = this.props;

    return <UserCommentShowView {...viewProps} />;
  }
}

export default connect<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(UserCommentShowController));
