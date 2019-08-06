import { mapValues } from 'lodash';
import React, { useEffect, useCallback, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import {
  updateActiveQuestion,
  updateParamValue,
  changeGroupVisibility,
  SubmissionMetadata
} from 'wdk-client/Actions/QuestionActions';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import Error from 'wdk-client/Components/PageStatus/Error';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import { Props as FormProps } from 'wdk-client/Views/Question/DefaultQuestionForm';

const ActionCreators = {
  updateParamValue,
  setGroupVisibility: changeGroupVisibility
}

type OwnProps = { question: string, recordClass: string, FormComponent?: (props: FormProps) => JSX.Element, submissionMetadata: SubmissionMetadata };
type StateProps = QuestionState;
type DispatchProps = { eventHandlers: typeof ActionCreators, dispatch: Dispatch };
type Props = DispatchProps & StateProps & {
  searchName: string,
  recordClassName: string,
  FormComponent?: FunctionComponent<FormProps>,
  submissionMetadata: SubmissionMetadata
};

function QuestionController(props: Props) {
  const { dispatch, eventHandlers, searchName, recordClassName, submissionMetadata, FormComponent, ...state } = props;
  const stepId = submissionMetadata.type === 'edit-step' ? submissionMetadata.stepId : undefined;

  const DefaultRenderForm: FunctionComponent<FormProps> = useCallback(
    (props: FormProps) => (
      <Plugin<FormProps>
        context={{
          type: 'questionForm',
          name: searchName,
          searchName,
          recordClassName
        }}
        pluginProps={props}
      />
    ),
    [ searchName, recordClassName ] 
  );

  useEffect(() => {
    props.dispatch(updateActiveQuestion({
      searchName,
      stepId
    }))
  }, [searchName, stepId]);

  // TODO Add document.title logic
  
  if (state.questionStatus === 'error') return <Error/>;
  if (state.questionStatus === 'not-found') return <NotFound/>;
  if (state.questionStatus === 'loading') return <Loading/>;
  if (state.questionStatus !== 'complete') return null;

  const parameterElements = mapValues(
    state.question.parametersByName,
    parameter => (
      <Plugin
        context={{
          type: 'questionFormParameter',
          name: parameter.name,
          searchName,
          recordClassName
        }}
        pluginProps={{
          ctx: {
            searchName,
            parameter,
            paramValues: state.paramValues
          },
          parameter: parameter,
          value: state.paramValues[parameter.name],
          uiState: state.paramUIState[parameter.name],
          onParamValueChange: (paramValue: string) => {
            eventHandlers.updateParamValue({
              searchName,
              parameter,
              paramValues: state.paramValues,
              paramValue
            })
          },
          dispatch: dispatch
        }}
      />
    )
  );

  return FormComponent
    ? <FormComponent
        parameterElements={parameterElements}
        state={state}
        eventHandlers={eventHandlers}
        dispatchAction={dispatch}
        submissionMetadata={submissionMetadata}
      />
    : <DefaultRenderForm
        parameterElements={parameterElements}
        state={state}
        eventHandlers={eventHandlers}
        dispatchAction={dispatch}
        submissionMetadata={submissionMetadata}
      />;
}

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, props) => state.question.questions[props.question] || {} as QuestionState,
  (dispatch) => ({ dispatch, eventHandlers: bindActionCreators(ActionCreators, dispatch) }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    searchName: ownProps.question,
    recordClassName: ownProps.recordClass,
    FormComponent: ownProps.FormComponent,
    submissionMetadata: ownProps.submissionMetadata
  })
)

export default enhance(wrappable(QuestionController));
