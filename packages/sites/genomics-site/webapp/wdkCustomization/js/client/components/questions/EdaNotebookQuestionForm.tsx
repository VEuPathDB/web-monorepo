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
  const { searchName } = props;
  if (!searchName) {
    throw new Error('No search defined.');
  }

  const foo = props.state.paramValues;
  const asd = foo['asd'];

  // We'll use this function throughout the notebook to update any wdk parameters.
  const updateWdkParamValue = useCallback(
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

  // An override that renders the notebook instead of any default parameter or parameter group ui.
  const renderParamGroup = () => {
    return (
      <EdaNotebookParameter
        value={'test'}
        wdkParameters={props.state.question.parameters}
        wdkParamValues={props.state.paramValues}
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
