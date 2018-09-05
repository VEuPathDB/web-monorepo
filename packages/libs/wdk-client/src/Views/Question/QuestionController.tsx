import { get } from 'lodash';
import * as React from 'react';

import {
  ActiveQuestionUpdatedAction,
  GroupVisibilityChangedAction,
  ParamValueUpdatedAction,
} from '../../Core/ActionCreators/QuestionActionCreators';
import DefaultQuestionForm from './DefaultQuestionForm';
import QuestionStore, { QuestionState } from './QuestionStore';
import { wrappable } from '../../Utils/ComponentUtils';
import AbstractPageController from '../../Core/Controllers/AbstractPageController';

const ActionCreators = {
  updateParamValue: ParamValueUpdatedAction.create,
  setGroupVisibility: GroupVisibilityChangedAction.create
}

export type EventHandlers = typeof ActionCreators;

class QuestionController extends AbstractPageController<QuestionState, QuestionStore, typeof ActionCreators> {

  getActionCreators() {
    return ActionCreators;
  }

  getStoreClass() {
    return QuestionStore;
  }

  getStateFromStore() {
    return get(this.store.getState(), ['questions', this.props.match.params.question], {}) as QuestionState;
  }

  loadData() {
    if (this.state.questionStatus == null) {
      this.dispatchAction(ActiveQuestionUpdatedAction.create({
        stepId: undefined,
        questionName: this.props.match.params.question
      }));
    }
  }

  isRenderDataLoaded() {
    return this.state.questionStatus === 'complete';
  }

  isRenderDataLoadError() {
    return this.state.questionStatus === 'error';
  }

  isRenderDataNotFound() {
    return this.state.questionStatus === 'not-found';
  }

  getTitle() {
    return !this.state.question || !this.state.recordClass ? 'Loading' :
      `Search for ${this.state.recordClass.displayNamePlural}
      by ${this.state.question.displayName}`;
  }

  renderView() {
    return (
      <DefaultQuestionForm
        state={this.state}
        eventHandlers={this.eventHandlers}
        dispatchAction={this.dispatchAction}
      />
    );
  }

}

export default wrappable(QuestionController);
