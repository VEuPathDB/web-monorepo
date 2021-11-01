import { useState } from 'react';

import stylePresets, { TabbedDisplayStyleSpec } from './stylePresets';

export type TabbedDisplayProps = {
  /**
   * The content for the tab display. Each array item containts properties
   * for the tab display name and the actual content to display to the user.
   * */
  tabs: Array<{
    displayName: string;
    content: React.ReactNode;
  }>;
  /** Optional. Which style present to use. */
  stylePreset?: keyof typeof stylePresets;
  /** Optional. Any desired style overrides. */
  styleOverrides?: Partial<TabbedDisplayStyleSpec>;
};

/** Allows the developer to create a tabbed display of content. */
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
              tabIndex={0}
              key={tab.displayName}
              css={[
                finalStyle[tabState],
                {
                  cursor: 'grab',
                  transition:
                    'background-color .5s, border-color .5s, color .5s',
                },
              ]}
              onClick={() => setSelectedTab(tab.displayName)}
              onMouseOver={() => setHoveredTab(tab.displayName)}
              onMouseOut={() => setHoveredTab(null)}
              onKeyDown={(event) =>
                event.code === 'Space' && setSelectedTab(tab.displayName)
              }
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
