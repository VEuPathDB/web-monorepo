import React from 'react';

import { Tabs } from '@veupathdb/wdk-client/lib/Components';
import { TabConfig } from '@veupathdb/wdk-client/lib/Components/Tabs/Tabs';

import { GraphInformationTabKey } from 'ortho-client/utils/graphInformation';

import './GraphInformation.scss';

interface Props {
  activeTab: GraphInformationTabKey;
  selectedNode: string | undefined;
  setActiveTab: (newTab: GraphInformationTabKey) => void;
  tabs: TabConfig<GraphInformationTabKey>[];
}

export function GraphInformation({ activeTab, setActiveTab, tabs }: Props) {
  return (
    <Tabs<GraphInformationTabKey>
      containerClassName="GraphInformation"
      activeTab={activeTab}
      onTabSelected={setActiveTab}
      tabs={tabs}
    />
  );
}
