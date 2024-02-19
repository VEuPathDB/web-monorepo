import { mapValues } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { submitForm } from '@veupathdb/wdk-client/lib/Actions/DownloadFormActions';
import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import {
  DownloadFormController,
  QuestionController,
} from '@veupathdb/wdk-client/lib/Controllers';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  FilterValueArray,
  ParameterValues,
  Question,
  RecordClass,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import {
  Props as FormProps,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { getValueFromState } from '@veupathdb/wdk-client/lib/Views/Question/Params';
import { useDispatch } from 'react-redux';
import { Link, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';

import './FastaConfigController.scss';

// these searches define the order of the tabs
const SEARCHES = [
  'GeneByLocusTag',
  'SequenceBySourceId',
  'DynSpansBySourceId',
  'EstBySourceId',
  'PopsetByPopsetId',
];

const submissionMetadata: SubmissionMetadata = {
  type: 'submit-custom-form',
  onStepSubmitted: (wdkService, submissionSpec) => {
    console.log({ submissionSpec });
  },
};

const genomicSegmentsBanner = (
  <Banner
    banner={{
      type: 'warning',
      // hideIcon: true,
      message: (
        <div>
          To download partial genomic sequences (aka genomic segments) please
          use the{' '}
          <Link to={{ pathname: '/search/genomic-segment/DynSpansBySourceId' }}>
            Genomic Segments based on Genomic Location
          </Link>{' '}
          search page
        </div>
      ),
    }}
  />
);

export default function FastaConfigController() {
  const { url } = useRouteMatch();
  const questionsAndRecordClasses = useWdkService(async (wdkService) => {
    const questions = await wdkService.getQuestions();
    const recordClasses = await wdkService.getRecordClasses();
    return SEARCHES.map((searchName) => {
      const question = questions.find((q) => q.urlSegment === searchName);
      if (question == null) return undefined;
      const recordClass = recordClasses.find(
        (r) => r.urlSegment === question.outputRecordClassName
      );
      if (recordClass == null) return undefined;
      return [question, recordClass];
    }).filter((entry): entry is [Question, RecordClass] => entry != null);
  }, []);

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
            render={(props) =>
              props.match.url.includes('genomic-segment') ? (
                genomicSegmentsBanner
              ) : (
                <QuestionController
                  question={question.urlSegment}
                  recordClass={question.outputRecordClassName}
                  submissionMetadata={submissionMetadata}
                  FormComponent={FormComponent}
                  prepopulateWithLastParamValues
                  shouldChangeDocumentTitle={false}
                />
              )
            }
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
      const paramValues: ParameterValues = {};

      for (const parameter of state.question.parameters) {
        const value = await getValueFromState(
          {
            paramValues: state.paramValues,
            parameter,
            searchName: state.question.urlSegment,
          },
          state,
          wdkEpicDependencies
        );
        paramValues[parameter.name] = value;
      }

      dispatch(
        submitForm(
          {
            type: 'answerSpec',
            displayName: '',
            answerSpec: {
              searchName: state.question.urlSegment,
              searchConfig: {
                parameters: paramValues,
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
      {state.question.urlSegment === 'SequenceBySourceId' &&
        genomicSegmentsBanner}
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
