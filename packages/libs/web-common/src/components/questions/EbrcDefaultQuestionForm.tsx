import React from 'react';

import DefaultQuestionForm, { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { useEbrcDescription } from 'ebrc-client/components/questions/EbrcDescription';

export function EbrcDefaultQuestionForm(props: Props) {
  const DescriptionComponent = useEbrcDescription(props.state.question);

  return (
    <DefaultQuestionForm
      {...props}
      DescriptionComponent={DescriptionComponent}
    />
  );
};
