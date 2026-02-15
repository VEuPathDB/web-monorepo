import DefaultQuestionForm, {
  Props,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React, { useCallback, useMemo, useState } from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WdkState } from '@veupathdb/eda/lib/notebook/EdaNotebookAnalysis';
import { presetNotebooks } from '@veupathdb/eda/lib/notebook/NotebookPresets';

export const EdaNotebookQuestionForm = (props: Props) => {
  const { searchName } = props;
  if (!searchName) {
    throw new Error('No search defined.');
  }

  const notebookType =
    props.state.question.properties?.['edaNotebookType']?.[0];
  const preset = notebookType ? presetNotebooks[notebookType] : undefined;

  // Start disabled only if the preset has a readiness check
  const [notebookReady, setNotebookReady] = useState(!preset?.isReady);

  // We'll use this function throughout the notebook to update any wdk parameters.
  const updateParamValue = useCallback(
    (parameter: Parameter, newParamValue: string) => {
      props.eventHandlers.updateParamValue({
        searchName,
        parameter,
        paramValues: {}, // deprecated
        paramValue: newParamValue,
      });
    },
    [props.eventHandlers, searchName]
  );

  const wdkState = useMemo<WdkState>(
    () => ({
      // Safe: pluginConfig.tsx only routes here when edaNotebookType property is present
      queryName: props.state.question.queryName!,
      parameters: props.state.question.parameters,
      paramValues: props.state.paramValues,
      updateParamValue,
      questionProperties: props.state.question.properties ?? {},
    }),
    [
      props.state.question.queryName,
      props.state.question.parameters,
      props.state.paramValues,
      updateParamValue,
      props.state.question.properties,
    ]
  );

  // An override that renders the notebook instead of any default parameter or parameter group ui.
  // NOTE: this function is run for every visible parameter group. May cause
  // an issue if the wdk question has multiple parameter groups.
  const renderParamGroup = () => {
    return (
      <EdaNotebookParameter
        wdkState={wdkState}
        onReadinessChange={setNotebookReady}
      />
    );
  };

  return (
    <DefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      resetFormConfig={{ offered: false }}
      submissionDisabled={!notebookReady}
    />
  );
};
