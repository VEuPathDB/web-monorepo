import DefaultQuestionForm, {
  Props,
  SubmitSection,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const EdaNotebookQuestionForm = (props: Props) => {
  console.log('EdaNotebookQuestionForm props:', props);

  // question params are in props.state.question.paramNames

  const renderParamGroup = (group: ParameterGroup, formProps: Props) => {
    return <h3> My own param group </h3>;
  };

  return <DefaultQuestionForm {...props} renderParamGroup={renderParamGroup} />;
};
