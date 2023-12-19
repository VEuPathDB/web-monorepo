import React, { useMemo } from 'react';
import { mapValues } from 'lodash';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  DownloadFormController,
  QuestionController,
} from '@veupathdb/wdk-client/lib/Controllers';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import {
  Props as FormProps,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

// these searches define the order of the tabs
const SEARCHES = [
  'GeneByLocusTag',
  'SequenceBySourceId',
  'EstBySourceId',
  'PopsetByPopsetId',
];

const submissionMetadata: SubmissionMetadata = {
  type: 'submit-custom-form',
  onStepSubmitted: () => {},
};

export default function FastaConfigController() {
  const { url } = useRouteMatch();
  const questions = useWdkService(
    (wdkService) =>
      Promise.all(
        SEARCHES.map((searchName) => wdkService.findQuestion(searchName))
      ),
    []
  );

  useSetDocumentTitle('Retrieve Sequences');

  if (questions == null) return <Loading />;

  return (
    <div>
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
        items={questions.map((question) => ({
          display: question.displayName,
          route: '/' + question.outputRecordClassName,
        }))}
      />
      <Switch>
        {questions.map((question) => (
          <Route
            path={url + '/' + question.outputRecordClassName}
            render={() => (
              <>
                <QuestionController
                  question={question.urlSegment}
                  recordClass={question.outputRecordClassName}
                  submissionMetadata={submissionMetadata}
                  FormComponent={FormComponent}
                  prepopulateWithLastParamValues
                />
              </>
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

  return (
    <>
      {state.question.groups
        .filter((group) => group.displayType !== 'hidden')
        .map((group) => renderDefaultParamGroup(group, updatedProps))}
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
      />
    </>
  );
}
