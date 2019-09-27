import React, { useState, useCallback } from 'react';

import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { mutuallyExclusiveParamsGroupRenderer, MutuallyExclusiveTabKey } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup';
import { ParameterGroup } from 'wdk-client/Utils/WdkModel';

import { EbrcDefaultQuestionForm } from 'ebrc-client/components/questions/EbrcDefaultQuestionForm';

export const ByLocation: React.FunctionComponent<Props> = props => {
  const [ activeTab, onTabSelected ] = useState<MutuallyExclusiveTabKey>('Chromosome');

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
    <EbrcDefaultQuestionForm
      {...props}
      renderParamGroup={renderParamGroup}
    />
  );
};
