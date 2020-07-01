import React from 'react';

import { Tabs } from 'wdk-client/Components';
import { TabConfig } from 'wdk-client/Components/Tabs/Tabs';

import { GraphInformationTabKey } from '../../utils/graphInformation';

interface Props {
  activeTab: GraphInformationTabKey;
  selectedNode: string;
  setActiveTab: (newTab: GraphInformationTabKey) => void;
  setSelectedNode: (newNode: string) => void;
  tabs: TabConfig<GraphInformationTabKey>[];
}

export function GraphInformation({ activeTab, setActiveTab, tabs }: Props) {
  return (
    <Tabs<GraphInformationTabKey>
      activeTab={activeTab}
      onTabSelected={setActiveTab}
      tabs={tabs}
    />
  );
}
