import 'wdk-client/Components/Tabs/Tabs.scss';

import React, { Fragment } from 'react';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

const cx = makeClassNameHelper('wdk-Tab');

type Props<TabKey extends string> = {
  /** An ordered list of all tabs which are to be rendered */
  tabs: TabConfig<TabKey>[];

  /** The key of the currently selected tab */
  activeTab: string;

  /** Invoked when a tab is selected */
  onTabSelected: (tab: TabKey) => void;

  /** Invoked when a tab is removed */
  onTabRemoved?: (tab: TabKey) => void;

  /** Rendered next to the rightmost tab (useful for providing controls) */
  headerContent?: React.ReactNode;

  /** If specified, give the container an additional class of containerClassName */
  containerClassName?: string;
};

export type TabConfig<TabKey extends string> = {
  /** A unique key for the given tab */
  key: TabKey;

  /** The display for the tab's "name" */
  display: React.ReactNode;

  /** If true, renders a control for removing the tab */
  removable?: boolean;

  /** The content for the tab */
  content: React.ReactNode;
};

export default function Tabs<T extends string>(props: Props<T>) {
  const activeTab = props.tabs.find(tab => tab.key === props.activeTab);
  return (
    <div className={cx('sContainer') + (props.containerClassName ? ` ${props.containerClassName}` : '')}>
      <div className={cx('s')}>
        {props.tabs.map(tab => (
          <button
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
        {props.headerContent}
      </div>
      <div className={cx('Content')} key={props.activeTab}>
        {activeTab && activeTab.content}
      </div>
    </div>
  );
}
