import React, { useState } from 'react';

import { Tabs } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { Props, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { groupXorParametersByChromosomeAndSequenceID, keyForXorGroupingByChromosomeAndSequenceID, restrictParameters } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/utils';

import 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup.scss';

const cx = makeClassNameHelper('wdk-MutuallyExclusiveParamsGroup');

export const mutuallyExclusiveParamsGroupRenderer = (group: ParameterGroup, props: Props) => {
  const { state } = props

  const [ activeTab, onTabSelected ] = useState('Chromosome');

  const xorGroupKey = keyForXorGroupingByChromosomeAndSequenceID(state);
  const xorGroupParameters = groupXorParametersByChromosomeAndSequenceID(state);

  const chromosomeParameterKeys = xorGroupParameters['Chromosome'];
  const sequenceIdParameterKeys = xorGroupParameters['Sequence ID'];

  return (
    <>
      {
        group.name !== xorGroupKey || !chromosomeParameterKeys || !sequenceIdParameterKeys
          ? renderDefaultParamGroup(group, props)
          : (
            <Tabs
              key={group.name}
              activeTab={activeTab}
              onTabSelected={onTabSelected}
              containerClassName={cx('Container')}
              tabs={[
                {
                  key: 'Chromosome',
                  display: 'Search by Chromosome',
                  content: renderDefaultParamGroup(
                    group,
                    {
                      ...props,
                      state: restrictParameters(props.state, chromosomeParameterKeys)
                    }
                  )
                },
                {
                  key: 'Sequence ID',
                  display: 'Search by Sequence ID',
                  content: renderDefaultParamGroup(
                    group,
                    {
                      ...props,
                      state: restrictParameters(props.state, sequenceIdParameterKeys)
                    }
                  )
                }
              ]}
            />
          )
      }
    </>
  );
};
