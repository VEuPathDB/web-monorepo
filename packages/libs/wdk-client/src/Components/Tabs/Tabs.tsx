import 'wdk-client/Components/Tabs/Tabs.scss';

import React, { Fragment } from 'react';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

const cx = makeClassNameHelper('wdk-Tab');

export type TabConfig<TabKey extends string> = {
  key: TabKey;
  display: React.ReactNode;
  removable?: boolean;
  tooltip?: string;
  content: React.ReactNode;
};

type Props<TabKey extends string> = {
  tabs: TabConfig<TabKey>[];
  activeTab: string;
  onTabSelected: (tab: TabKey) => void;
  onTabRemoved?: (tab: string) => void;
  className?  : string;
};

export default function Tabs<T extends string>(props: Props<T>) {
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
                <i
                  className="fa fa-times"
                  onClick={(event) => {
                      event.stopPropagation();
                      if (props.onTabRemoved) {
                        props.onTabRemoved(tab.key);
                      }
                    }
                  }
                />
              </Fragment>
            }
          </button>
        ))}
      </div>
      <div className={cx('Content')}>
        {activeTab && activeTab.content}
      </div>
    </div>
  );
}
