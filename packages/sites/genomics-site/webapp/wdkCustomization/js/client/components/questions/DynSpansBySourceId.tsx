import React from 'react';

import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

export const DynSpansBySourceId: React.FunctionComponent<Props> = props => {

  return (
    <EbrcDefaultQuestionForm
      {...props}
      validateForm={false}
    />
  );
};
