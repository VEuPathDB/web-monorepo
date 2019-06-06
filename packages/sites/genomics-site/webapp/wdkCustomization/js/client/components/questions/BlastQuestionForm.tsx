import * as React from 'react';

import DefaultQuestionForm, { Props, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';

export default function BlastQuestionForm(props: Props) {
  return (
    <div>
      <div>Overridden Page!</div>
      <DefaultQuestionForm {...props}/>
    </div>
  );
}
