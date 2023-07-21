import React from 'react';

import { Tabs } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { ParameterGroup } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  Props,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import {
  groupXorParametersByChromosomeAndSequenceID,
  keyForXorGroupingByChromosomeAndSequenceID,
  restrictParameterGroup,
} from './utils';

import './MutuallyExclusiveParamsGroup.scss';

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
      {group.name !== xorGroupKey ||
      !chromosomeParameterKeys ||
      !sequenceIdParameterKeys ? (
        renderDefaultParamGroup(group, props)
      ) : (
        <Tabs<MutuallyExclusiveTabKey>
          key={group.name}
          activeTab={activeTab}
          onTabSelected={onTabSelected}
          containerClassName={cx('Container')}
          tabs={[
            {
              key: 'Chromosome',
              display: 'Search by Chromosome',
              content: renderDefaultParamGroup(
                restrictParameterGroup(group, chromosomeParameterKeys),
                props
              ),
            },
            {
              key: 'Sequence ID',
              display: 'Search by Sequence ID',
              content: renderDefaultParamGroup(
                restrictParameterGroup(group, sequenceIdParameterKeys),
                props
              ),
            },
          ]}
        />
      )}
    </React.Fragment>
  );
};
