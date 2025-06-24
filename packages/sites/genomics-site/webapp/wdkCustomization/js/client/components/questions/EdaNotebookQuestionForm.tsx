import DefaultQuestionForm, {
  Props,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export const EdaNotebookQuestionForm = (props: Props) => {
  console.log('EdaNotebookQuestionForm props:', props);

  // question params are in props.state.question.paramNames

  const renderParamGroup = (group: ParameterGroup, formProps: Props) => {
    return <EdaNotebookParameter value={'test'} />;
  };

  return <DefaultQuestionForm {...props} renderParamGroup={renderParamGroup} />;
};
