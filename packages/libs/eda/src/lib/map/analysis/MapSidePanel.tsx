import { ChevronRight } from '@veupathdb/coreui';
import { Launch, LockOpen, Person } from '@material-ui/icons';
import {
  mapSidePanelBackgroundColor,
  mapSidePanelBorder,
  SiteInformationProps,
} from '..';

import { Link } from 'react-router-dom';

export type MapSidePanelProps = {
  isExpanded: boolean;
  children: React.ReactNode;
  /** This fires when the user expands/collapses the nav. */
  onToggleIsExpanded: () => void;
  /** Content to render in sidePanel drawer */
  sidePanelDrawerContents?: React.ReactNode;
  siteInformationProps: SiteInformationProps;
  isUserLoggedIn: boolean | undefined;
};

const bottomLinkStyles: React.CSSProperties = {
  // These are for formatting the links to the login
  // and site URL.
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  fontSize: 15,
  marginBottom: '1rem',
};

const mapSideNavTopOffset = '1.5rem';

export function MapSidePanel({
  sidePanelDrawerContents,
  children,
  isExpanded,
  onToggleIsExpanded,
  siteInformationProps,
  isUserLoggedIn,
}: MapSidePanelProps) {
  const sideMenuExpandButtonWidth = 20;

  return (
    <nav
      style={{
        // These styles define the look of the side panel,
        // including its width, height, and location on the
        // page (which depends on the `isExpanded` piece of state.
        background: mapSidePanelBackgroundColor,
        border: mapSidePanelBorder,
        borderLeft: 'none',
        borderBottom: 'none',
        borderTop: 'none',
        position: 'absolute',
        top: mapSideNavTopOffset,
        height: `calc(100% - (2 * ${mapSideNavTopOffset})`,
        minHeight: 125,
        transition: 'left 0.1s ease',
        // Zero always makes math easy. Either the menu is as big as
        // it needs to be or it's 0px (and 0px padding).
        width: isExpanded ? 'max-content' : 0,
        // The parent of this element probably had its pointer-events
        // set to "none". This restores the default behavior. Without
        // this, users cannot interact with the side menu via cursor.
        pointerEvents: 'auto',
        // Just as with the map header, we need to set a z-index to
        // ensure that the side menu sits atop the map.
        zIndex: 10,
        display: 'flex',
        // Mimics shadow used in Google maps
        boxShadow:
          '0 1px 2px rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
      }}
    >
      <button
        style={{
          // This makes the button users will click to open/close
          // the side panel.
          background: mapSidePanelBackgroundColor,
          border: mapSidePanelBorder,
          borderLeft: 'none',
          borderRadius: '0px 5px 5px 0px',
          height: 60,
          width: sideMenuExpandButtonWidth,
          // These styles pin the expand/collapse to the right of
          // the lefthand side menu at the nav's vertical center.
          position: 'absolute',
          right: -sideMenuExpandButtonWidth,
          top: '50%',
          transform: 'translate(0%, -50%)',
          transition: 'all 0.1s ease',
          // These styles make sure that the button's SVG
          // is centered on x and y-axis. I think 50% of the
          // CSS I write is to center things. #tailwind
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '2px 2px 2px rgba(60,64,67,0.15)',
        }}
        onClick={() => onToggleIsExpanded()}
      >
        <div
          aria-hidden
          style={{
            transform: `rotate(${isExpanded ? -180 : 0}deg)`,
            display: 'flex',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          <ChevronRight />
        </div>
        <span className="screenReaderOnly">
          {isExpanded ? 'Close' : 'Open'} {siteInformationProps.siteName} side
          menu
        </span>
      </button>
      <div
        className={isExpanded ? '' : 'screenReaderOnly'}
        style={{
          position: 'relative',
          // Ensures that the div takes up all the available height.
          height: '100%',
        }}
      >
        <div
          style={{
            // Ensures that these children nav items are contained to
            // 70% of the panel, leaving 30% for the panel
            // footer items.
            height: '70%',
            overflow: 'auto',
          }}
        >
          {children}
        </div>
        <hr
          style={{
            // Styles for the <hr />
            backgroundColor: `rgba(0, 0, 0,0.15)`,
            border: 0,
            height: '2px',
            marginBottom: '1.5rem',
            width: '50%',
          }}
        />
        <div
          className={isExpanded ? '' : 'screenReaderOnly'}
          style={{
            // This handles short viewports. These styles allow
            // content inside the div to be scrollable when it exceeds the
            // height constraints of a short viewport.
            margin: '0 0.5rem',
            // This pins the items to the bottom of the panel
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {/* For now these are more for demonstration purposes. */}
          <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
            <li>
              <a
                style={bottomLinkStyles}
                href={siteInformationProps.siteHomeUrl}
              >
                <Launch />
                <p style={{ margin: '0 0 0 5px' }}>
                  {siteInformationProps.siteName} home
                </p>
              </a>
            </li>
            <li>
              {isUserLoggedIn == null ? null : isUserLoggedIn ? (
                <Link style={bottomLinkStyles} to="/user/profile">
                  <Person />
                  <p style={{ margin: '0 0 0 5px' }}>My profile</p>
                </Link>
              ) : (
                <Link
                  style={bottomLinkStyles}
                  to={
                    siteInformationProps.loginUrl +
                    `?destination=${window.location.href}`
                  }
                >
                  <LockOpen />
                  <p style={{ margin: '0 0 0 5px' }}>Login</p>
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div
        style={{
          borderLeft: sidePanelDrawerContents ? mapSidePanelBorder : 'unset',
          overflow: 'auto',
        }}
        className={isExpanded ? '' : 'screenReaderOnly'}
      >
        {sidePanelDrawerContents}
      </div>
    </nav>
  );
}
