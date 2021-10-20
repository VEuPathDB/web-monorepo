import { useState } from 'react';

import stylePresets, { TabbedDisplayStyleSpec } from './stylePresets';

export type TabbedDisplayProps = {
  tabs: Array<{
    displayName: string;
    content: React.ReactNode;
  }>;
  stylePreset?: keyof typeof stylePresets;
  styleOverrides?: Partial<TabbedDisplayStyleSpec>;
};

export default function TabbedDisplay({
  tabs,
  stylePreset = 'default',
  styleOverrides = {},
}: TabbedDisplayProps) {
  const baseStyle = stylePresets[stylePreset];
  const finalStyle = Object.assign({}, baseStyle, styleOverrides);

  const [selectedTab, setSelectedTab] = useState(tabs[0].displayName);

  const [hoveredTab, setHoveredTab] = useState<null | string>(null);

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <div
        key='controls'
        css={{ display: 'flex', borderBottom: '1px solid lightgray' }}
      >
        {tabs.map((tab) => {
          const tabState =
            tab.displayName === selectedTab
              ? 'active'
              : tab.displayName === hoveredTab
              ? 'hover'
              : 'inactive';

          return (
            <div
              css={[finalStyle[tabState], { cursor: 'grab' }]}
              onClick={() => setSelectedTab(tab.displayName)}
              onMouseOver={() => setHoveredTab(tab.displayName)}
              onMouseOut={() => setHoveredTab(null)}
            >
              {tab.displayName}
            </div>
          );
        })}
      </div>
      <div css={{ padding: 15 }}>
        {tabs.find((tab) => tab.displayName === selectedTab)?.content}
      </div>
    </div>
  );
}

export * from './stylePresets';
