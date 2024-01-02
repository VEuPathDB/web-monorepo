import React, { useCallback, useMemo } from 'react';
import { mapValues } from 'lodash';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  DownloadFormController,
  QuestionController,
} from '@veupathdb/wdk-client/lib/Controllers';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import {
  Props as FormProps,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { getValueFromState } from '@veupathdb/wdk-client/lib/Views/Question/Params';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { FilterValueArray } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { submitForm } from '@veupathdb/wdk-client/lib/Actions/DownloadFormActions';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { useDispatch } from 'react-redux';

import './FastaConfigController.scss';

// these searches define the order of the tabs
const SEARCHES = [
  'GeneByLocusTag',
  'SequenceBySourceId',
  'EstBySourceId',
  'PopsetByPopsetId',
];

const submissionMetadata: SubmissionMetadata = {
  type: 'submit-custom-form',
  onStepSubmitted: (wdkService, submissionSpec) => {
    console.log({ submissionSpec });
  },
};

export default function FastaConfigController() {
  const { url } = useRouteMatch();
  const questionsAndRecordClasses = useWdkService(
    (wdkService) =>
      Promise.all(
        SEARCHES.map((searchName) =>
          wdkService
            .findQuestion(searchName)
            .then((question) =>
              Promise.all([
                question,
                wdkService.findRecordClass(question.outputRecordClassName),
              ])
            )
        )
      ),
    []
  );

  useSetDocumentTitle('Retrieve Sequences');

  if (questionsAndRecordClasses == null) return <Loading />;

  return (
    <div className="FastaConfigPage">
      <h1>Retrieve Sequences</h1>
      <p>
        Use this tool to retrieve FASTA sequences based on identifiers you
        supply.
      </p>
      <p>
        (If instead you would like to download sequences in bulk, please visit
        our file download section.)
      </p>
      <WorkspaceNavigation
        heading={null}
        routeBase={url}
        items={questionsAndRecordClasses.map(([question, recordClass]) => ({
          display: recordClass.displayName + ' IDs',
          route: '/' + question.outputRecordClassName,
        }))}
      />
      <Switch>
        <Route
          exact
          path={url}
          render={() => (
            <Redirect
              to={
                url +
                '/' +
                questionsAndRecordClasses[0][0].outputRecordClassName
              }
            />
          )}
        />
        {questionsAndRecordClasses.map(([question]) => (
          <Route
            path={url + '/' + question.outputRecordClassName}
            render={() => (
              <QuestionController
                question={question.urlSegment}
                recordClass={question.outputRecordClassName}
                submissionMetadata={submissionMetadata}
                FormComponent={FormComponent}
                prepopulateWithLastParamValues
                shouldChangeDocumentTitle={false}
              />
            )}
          />
        ))}
      </Switch>
    </div>
  );
}

function FormComponent(props: FormProps) {
  const { state } = props;
  // Need to add `isSearchPage` prop so that organism prefs are used
  const parameterElements = useMemo(
    () =>
      mapValues(props.parameterElements, (parameterElement) => {
        return React.isValidElement(parameterElement)
          ? React.cloneElement(
              parameterElement,
              {
                pluginProps: {
                  ...parameterElement.props.pluginProps,
                  isSearchPage: true,
                },
              } as any,
              parameterElement.props.chilren
            )
          : parameterElement;
      }),
    [props.parameterElements]
  );

  const updatedProps = useMemo(
    () => ({ ...props, parameterElements }),
    [props, parameterElements]
  );

  const wdkEpicDependencies = useNonNullableContext(WdkDependenciesContext);

  const dispatch = useDispatch();

  const submitSrtForm = useCallback(
    async (
      resultType: ResultType,
      selectedReporter: string,
      formState: any,
      viewFilters?: FilterValueArray,
      target?: string
    ) => {
      const paramValueEntries = await Promise.all(
        state.question.parameters.map(async (parameter) => [
          parameter.name,
          await getValueFromState(
            {
              paramValues: state.paramValues,
              parameter,
              searchName: state.question.urlSegment,
            },
            state,
            wdkEpicDependencies
          ),
        ])
      );

      dispatch(
        submitForm(
          {
            type: 'answerSpec',
            displayName: '',
            answerSpec: {
              searchName: state.question.urlSegment,
              searchConfig: {
                parameters: Object.fromEntries(paramValueEntries),
              },
            },
          },
          selectedReporter,
          formState,
          viewFilters,
          target
        )
      );
    },
    [dispatch, state, wdkEpicDependencies]
  );

  const paramGroupElements = state.question.groups
    .filter((group) => group.displayType !== 'hidden')
    .map((group) => renderDefaultParamGroup(group, updatedProps));

  return (
    <>
      {paramGroupElements}

      <DownloadFormController
        includeSelector={false}
        includeTitle={false}
        format="sequence"
        answerSpec={{
          searchName: state.question.urlSegment,
          searchConfig: {
            parameters: state.paramValues,
          },
        }}
        onFormSubmit={submitSrtForm}
      />
    </>
  );
}
