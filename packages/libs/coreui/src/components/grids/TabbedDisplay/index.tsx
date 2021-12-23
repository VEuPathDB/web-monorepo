import { useMemo, useState } from 'react';
import { merge } from 'lodash';

// Definitions
import { blue, gray, tan } from '../../../definitions/colors';
import typography from '../../../styleDefinitions/typography';
import { UITheme } from '../../theming/types';

// Hooks
import useUITheme from '../../theming/useUITheme';

import { TabbedDisplayStyleSpec } from './stylePresets';
import { H6 } from '../../headers';

const DEFAULT_STYLE: TabbedDisplayStyleSpec = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  active: {
    backgroundColor: blue[100],
    textColor: gray[600],
    indicatorColor: blue[500],
  },
  inactive: {
    backgroundColor: 'transparent',
    textColor: gray[400],
    indicatorColor: 'transparent',
  },
  hover: {
    backgroundColor: 'transparent',
    textColor: gray[400],
    indicatorColor: tan[300],
  },
};

export type TabbedDisplayProps = {
  /**
   * The content for the tab display. Each array item containts properties
   * for the tab display name and the actual content to display to the user.
   * */
  tabs: Array<{
    // The name to display in the tab. Also used as the key.
    displayName: string;
    onSelect?: () => void;
    content?: React.ReactNode;
  }>;
  /** Optional. Any desired style overrides. */
  styleOverrides?: Partial<TabbedDisplayStyleSpec>;
  /**
   * Optional. Used to indicate which UITheme role this component should
   * augment it's style with. */
  themeRole?: keyof UITheme['palette'];
};

/** Allows the developer to create a tabbed display of content. */
export default function TabbedDisplay({
  tabs,
  styleOverrides = {},
  themeRole,
}: TabbedDisplayProps) {
  const [selectedTab, setSelectedTab] = useState(tabs[0].displayName);
  const [hoveredTab, setHoveredTab] = useState<null | string>(null);

  const theme = useUITheme();
  const themeStyle = useMemo<Partial<TabbedDisplayStyleSpec>>(
    () =>
      theme && themeRole
        ? {
            active: {
              backgroundColor: theme.palette[themeRole].hue[100],
              indicatorColor:
                theme.palette[themeRole].hue[theme.palette[themeRole].level],
              textColor:
                theme.palette[themeRole].hue[
                  theme.palette[themeRole].level + 300
                ],
            },
          }
        : {},
    [theme, themeRole]
  );

  const finalStyle = useMemo(
    () => merge({}, DEFAULT_STYLE, styleOverrides, themeStyle),
    [themeStyle]
  );

  const tabContent = useMemo(
    () => tabs.find((tab) => tab.displayName === selectedTab)!.content,
    [tabs, selectedTab]
  );

  return (
    <div css={{ ...finalStyle.container }}>
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
                  backgroundColor: finalStyle[tabState].backgroundColor,
                  borderBottomColor: finalStyle[tabState].indicatorColor,
                  padding: 15,
                  borderBottomWidth: 3,
                  borderBottomStyle: 'solid',
                  cursor: 'grab',
                  transition:
                    'background-color .5s, border-color .5s, color .5s',
                },
              ]}
              onClick={() => {
                tab.onSelect && tab.onSelect();
                setSelectedTab(tab.displayName);
              }}
              onMouseOver={() => setHoveredTab(tab.displayName)}
              onMouseOut={() => setHoveredTab(null)}
              onKeyDown={(event) =>
                event.code === 'Space' && setSelectedTab(tab.displayName)
              }
            >
              <H6
                text={tab.displayName}
                additionalStyles={{ margin: 0 }}
                color={finalStyle[tabState].textColor}
              />
            </div>
          );
        })}
      </div>
      {tabContent}
    </div>
  );
}
