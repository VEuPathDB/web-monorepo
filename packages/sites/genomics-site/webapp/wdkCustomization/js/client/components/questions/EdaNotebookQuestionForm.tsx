import DefaultQuestionForm, {
  Props,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const EdaNotebookQuestionForm = (props: Props) => {
  // value will be the serialized analysis object

  const renderParamGroup = (group: ParameterGroup, formProps: Props) => {
    return (
      <EdaNotebookParameter
        value={'test'}
        parameters={props.state.question.parameters}
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
