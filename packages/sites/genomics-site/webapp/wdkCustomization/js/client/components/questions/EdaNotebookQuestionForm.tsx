import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React from 'react';
import { EdaNotebookParameter } from './EdaNotebookParameter';

export const EdaNotebookQuestionForm = (props: Props) => {
  return <h4>Eda Notebook here</h4>;

  // We don't have the right props here yet. Still investigating how to get them and which
  // ones we even really need.
  // return (
  //   <EdaNotebookParameter {...props} />
  // );
};
