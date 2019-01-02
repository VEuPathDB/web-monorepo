import 'wdk-client/Core/MoveAfterRefactor/Components/Shared/ResultTabs.scss';

import React, { Fragment } from 'react';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

const cx = makeClassNameHelper('wdk-ResultTab');

export type TabConfig<TabKey extends string> = {
  key: TabKey;
  display: string;
  removable?: boolean;
  tooltip?: string;
  content: React.ReactNode;
};

type Props<TabKey extends string> = {
  tabs: TabConfig<TabKey>[];
  activeTab: string;
  onTabSelected: (tab: TabKey) => void;
  onTabRemoved?: (tab: string) => void;
  headerContent?: React.ReactNode;
  className?: string;
};

export default function ResultTabs<T extends string>(props: Props<T>) {
  const activeTab = props.tabs.find(tab => tab.key === props.activeTab);
  return (
    <div className={cx('sContainer')}>
      <div className={cx('s')}>
        {props.tabs.map(tab => (
          <button
            title={tab.tooltip}
            type="button"
            key={tab.key}
            onClick={() => props.onTabSelected(tab.key)}
            className={cx('', activeTab === tab ? 'active' : '')}
          >
            {tab.display}
            {
              tab.removable &&
              <Fragment>
                {' '}
                <a 
                  href="#"
                  title={`Delete ${tab.display}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (props.onTabRemoved) {
                      props.onTabRemoved(tab.key);
                    }
                  }}>
                  <i className="fa fa-times" />
                </a>
              </Fragment>
            }
          </button>
        ))}
        {
          props.headerContent
        }
      </div>
      <div className={cx('Content')}>
        {activeTab && activeTab.content}
      </div>
    </div>
  );
}
