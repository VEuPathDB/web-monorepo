import React from 'react';

import { Tabs } from 'wdk-client/Components';
import { TabConfig } from 'wdk-client/Components/Tabs/Tabs';

import { GraphInformationTabKey } from '../../utils/graphInformation';

import './GraphInformation.scss';

interface Props {
  activeTab: GraphInformationTabKey;
  selectedNode: string | undefined;
  setActiveTab: (newTab: GraphInformationTabKey) => void;
  setSelectedNode: (newNode: string | undefined) => void;
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
