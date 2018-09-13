import { get } from 'lodash';
import * as React from 'react';

import { wrappable } from '../../Utils/ComponentUtils';
import PageController from '../../Core/Controllers/PageController';

import DefaultQuestionForm from './DefaultQuestionForm';
import {
  ActiveQuestionUpdatedAction,
  GroupVisibilityChangedAction,
  ParamValueUpdatedAction,
} from './QuestionActionCreators';
import { RootState } from '../../Core/State/Types';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { QuestionState } from './QuestionStoreModule';

const ActionCreators = {
  updateParamValue: ParamValueUpdatedAction.create,
  setGroupVisibility: GroupVisibilityChangedAction.create
}

type StateProps = QuestionState;
type DispatchProps = { eventHandlers: typeof ActionCreators, dispatch: Dispatch };

class QuestionController extends PageController<StateProps & DispatchProps> {

  loadData() {
    if (this.props.questionStatus == null) {
      this.props.dispatch(ActiveQuestionUpdatedAction.create({
        stepId: undefined,
        questionName: this.props.match.params.question
      }));
    }
  }

  isRenderDataLoaded() {
    return this.props.questionStatus === 'complete';
  }

  isRenderDataLoadError() {
    return this.props.questionStatus === 'error';
  }

  isRenderDataNotFound() {
    return this.props.questionStatus === 'not-found';
  }

  getTitle() {
    return !this.props.question || !this.props.recordClass ? 'Loading' :
      `Search for ${this.props.recordClass.displayNamePlural}
      by ${this.props.question.displayName}`;
  }

  renderView() {
    return (
      <DefaultQuestionForm
        state={this.props}
        eventHandlers={this.props.eventHandlers}
        dispatchAction={this.props.dispatch}
      />
    );
  }

}

const enhance = connect<StateProps, DispatchProps, RouteComponentProps<{ question: string}>, RootState>(
  (state, props) => state.question.questions[props.match.params.question] || {} as QuestionState,
  dispatch => ({ dispatch, eventHandlers: bindActionCreators(ActionCreators, dispatch) })
)

export default enhance(wrappable(QuestionController));
