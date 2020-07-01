import React from 'react';

import { TabConfig } from 'wdk-client/Components/Tabs/Tabs';
import { MesaColumn } from 'wdk-client/Core/CommonTypes';

import { GroupLayout } from './groupLayout';

export interface GraphInformationTabProps {
  layout: GroupLayout;
}

export interface GraphInformationColumn<R, K extends keyof R & string = keyof R & string> extends MesaColumn<K> {
  renderCell?: (props: { value: R[K], row: R }) => React.ReactNode;
}

export type GraphInformationTabKey = 'sequence-list' | 'node-details';

type GraphInformationBaseTabConfig = Omit<TabConfig<GraphInformationTabKey>, 'content'>;

export const graphInformationBaseTabConfigs: GraphInformationBaseTabConfig[] = [
  {
    key: 'sequence-list',
    display: 'Sequence List',
  },
  {
    key: 'node-details',
    display: 'Node Details'
  }
];
