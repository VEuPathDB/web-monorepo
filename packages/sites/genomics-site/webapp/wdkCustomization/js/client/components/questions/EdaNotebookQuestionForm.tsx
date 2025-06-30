import DefaultQuestionForm, {
  Props,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React, { useCallback } from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';
import {
  ParameterGroup,
  Parameter,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const EdaNotebookQuestionForm = (props: Props) => {
  // value will be the serialized analysis object

  const { searchName } = props;
  if (!searchName) {
    throw new Error('No search defined.');
  }

  const updateWdkParamValue = useCallback(
    (
      parameter: Parameter,
      newParamValue: string,
      paramValues: ParameterValues
    ) => {
      props.eventHandlers.updateParamValue({
        searchName,
        parameter,
        paramValues,
        paramValue: newParamValue,
      });
    },
    [props, searchName]
  );

  const renderParamGroup = (group: ParameterGroup, formProps: Props) => {
    return (
      <EdaNotebookParameter
        value={'test'}
        parameters={props.state.question.parameters}
        updateWdkParamValue={updateWdkParamValue}
      />
    );
  };

  return (
    <DefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
      resetFormConfig={{ offered: false }}
    />
  );
};
