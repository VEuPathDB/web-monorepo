import { ReactNode } from 'react';
import { IconButton, mapUi } from './ui';

export interface ToolRailItem<Id extends string> {
  id: Id;
  label: string;
  /** tooltip; defaults to the label */
  title?: string;
  icon: ReactNode;
}

interface Props<Id extends string> {
  items: ToolRailItem<Id>[];
  /** items shown at the bottom of the rail */
  bottomItems?: ToolRailItem<Id>[];
  activeIds: Id[];
  onSelect: (id: Id) => void;
}

/**
 * The always-visible column of labelled tool buttons on the left. Each
 * button opens (or closes) one panel or sheet; it never navigates away.
 */
export function ToolRail<Id extends string>({
  items,
  bottomItems = [],
  activeIds,
  onSelect,
}: Props<Id>) {
  const renderItem = (item: ToolRailItem<Id>) => (
    <IconButton
      key={item.id}
      title={item.title ?? item.label}
      label={item.label}
      labelPosition="below"
      active={activeIds.includes(item.id)}
      onClick={() => onSelect(item.id)}
      style={{ width: mapUi.railWidth - 12 }}
    >
      {item.icon}
    </IconButton>
  );
  return (
    <nav
      aria-label="Map tools"
      css={{
        width: mapUi.railWidth,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 0',
        background: mapUi.panelBackground,
        borderRight: mapUi.border,
        zIndex: 3,
      }}
    >
      {items.map(renderItem)}
      <div css={{ flex: 1 }} />
      {bottomItems.map(renderItem)}
    </nav>
  );
}
