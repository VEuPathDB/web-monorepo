import { useMemo, useState, CSSProperties, useEffect } from 'react';
import { merge } from 'lodash';

// Components
import { H6 } from '../../headers';

// Definitions
import { blue, gray, tan } from '../../../definitions/colors';
import { UITheme } from '../../theming/types';

// Hooks
import useUITheme from '../../theming/useUITheme';

type TabStyle = {
  backgroundColor?: CSSProperties['backgroundColor'];
  textColor?: CSSProperties['color'];
  indicatorColor?: CSSProperties['color'];
};

export type TabbedDisplayStyleSpec = {
  container: CSSProperties;
  inactive: TabStyle;
  active: TabStyle;
  hover: TabStyle;
};

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
  /**
   * Optional. If you want, you can use this prop to set the
   * initially selected tab OR control the currently selected
   * tab programatically.
   *
   * The value MUST be the displayName of one of the tabs. */
  activeTab?: string;
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
  activeTab,
  styleOverrides = {},
  themeRole,
}: TabbedDisplayProps) {
  const [activeTabInternal, setActiveTabInternal] = useState(
    activeTab ?? tabs[0].displayName
  );

  // Listen for changes to the `activeTab` prop. This allows the component
  // to be controlled programmatically.
  useEffect(() => {
    if (activeTab && activeTab !== activeTabInternal) {
      const matchingTabRecord = tabs.find(
        (tab) => tab.displayName === activeTab
      );
      matchingTabRecord && setActiveTabInternal(activeTab);
      matchingTabRecord?.onSelect && matchingTabRecord.onSelect();
    }
  }, [activeTab]);

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
    () => merge({}, DEFAULT_STYLE, themeStyle, styleOverrides),
    [themeStyle, styleOverrides]
  );

  const tabContent = useMemo(
    () => tabs.find((tab) => tab.displayName === activeTabInternal)!.content,
    [tabs, activeTabInternal]
  );

  return (
    <div css={{ ...finalStyle.container }}>
      <div
        key='controls'
        css={{ display: 'flex', borderBottom: '1px solid lightgray' }}
        role='tablist'
      >
        {tabs.map((tab) => {
          const tabState =
            tab.displayName === activeTabInternal
              ? 'active'
              : tab.displayName === hoveredTab
              ? 'hover'
              : 'inactive';

          return (
            <div
              role='tab'
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
                  cursor: 'pointer',
                  transition:
                    'background-color .5s, border-color .5s, color .5s',
                },
              ]}
              onClick={() => {
                tab.onSelect && tab.onSelect();
                setActiveTabInternal(tab.displayName);
              }}
              onFocus={() => setHoveredTab(tab.displayName)}
              onBlur={() => setHoveredTab(null)}
              onMouseOver={() => setHoveredTab(tab.displayName)}
              onMouseOut={() => setHoveredTab(null)}
              onKeyDown={(event) => {
                if (['Space', 'Enter'].includes(event.code)) {
                  tab.onSelect && tab.onSelect();
                  setActiveTabInternal(tab.displayName);
                }
              }}
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
      <div role='tabpanel'>{tabContent}</div>
    </div>
  );
}
