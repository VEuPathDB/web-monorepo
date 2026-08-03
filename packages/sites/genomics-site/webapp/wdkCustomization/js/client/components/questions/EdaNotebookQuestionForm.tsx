import DefaultQuestionForm, {
  Props,
  getSubmitButtonText,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React, { useCallback, useMemo, useState } from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WdkState } from '@veupathdb/eda/lib/notebook/Types';
import { presetNotebooks } from '@veupathdb/eda/lib/notebook/NotebookPresets';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

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

  // Fetch dataset name for user datasets
  const datasetId = props.state.paramValues['eda_dataset_id'];
  const isUserDataset = datasetId?.startsWith('EDAUD_');

  const datasetRecord = useWdkService(
    async (wdkService) => {
      if (!isUserDataset || !datasetId) return;
      return wdkService.getRecord('userdataset', [
        { name: 'dataset_id', value: datasetId },
      ]);
    },
    [datasetId, isUserDataset]
  );

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

  const submitButtonText = getSubmitButtonText(
    props.submissionMetadata,
    props.submitButtonText
  );

  const wdkState = useMemo<WdkState>(
    () => ({
      // Safe: pluginConfig.tsx only routes here when edaNotebookType property is present
      queryName: props.state.question.queryName!,
      parameters: props.state.question.parameters,
      paramValues: props.state.paramValues,
      updateParamValue,
      questionProperties: props.state.question.properties ?? {},
      submitButtonText,
    }),
    [
      props.state.question.queryName,
      props.state.question.parameters,
      props.state.paramValues,
      updateParamValue,
      props.state.question.properties,
      submitButtonText,
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

  // Modify props to add dataset name to question displayName for user datasets
  const modifiedProps = useMemo(() => {
    if (!isUserDataset || !datasetRecord) return props;

    const datasetNameHtml = `<div style="font-size: 0.66em; margin: 0.5em 0 1em 0.5em;">${datasetRecord.displayName}</div>`;

    return {
      ...props,
      state: {
        ...props.state,
        question: {
          ...props.state.question,
          displayName: `${props.state.question.displayName}${datasetNameHtml}`,
        },
      },
    };
  }, [props, isUserDataset, datasetRecord]);

  return (
    <DefaultQuestionForm
      {...modifiedProps}
      renderParamGroup={renderParamGroup}
      resetFormConfig={{ offered: false }}
      submissionDisabled={!notebookReady}
    />
  );
};
