import { css } from '@emotion/react';
import { colors } from '@veupathdb/coreui';
import useUITheme from '@veupathdb/coreui/lib/components/theming/useUITheme';
import * as React from 'react';
import { SidePanelMenuEntry } from './Types';

type SideNavItemsProps = {
  menuEntries: SidePanelMenuEntry[];
  activeSideMenuId: string | undefined;
  setActiveSideMenuId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export function SideNavigationItems(props: SideNavItemsProps) {
  return <SideNavigationItemsRecursion {...props} indentLevel={0} />;
}

function SideNavigationItemsRecursion({
  menuEntries,
  activeSideMenuId,
  setActiveSideMenuId,
  indentLevel,
}: SideNavItemsProps & { indentLevel: number }) {
  const theme = useUITheme();

  function formatEntry(entry: SidePanelMenuEntry, isActive = false) {
    const style = {
      paddingLeft: `${indentLevel * 1.3 + 0.5}em`,
    };
    const entryCss = css({
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'flex-start',
      fontSize: entry.type === 'subheading' ? '1.2em' : '1.3em',
      fontWeight: entry.type === 'subheading' ? 500 : isActive ? 'bold' : '',
      color: entry.type === 'subheading' ? colors.gray[600] : colors.gray[900],
      padding: '.4em 0',
      backgroundColor: isActive ? theme?.palette.primary.hue[100] : 'inherit',
    });

    const iconCss = css({
      height: '1.5em',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ':first-of-type': {
        width: '1.5em',
      },
    });

    const labelCss = css({
      margin: '0 0.5em',
    });

    return (
      <div css={entryCss} style={style}>
        <div css={iconCss}>{entry.leftIcon}</div>
        <div css={labelCss}>{entry.labelText}</div>
        <div css={iconCss}>{entry.rightIcon}</div>
      </div>
    );
  }

  const sideNavigationItems = menuEntries.map((entry) => {
    switch (entry.type) {
      case 'heading':
      case 'subheading':
        return (
          <li>
            <div role="group">{formatEntry(entry)}</div>
            <SideNavigationItemsRecursion
              indentLevel={indentLevel + 1}
              menuEntries={entry.children}
              activeSideMenuId={activeSideMenuId}
              setActiveSideMenuId={setActiveSideMenuId}
            />
          </li>
        );
      case 'item': {
        const isActive = entry.id === activeSideMenuId;
        return (
          <li role="presentation">
            <button
              type="button"
              className="link"
              css={{
                ':hover': {
                  textDecoration: 'none',
                },
                width: '100%',
              }}
              role="menuitem"
              onClick={() => {
                setActiveSideMenuId((currentId) =>
                  currentId === entry.id ? undefined : entry.id
                );
                entry.onActive?.();
              }}
            >
              {formatEntry(entry, isActive)}
            </button>
          </li>
        );
      }
    }
    return null;
  });
  return (
    <div>
      <ul
        role="menu"
        css={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {sideNavigationItems}
      </ul>
    </div>
  );
}
