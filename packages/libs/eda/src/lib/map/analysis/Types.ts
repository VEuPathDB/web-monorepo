import { ReactNode } from 'react';
import { ComputationAppOverview } from '../../core/types/visualization';

export type SidePanelMenuEntry =
  | SidePanelItem
  | SidePanelHeading
  | SidePanelSubheading;

export interface SidePanelMenuItemBase {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  labelText: ReactNode;
}

export interface SidePanelItem extends SidePanelMenuItemBase {
  type: 'item';
  id: string;
  renderSidePanelDrawer: (apps: ComputationAppOverview[]) => ReactNode;
  onActive?: () => void;
}

export interface SidePanelHeading extends SidePanelMenuItemBase {
  type: 'heading';
  children: (SidePanelSubheading | SidePanelItem)[];
}

export interface SidePanelSubheading extends SidePanelMenuItemBase {
  type: 'subheading';
  children: SidePanelItem[];
}
