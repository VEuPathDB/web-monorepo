import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch, bindActionCreators } from "redux";
import PageController from 'wdk-client/Core/Controllers/PageController';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import DefaultQuestionForm from 'wdk-client/Views/Question/DefaultQuestionForm';
import {
  updateActiveQuestion,
  updateParamValue,
  changeGroupVisibility
} from 'wdk-client/Actions/QuestionActions';
import { QuestionState } from 'wdk-client/Views/Question/QuestionStoreModule';

const ActionCreators = {
  updateParamValue,
  setGroupVisibility: changeGroupVisibility
}

type StateProps = QuestionState;
type DispatchProps = { eventHandlers: typeof ActionCreators, dispatch: Dispatch };

class QuestionController extends PageController<StateProps & DispatchProps> {

  loadData() {
    if (this.props.questionStatus == null) {
      this.props.dispatch(updateActiveQuestion({
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
