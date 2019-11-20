import React from 'react';
import Tabs from 'wdk-client/Components/Tabs/Tabs';
import { makeClassNameHelper, wrappable } from 'wdk-client/Utils/ComponentUtils';

import 'wdk-client/Core/MoveAfterRefactor/Components/Shared/ResultTabs.scss';
import {ResultType} from 'wdk-client/Utils/WdkResult';

const cx = makeClassNameHelper('wdk-Tab');

export type TabConfig<TabKey extends string> = {
  key: TabKey;
  display: React.ReactNode;
  removable?: boolean;
  tooltip?: string;
  content: React.ReactNode;
};

type Props<TabKey extends string> = {
  // include resultType for consumers wrapping component
  resultType: ResultType;
  tabs: TabConfig<TabKey>[];
  activeTab: string;
  onTabSelected: (tab: TabKey) => void;
  onTabRemoved?: (tab: TabKey) => void;
  headerContent?: React.ReactNode;
  containerClassName?: string;
  loadingTabs: boolean;
};

export default wrappable(function ResultTabs<T extends string>({ tabs, ...rest }: Props<T>) {
  return <Tabs 
    tabs={tabs.map(
      ({ tooltip, display, ...otherOptions }) => ({
        ...otherOptions,
        display: <span title={tooltip}>{display}</span>
      })
    )}
      {...rest} 
  />;
});
