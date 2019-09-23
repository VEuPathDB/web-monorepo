import { mapValues } from 'lodash';
import React, { useEffect, useCallback, FunctionComponent, useMemo } from 'react';
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
import { GlobalData } from 'wdk-client/StoreModules/GlobalData';
import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';

const ActionCreators = {
  updateParamValue,
  setGroupVisibility: changeGroupVisibility
}

type OwnProps = { 
  question: string, 
  recordClass: string, 
  FormComponent?: (props: FormProps) => JSX.Element, 
  submissionMetadata: SubmissionMetadata,
  submitButtonText?: string,
  shouldChangeDocumentTitle?: boolean
};
type StateProps = QuestionState & { recordClasses: GlobalData['recordClasses'] };
type DispatchProps = { eventHandlers: typeof ActionCreators, dispatch: Dispatch };
type Props = DispatchProps & StateProps & {
  searchName: string,
  recordClassName: string,
  FormComponent?: FunctionComponent<FormProps>,
  submissionMetadata: SubmissionMetadata,
  submitButtonText?: string,
  shouldChangeDocumentTitle?: boolean
};

function QuestionController(props: Props) {
  const { 
    dispatch, 
    eventHandlers, 
    searchName, 
    recordClassName, 
    submissionMetadata, 
    FormComponent, 
    submitButtonText, 
    recordClasses,
    shouldChangeDocumentTitle, 
    ...state } = props;
  const stepId = submissionMetadata.type === 'edit-step' || submissionMetadata.type === 'submit-custom-form' ? submissionMetadata.stepId : undefined;

  const recordClass = useMemo(
    () => recordClasses && recordClasses.find(({ urlSegment }) => urlSegment === recordClassName), 
    [ recordClasses, recordClassName ]
  );

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

  useSetSearchDocumentTitle(state.question, state.questionStatus, recordClasses, recordClass, shouldChangeDocumentTitle);
  
  if (state.questionStatus === 'error') return <Error/>;
  if (
    (recordClass === undefined && recordClasses !== undefined) ||
    state.questionStatus === 'not-found'
  ) return <NotFound/>;
  if (recordClass === undefined || state.questionStatus === 'loading') return <Loading/>;
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
        submitButtonText={submitButtonText}
        recordClass={recordClass}
      />
    : <DefaultRenderForm
        parameterElements={parameterElements}
        state={state}
        eventHandlers={eventHandlers}
        dispatchAction={dispatch}
        submissionMetadata={submissionMetadata}
        submitButtonText={submitButtonText}
        recordClass={recordClass}
      />;
}

export const useSetSearchDocumentTitle = (
  question: Question | undefined, 
  questionStatus: 'complete' | 'loading' | 'not-found' | 'error',
  recordClasses: RecordClass[] | undefined,
  outputRecordClass: RecordClass | undefined,
  shouldChangeDocumentTitle: boolean | undefined
) => {
  useEffect(() => {
    if (shouldChangeDocumentTitle) {
      if (question === undefined || recordClasses === undefined || questionStatus === 'loading') {
        document.title = 'Loading...';
      } else if (questionStatus === 'error') {
        document.title = 'Error';
      } else if (outputRecordClass && questionStatus === 'complete') {
        document.title = `Search for ${outputRecordClass.displayNamePlural} by ${question.displayName}`;
      } else {
        document.title = 'Page not found';
      }
    }

    return shouldChangeDocumentTitle
      ? () => {
          document.title = ''
        }
      : () => {};
  }, [ question, questionStatus, recordClasses, outputRecordClass, shouldChangeDocumentTitle ])
};

const enhance = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state, props) =>({
    ...(state.question.questions[props.question] || {}) as QuestionState,
    recordClasses: state.globalData.recordClasses
  }),
  (dispatch) => ({ dispatch, eventHandlers: bindActionCreators(ActionCreators, dispatch) }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    searchName: ownProps.question,
    recordClassName: ownProps.recordClass,
    FormComponent: ownProps.FormComponent,
    submissionMetadata: ownProps.submissionMetadata,
    submitButtonText: ownProps.submitButtonText,
    shouldChangeDocumentTitle: ownProps.shouldChangeDocumentTitle
  })
)

export default enhance(wrappable(QuestionController));
