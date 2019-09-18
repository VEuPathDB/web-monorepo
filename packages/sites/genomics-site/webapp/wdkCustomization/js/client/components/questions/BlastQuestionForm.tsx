import * as React from 'react';

import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

export default function BlastQuestionForm(props: Props) {
  return (
    <div>
      <div>Overridden Page!</div>
      <EbrcDefaultQuestionForm {...props}/>
    </div>
  );
}
