import DefaultQuestionForm, {
  Props,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React, { useCallback } from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';
import { Parameter } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { WdkState } from '@veupathdb/eda/lib/notebook/EdaNotebookAnalysis';

export const EdaNotebookQuestionForm = (props: Props) => {
  const { searchName } = props;
  if (!searchName) {
    throw new Error('No search defined.');
  }

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
    [props, searchName]
  );

  const wdkState: WdkState = {
    parameters: props.state.question.parameters,
    paramValues: props.state.paramValues,
    updateParamValue,
  };

  // An override that renders the notebook instead of any default parameter or parameter group ui.
  const renderParamGroup = () => {
    return <EdaNotebookParameter value={'test'} wdkState={wdkState} />;
  };

  return (
    <DefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      resetFormConfig={{ offered: false }}
    />
  );
};
