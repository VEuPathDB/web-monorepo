import { isEqual, mapValues, omit } from 'lodash';
import React, {
  useEffect,
  useCallback,
  FunctionComponent,
  useMemo,
} from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { IconAlt, Loading } from '../Components';
import { RootState } from '../Core/State/Types';
import { wrappable } from '../Utils/ComponentUtils';
import { Plugin } from '../Utils/ClientPlugin';
import {
  Action,
  SubmissionMetadata,
  changeGroupVisibility,
  updateActiveQuestion,
  updateParamValue,
  unloadQuestion,
} from '../Actions/QuestionActions';
import { QuestionState } from '../StoreModules/QuestionStoreModule';
import Error from '../Components/PageStatus/Error';
import NotFound from '../Views/NotFound/NotFound';
import { Props as FormProps } from '../Views/Question/DefaultQuestionForm';
import { ResetFormConfig } from '../Components/Shared/ResetFormButton';
import { GlobalData } from '../StoreModules/GlobalData';
import { ParameterValues, RecordClass, Question } from '../Utils/WdkModel';

const ActionCreators = {
  updateParamValue,
  setGroupVisibility: changeGroupVisibility,
};

export type Props = {
  question: string;
  recordClass: string;
  FormComponent?: (props: FormProps) => JSX.Element;
  submissionMetadata: SubmissionMetadata;
  submitButtonText?: string;
  shouldChangeDocumentTitle?: boolean;
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
  initialParamData?: Record<string, string>;
  /**
   * If true, the form will be submitted automatically, and the browser will be
   * directed to the new strategy. Any errors will appear above the search form
   * and the user will be able to correct the errors.
   */
  autoRun?: boolean;
  /**
   * If true, the form will be prepopulated with the param value
   * selections from the user's last visit to the form
   */
  prepopulateWithLastParamValues?: boolean;
  /**
   * Used to declare a global key for a parameter.
   * This allows the param value to be store across searches.
   * Key is the parameter name in this search, and value is the global key name.
   *
   * Example:
   *
   * ```ts
   *     {
   *       organism_select_all: "global_organism"
   *     }
   * ```
   *
   */
  globalParamMapping?: Record<string, string>;
};
type StateProps = {
  questionState: QuestionState;
  recordClasses: GlobalData['recordClasses'];
};
type DispatchProps = {
  eventHandlers: typeof ActionCreators;
  dispatch: Dispatch;
};
export type DerivedProps = DispatchProps &
  StateProps &
  Omit<Props, 'question' | 'recordClass'> & {
    searchName: string;
    recordClassName: string;
  };

function QuestionController(props: DerivedProps) {
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
    autoRun = false,
    prepopulateWithLastParamValues = true,
    globalParamMapping,
    questionState,
  } = props;
  const stepId =
    submissionMetadata.type === 'edit-step' ||
    submissionMetadata.type === 'submit-custom-form'
      ? submissionMetadata.stepId
      : undefined;

  const recordClass = useMemo(
    () =>
      recordClasses &&
      recordClasses.find(({ urlSegment }) => urlSegment === recordClassName),
    [recordClasses, recordClassName]
  );

  const DefaultRenderForm: FunctionComponent<FormProps> = useCallback(
    (props: FormProps) => (
      <Plugin<FormProps>
        context={{
          type: 'questionForm',
          name: searchName,
          searchName,
          recordClassName,
        }}
        pluginProps={props}
        fallback={<Loading />}
      />
    ),
    [searchName, recordClassName]
  );

  useEffect(() => {
    props.dispatch(
      updateActiveQuestion({
        searchName,
        autoRun,
        initialParamData:
          autoRun && initialParamData == null ? {} : initialParamData,
        prepopulateWithLastParamValues,
        stepId,
        submissionMetadata,
        globalParamMapping,
      })
    );
  }, [searchName, stepId, submissionMetadata]);

  // unload the question state on unmount
  useEffect(() => {
    // return a cleanup function that is called when the component is unmounted
    return function cleanup() {
      props.dispatch(unloadQuestion({ searchName }));
    };
  }, [props.dispatch, searchName]);

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

  useSetSearchDocumentTitle(
    questionState.question,
    questionState.questionStatus,
    recordClasses,
    recordClass,
    shouldChangeDocumentTitle
  );

  const resetFormConfig = useResetFormConfig(
    searchName,
    questionState.stepId,
    prepopulateWithLastParamValues,
    questionState.paramValues,
    questionState.defaultParamValues,
    dispatch,
    submissionMetadata
  );

  if (questionState.questionStatus === 'error') return <Error />;
  if (
    (recordClass === undefined && recordClasses !== undefined) ||
    questionState.questionStatus === 'not-found'
  )
    return <NotFound />;
  if (recordClass === undefined || questionState.questionStatus === 'loading')
    return <Loading />;

  if (autoRun && questionState.submitting)
    return (
      <React.Fragment>
        <h1>Searching {recordClass.displayNamePlural}...</h1>
        <Loading />
      </React.Fragment>
    );

  if (questionState.questionStatus !== 'complete') return null;

  const parameterElements = mapValues(
    questionState.question.parametersByName,
    (parameter) => (
      <Plugin
        context={{
          type: 'questionFormParameter',
          name: parameter.name,
          paramName: parameter.name,
          searchName,
          recordClassName,
        }}
        pluginProps={{
          ctx: {
            searchName,
            parameter,
            paramValues: questionState.paramValues,
          },
          parameter: parameter,
          value: questionState.paramValues[parameter.name],
          uiState: questionState.paramUIState[parameter.name],
          onParamValueChange: (paramValue: string) => {
            eventHandlers.updateParamValue({
              searchName,
              parameter,
              paramValues: questionState.paramValues,
              paramValue,
            });
          },
          dispatch: dispatch,
        }}
      />
    )
  );

  return FormComponent ? (
    <FormComponent
      parameterElements={parameterElements}
      state={questionState}
      eventHandlers={eventHandlers}
      dispatchAction={dispatch}
      submissionMetadata={submissionMetadata}
      submitButtonText={submitButtonText}
      recordClass={recordClass}
      resetFormConfig={resetFormConfig}
    />
  ) : (
    <DefaultRenderForm
      parameterElements={parameterElements}
      state={questionState}
      eventHandlers={eventHandlers}
      dispatchAction={dispatch}
      submissionMetadata={submissionMetadata}
      submitButtonText={submitButtonText}
      recordClass={recordClass}
      resetFormConfig={resetFormConfig}
    />
  );
}

function useResetFormConfig(
  searchName: string,
  stepId: number | undefined,
  prepopulateWithLastParamValues: boolean,
  paramValues: ParameterValues,
  defaultParamValues: ParameterValues,
  dispatch: Dispatch<Action>,
  submissionMetadata: SubmissionMetadata
): ResetFormConfig {
  const reloadFormWithSystemDefaults = useCallback(() => {
    dispatch(
      updateActiveQuestion({
        autoRun: false,
        searchName,
        prepopulateWithLastParamValues: false,
        initialParamData: {},
        stepId,
        submissionMetadata,
      })
    );
  }, [searchName, stepId, submissionMetadata]);

  return useMemo(
    () =>
      prepopulateWithLastParamValues
        ? {
            offered: true,
            disabled: isEqual(defaultParamValues, paramValues),
            onResetForm: reloadFormWithSystemDefaults,
            resetFormContent: (
              <React.Fragment>
                <IconAlt fa="refresh" />
                Reset values to default
              </React.Fragment>
            ),
          }
        : {
            offered: false,
          },
    [
      defaultParamValues,
      paramValues,
      prepopulateWithLastParamValues,
      reloadFormWithSystemDefaults,
    ]
  );
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
      if (
        question === undefined ||
        recordClasses === undefined ||
        questionStatus === 'loading'
      ) {
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
          document.title = '';
        }
      : () => {};
  }, [
    question,
    questionStatus,
    recordClasses,
    outputRecordClass,
    shouldChangeDocumentTitle,
  ]);
};

const enhance = connect<
  StateProps,
  DispatchProps,
  Props,
  DerivedProps,
  RootState
>(
  (state, props) => ({
    questionState:
      state.question.questions[props.question] || ({} as QuestionState),
    recordClasses: state.globalData.recordClasses,
  }),
  (dispatch) => ({
    dispatch,
    eventHandlers: bindActionCreators(ActionCreators, dispatch),
  }),
  (stateProps, dispatchProps, ownProps) => ({
    ...stateProps,
    ...dispatchProps,
    searchName: ownProps.question,
    recordClassName: ownProps.recordClass,
    ...omit(ownProps, ['question', 'recordClass']),
  })
);

export default enhance(wrappable(QuestionController));
