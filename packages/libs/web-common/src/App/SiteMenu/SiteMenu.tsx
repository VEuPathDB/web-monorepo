import React from 'react';

import './SiteMenu.scss';
import SiteMenuItem from './SiteMenuItem';
import { MenuItem } from '../../util/menuItems';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

interface SiteMenuConfig {
  webAppUrl: string;
  projectId?: string;
}

interface SiteMenuActions {
  showLoginWarning: (message: string, href: string) => void;
}

interface SiteMenuProps {
  items?: MenuItem[];
  config: SiteMenuConfig;
  actions: SiteMenuActions;
  user: User;
}

class SiteMenu extends React.Component<SiteMenuProps> {
  constructor(props: SiteMenuProps) {
    super(props);
  }

  render() {
    const { items, config, actions, user } = this.props;
    return (
      <div className="SiteMenu">
        {!items
          ? null
          : items.map((item, key) => (
              <SiteMenuItem
                key={key}
                item={item}
                config={config}
                actions={actions}
                user={user}
              />
            ))}
      </div>
    );
  }
}

export default SiteMenu;
