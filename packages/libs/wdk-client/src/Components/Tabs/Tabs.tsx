import './Tabs.scss';

import React from 'react';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';

const cx = makeClassNameHelper('wdk-Tab');

type TabConfig = {
  key: string;
  display: string;
  content: React.ReactNode;
}

type Props = {
  tabs: TabConfig[];
  activeTab: string;
  onTabSelected: (tab: string) => void;
  className?: string;
}

export default function Tabs(props: Props) {
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