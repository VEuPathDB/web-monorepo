/**
 * DKDK Type definitions for react-leaflet-sidebarv2 0.6, taken from Definitely Typed
 * But some modifications are made
 * Project: https://github.com/condense/react-leaflet-sidebarv2
 * Definitions by: Vikram Pareddy <https://github.com/vikram-gsu>
 * Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
 */

import * as React from 'react';

type Icon = string | React.ReactElement;
type Anchor = 'top' | 'bottom';
type Position = 'left' | 'right';

export interface TabProps {
  id: string;
  header: string;
  icon: Icon;
  anchor?: Anchor;
  disabled?: boolean;
  onClose?: () => void;
  closeIcon?: Icon;
  position?: Position;
  active?: boolean;
}

declare class Tab extends React.Component<TabProps, any> {}

type TabType = React.ReactElement<Tab> | Array<React.ReactElement<Tab>>;

export interface SidebarProps {
  id: string;
  collapsed: boolean;
  position: Position;
  selected: string;
  closeIcon?: Icon;
  onClose?: () => void;
  onOpen?: (id: string) => void;
  //DKDK change children as optional for component
  children?: TabType;
}

//DKDK disabling below two
// declare class Sidebar extends React.Component<SidebarProps, any> {}

// export { Tab, Sidebar };
