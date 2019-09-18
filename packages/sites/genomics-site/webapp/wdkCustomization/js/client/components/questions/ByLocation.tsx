import React, { useState, useCallback } from 'react';

import DefaultQuestionForm, { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { mutuallyExclusiveParamsGroupRenderer } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';
import { ParameterGroup } from 'wdk-client/Utils/WdkModel';

export const ByLocation: React.FunctionComponent<Props> = props => {
  const [ activeTab, onTabSelected ] = useState('Chromosome');

  const renderParamGroup = useCallback(
    (group: ParameterGroup, props: Props) => mutuallyExclusiveParamsGroupRenderer(
      group, 
      props, 
      activeTab, 
      onTabSelected
    ), 
    [ activeTab, onTabSelected ]
  );

  return (
    <DefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
    />
  );
};
