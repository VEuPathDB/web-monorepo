import React from 'react';

import DefaultQuestionForm, { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { mutuallyExclusiveParamsGroupRenderer } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';

export const ByLocation: React.FunctionComponent<Props> = props =>
  <DefaultQuestionForm
    {...props}
    renderParamGroup={mutuallyExclusiveParamsGroupRenderer}
  />;
