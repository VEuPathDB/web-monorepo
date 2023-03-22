import React, { ReactNode } from "react";
import { makeClassNameHelper } from "wdk-client/Utils/ComponentUtils";
import { NavLink, NavLinkProps } from "react-router-dom";

import './WorkspaceNavigation.scss';

interface WorkspaceNavigationItem extends Pick<NavLinkProps, 'isActive' | 'replace'> {
  display: ReactNode;
  route: string;
  state?: any;
  exact?: boolean;
}

interface Props {
  heading: ReactNode;
  routeBase: string;
  items: WorkspaceNavigationItem[];
}

const cx = makeClassNameHelper('WorkspaceNavigation');

export default function WorkspaceNavigation(props: Props) {
  const { heading, items, routeBase } = props;
  return (
    <div className={cx()}>
      <h1>{heading}</h1>
      {items.map((item, index) => (
        <NavLink
          key={index}
          className={cx('--Item')}
          activeClassName={cx('--Item', 'active')}
          isActive={item.isActive}
          exact={item.exact ?? true}
          replace={item.replace}
          to={{
            pathname: routeBase + item.route,
            state: { scrollToTop: false, ...item.state }
          }}
        >
          {item.display}
        </NavLink>
      ))}
    </div>
  );
}
