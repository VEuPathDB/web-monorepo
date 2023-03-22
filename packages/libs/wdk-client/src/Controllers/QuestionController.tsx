import { isEqual, mapValues } from 'lodash';
import React, { useEffect, useCallback, FunctionComponent, useMemo } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { IconAlt, Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import {
  Action,
  SubmissionMetadata,
  changeGroupVisibility,
  updateActiveQuestion,
  updateParamValue
} from 'wdk-client/Actions/QuestionActions';
import { QuestionState } from 'wdk-client/StoreModules/QuestionStoreModule';
import Error from 'wdk-client/Components/PageStatus/Error';
import NotFound from 'wdk-client/Views/NotFound/NotFound';
import { Props as FormProps } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { ResetFormConfig } from 'wdk-client/Components/Shared/ResetFormButton';
import { GlobalData } from 'wdk-client/StoreModules/GlobalData';
import { ParameterValues, RecordClass, Question } from 'wdk-client/Utils/WdkModel';

const ActionCreators = {
  updateParamValue,
  setGroupVisibility: changeGroupVisibility
}

export type OwnProps = {
  question: string, 
  recordClass: string, 
  FormComponent?: (props: FormProps) => JSX.Element, 
  submissionMetadata: SubmissionMetadata,
  submitButtonText?: string,
  shouldChangeDocumentTitle?: boolean,
  /**
   * Data to provide to parameters upon initialization. Data can be parameter
   * values, or it can be other content that the parameter can access and use
   * for initializing ui state.
   * 
   * If a property's key is the same as a parameter name, then its value will
   * be used as that parameter's initial value.
   * 
   * The entire object is also made available in the payload of the initParam
   * action, so that a param can interrogate the object for other special
   * keys.
   */
  initialParamData?: Record<string, string>,
  /**
   * If true, the form will be submitted automatically, and the browser will be
   * directed to the new strategy. Any errors will appear above the search form
   * and the user will be able to correct the errors.
   */
  autoRun?: boolean,
  /**
   * If true, the form will be prepopulated with the param value
   * selections from the user's last visit to the form
   */
  prepopulateWithLastParamValues?: boolean
};
type StateProps = QuestionState & { recordClasses: GlobalData['recordClasses'] };
type DispatchProps = { eventHandlers: typeof ActionCreators, dispatch: Dispatch };
type Props = DispatchProps & StateProps & {
  searchName: string,
  recordClassName: string,
  FormComponent?: FunctionComponent<FormProps>,
  submissionMetadata: SubmissionMetadata,
  submitButtonText?: string,
  shouldChangeDocumentTitle?: boolean,
  initialParamData?: Record<string, string>,
  autoRun: boolean,
  prepopulateWithLastParamValues: boolean
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
    initialParamData,
    autoRun,
    prepopulateWithLastParamValues,
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
        fallback={<Loading />}
      />
    ),
    [ searchName, recordClassName ] 
  );

  useEffect(() => {
    props.dispatch(updateActiveQuestion({
      searchName,
      autoRun,
      initialParamData: autoRun && initialParamData == null ? {} : initialParamData,
      prepopulateWithLastParamValues,
      stepId,
      submissionMetadata,
    }))
  }, [searchName, stepId, submissionMetadata]);

  // useEffect(() => {
  //   // FIXME This is getting called twice when a question form is loaded a second time
  //   // Need to make sure this only gets called after the question state is refreshed, but not sure how...
  //   // Perhaps this logic should get moved to the question store w/ an observer
  //   if (autoRun && state.questionStatus === 'complete') {
  //     props.dispatch(submitQuestion({
  //       searchName,
  //       submissionMetadata,
  //       autoRun
  //     }));
  //   }
  // }, [state.questionStatus]);

  useSetSearchDocumentTitle(state.question, state.questionStatus, recordClasses, recordClass, shouldChangeDocumentTitle);

  const resetFormConfig = useResetFormConfig(
    searchName,
    state.stepId,
    prepopulateWithLastParamValues,
    state.paramValues,
    state.defaultParamValues,
    dispatch,
    submissionMetadata
  );
  
  if (state.questionStatus === 'error') return <Error/>;
  if (
    (recordClass === undefined && recordClasses !== undefined) ||
    state.questionStatus === 'not-found'
  ) return <NotFound/>;
  if (recordClass === undefined || state.questionStatus === 'loading') return <Loading/>;

  if ( autoRun && state.submitting ) return (
    <React.Fragment>
      <h1>Searching {recordClass.displayNamePlural}...</h1>
      <Loading/>
    </React.Fragment>
  );

  if (state.questionStatus !== 'complete') return null;

  const parameterElements = mapValues(
    state.question.parametersByName,
    parameter => (
      <Plugin
        context={{
          type: 'questionFormParameter',
          name: parameter.name,
          paramName: parameter.name,
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
        resetFormConfig={resetFormConfig}
      />
    : <DefaultRenderForm
        parameterElements={parameterElements}
        state={state}
        eventHandlers={eventHandlers}
        dispatchAction={dispatch}
        submissionMetadata={submissionMetadata}
        submitButtonText={submitButtonText}
        recordClass={recordClass}
        resetFormConfig={resetFormConfig}
      />;
}

function useResetFormConfig(
  searchName: string,
  stepId: number | undefined,
  prepopulateWithLastParamValues: boolean,
  paramValues: ParameterValues,
  defaultParamValues: ParameterValues,
  dispatch: Dispatch<Action>,
  submissionMetadata: SubmissionMetadata,
): ResetFormConfig {
  const reloadFormWithSystemDefaults = useCallback(
    () => {
      dispatch(updateActiveQuestion({
        autoRun: false,
        searchName,
        prepopulateWithLastParamValues: false,
        initialParamData: {},
        stepId,
        submissionMetadata
      }));
    },
    [ searchName, stepId, submissionMetadata ]
  );

  return useMemo(
    () => (
      prepopulateWithLastParamValues
        ? {
            offered: true,
            disabled: isEqual(
              defaultParamValues,
              paramValues
            ),
            onResetForm: reloadFormWithSystemDefaults,
            resetFormContent: (
              <React.Fragment>
                <IconAlt fa="refresh" />
                Reset values to default
              </React.Fragment>
            )
          }
        : {
            offered: false
          }
    ),
    [
      defaultParamValues,
      paramValues,
      prepopulateWithLastParamValues,
      reloadFormWithSystemDefaults
    ]
  );
};

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
    shouldChangeDocumentTitle: ownProps.shouldChangeDocumentTitle,
    initialParamData: ownProps.initialParamData,
    autoRun: ownProps.autoRun === true,
    prepopulateWithLastParamValues: ownProps.prepopulateWithLastParamValues === true
  })
)

export default enhance(wrappable(QuestionController));
