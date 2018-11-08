import 'wdk-client/Components/Tabs/Tabs.scss';

import React from 'react';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

const cx = makeClassNameHelper('wdk-Tab');

type TabConfig<TabKey extends string> = {
  key: TabKey;
  display: string;
  content: React.ReactNode;
}

type Props<TabKey extends string> = {
  tabs: TabConfig<TabKey>[];
  activeTab: string;
  onTabSelected: (tab: TabKey) => void;
  className?: string;
}

export default function Tabs<T extends string>(props: Props<T>) {
  const activeTab = props.tabs.find(tab => tab.key === props.activeTab);
  return (
    <div className={cx('sContainer')}>
      <div className={cx('s')}>
        {props.tabs.map(tab => (
          <button type="button" key={tab.key} onClick={() => props.onTabSelected(tab.key)} className={cx('', activeTab === tab ? 'active' : '')}>
            {tab.display}
          </button>
        ))}
      </div>
      <div className={cx('Content')}>
        {activeTab && activeTab.content}
      </div>
    </div>
  );
}