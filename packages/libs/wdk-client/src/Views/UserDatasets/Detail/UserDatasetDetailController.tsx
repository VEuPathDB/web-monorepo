import { keyBy } from 'lodash';
import * as React from 'react';

import { showLoginForm } from '../../User/UserActionCreators';
import { PageControllerProps } from '../../../Core/CommonTypes';
import AbstractPageController from '../../../Core/Controllers/AbstractPageController';
import { wrappable } from '../../../Utils/ComponentUtils';
import { Question } from '../../../Utils/WdkModel';
import BigwigDatasetDetail from './BigwigDatasetDetail';
import UserDatasetDetail from './UserDatasetDetail';
import UserDatasetDetailStore, { State as StoreState } from './UserDatasetDetailStore';
import EmptyState from '../EmptyState';
import {
  loadUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets,
  updateUserDatasetDetail,
} from '../UserDatasetsActionCreators';
import { quotaSize } from '../UserDatasetUtils';

// import { removeUserDataset } from 'Views/UserDatasets/UserDatasetsActionCreators';

type State = Pick<StoreState, 'userDatasetsById' | 'loadError' | 'userDatasetUpdating' | 'updateError'>
           & Pick<StoreState["globalData"], 'user' | 'questions' | 'config'>;

const ActionCreators = {
  loadUserDatasetDetail,
  updateUserDatasetDetail,
  removeUserDataset,
  shareUserDatasets,
  unshareUserDatasets
};


type EventHandlers = typeof ActionCreators;

/**
 * View Controller for a userDataset record.
 *
 * Note that we are accessing the userDataset from an object keyed by the
 * userDataset's id. This avoids race conditions that arise when ajax requests
 * complete in a different order than they were invoked.
 */
class UserDatasetDetailController extends AbstractPageController <State, UserDatasetDetailStore, EventHandlers> {
  props: any;

  getQuestionUrl = (question: Question): string => {
    return `#${question.name}`;
  }

  getStoreClass(): typeof UserDatasetDetailStore {
    return UserDatasetDetailStore;
  }

  getStateFromStore(): State {
    let {
      userDatasetsById,
      loadError,
      userDatasetUpdating,
      updateError,
      globalData: { user, questions, config }
    } = this.store.getState();

    return {
      userDatasetsById,
      loadError,
      userDatasetUpdating,
      updateError,
      user,
      questions,
      config
    }
  }

  getTitle () {
    const entry = this.state.userDatasetsById[this.props.match.params.id];
    if (entry && entry.resource) {
      return `My Data Set ${entry.resource.meta.name}`;
    }
    if (entry && !entry.resource) {
      return `My Data Set not found`;
    }
    return `My Data Set ...`;
  }

  getActionCreators () {
    return ActionCreators;
  }

  loadData (prevProps?: PageControllerProps<UserDatasetDetailStore>) {
    const { match } = this.props;
    const { userDatasetsById } = this.state;
    const idChanged = prevProps && prevProps.match.params.id !== match.params.id;
    if (idChanged || !userDatasetsById[match.params.id]) {
      this.eventHandlers.loadUserDatasetDetail(Number(match.params.id));
    }
  }

  isRenderDataLoadError () {
    return this.state.loadError != null && this.state.loadError.status >= 500;
  }

  isRenderDataLoaded () {
    const { match } = this.props;
    const { userDatasetsById, user, questions, config } = this.state;
    const entry = userDatasetsById[match.params.id];
    if (user && user.isGuest) return true;
    return (entry && !entry.isLoading && user && questions && config)
      ? true
      : false;
  }

  getDetailView (type: any) {
    const name: string = type && typeof type === 'object' ? type.name : null;
    switch (name) {
      case 'Bigwigs':
      case 'BigwigFiles':
        return BigwigDatasetDetail;
      default:
        return UserDatasetDetail;
    }
  }

  renderGuestView() {
    return (
      <EmptyState message={
        <button
          type="button"
          className="btn"
          onClick={() => this.dispatchAction(showLoginForm())}
        >Please log in to access My Data Sets.</button>
      }/>
    );
  }

  renderView () {
    const { match, location, history } = this.props;
    const { updateUserDatasetDetail, shareUserDatasets, removeUserDataset, unshareUserDatasets } = this.eventHandlers;
    const { userDatasetsById, user, updateError, questions, config, userDatasetUpdating } = this.state;
    const entry = userDatasetsById[match.params.id];
    const isOwner = !!(user && entry.resource && entry.resource.ownerUserId === user.id);
    const rootUrl = window.location.href.substring(0, window.location.href.indexOf(`/app${location.pathname}`));

    const props = {
      user,
      config,
      isOwner,
      rootUrl,
      history,
      location,
      updateError,
      removeUserDataset,
      quotaSize,
      userDatasetUpdating,
      shareUserDatasets,
      unshareUserDatasets,
      updateUserDatasetDetail,
      userDataset: entry.resource,
      getQuestionUrl: this.getQuestionUrl,
      questionMap: keyBy(questions, 'name')
    };

    const DetailView = this.getDetailView(typeof entry.resource === 'object' ? entry.resource.type : null);
    return user && user.isGuest
      ? this.renderGuestView()
      : <DetailView {...props}/>
  }
}

export default wrappable(UserDatasetDetailController);
