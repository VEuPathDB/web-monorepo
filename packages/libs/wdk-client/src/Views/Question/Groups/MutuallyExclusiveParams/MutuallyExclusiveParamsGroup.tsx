import React from 'react';

import { Tabs } from 'wdk-client/Components';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { ParameterGroup } from 'wdk-client/Utils/WdkModel';
import { Props, renderDefaultParamGroup } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { groupXorParametersByChromosomeAndSequenceID, keyForXorGroupingByChromosomeAndSequenceID, restrictParameterGroup } from 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/utils';

import 'wdk-client/Views/Question/Groups/MutuallyExclusiveParams/MutuallyExclusiveParamsGroup.scss';

const cx = makeClassNameHelper('wdk-MutuallyExclusiveParamsGroup');

export type MutuallyExclusiveTabKey = 'Chromosome' | 'Sequence ID';

export const mutuallyExclusiveParamsGroupRenderer = (
  group: ParameterGroup, 
  props: Props, 
  activeTab: MutuallyExclusiveTabKey, 
  onTabSelected: (activeTab: MutuallyExclusiveTabKey) => void
) => {
  const { state } = props;

  const xorGroupKey = keyForXorGroupingByChromosomeAndSequenceID(state);
  const xorGroupParameters = groupXorParametersByChromosomeAndSequenceID(state);

  const chromosomeParameterKeys = xorGroupParameters['Chromosome'];
  const sequenceIdParameterKeys = xorGroupParameters['Sequence ID'];

  return (
    <React.Fragment key={group.name}>
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
                  key: 'Chromosome' as MutuallyExclusiveTabKey,
                  display: 'Search by Chromosome',
                  content: renderDefaultParamGroup(
                    restrictParameterGroup(group, chromosomeParameterKeys),
                    props
                  )
                },
                {
                  key: 'Sequence ID' as MutuallyExclusiveTabKey,
                  display: 'Search by Sequence ID',
                  content: renderDefaultParamGroup(
                    restrictParameterGroup(group, sequenceIdParameterKeys),
                    props
                  )
                }
              ]}
            />
          )
      }
    </React.Fragment>
  );
};
