import { useState } from 'react';
import { ChevronRight } from '@veupathdb/coreui';
import { Launch, LockOpen } from '@material-ui/icons';
import { SiteInformationProps } from '..';

export type MapSideNavigationProps = {
  children: React.ReactNode;
  siteInformationProps: SiteInformationProps;
};

const menuBackground = 'rgba(255, 255, 255, 0.8)';

const bottomLinkStyles: React.CSSProperties = {
  // These are for formatting the links to the login
  // and site URL.
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  fontSize: 15,
  marginBottom: '1rem',
};

export function MapSideNavigation({
  siteInformationProps,
  children,
}: MapSideNavigationProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const sideMenuWidth = 200;
  const sideMenuExpandButtonWidth = 50;

  return (
    <nav
      style={{
        // These styles define the look of the side navigation,
        // including its width, height, and location on the
        // page (which depends on the `isExpanded` piece of state.
        background: menuBackground,
        // height: 'calc(100% - 150px)',
        height: '100%',
        left: isExpanded ? 0 : -sideMenuWidth,
        minHeight: 125,
        position: 'relative',
        transition: 'left 0.1s ease',
        width: sideMenuWidth,
        marginTop: '2rem',
        // The parent of this element probably had its pointer-events
        // set to "none". This restores the default behavior. Without
        // this, users cannot interact with the side menu via cursor.
        pointerEvents: 'auto',
        // Just as with the map header, we need to set a z-index to
        // ensure that the side menu sits atop the map.
        zIndex: 10,
      }}
    >
      <button
        style={{
          // This makes the button users will click to open/close
          // the side navigation.
          background: menuBackground,
          borderColor: 'transparent',
          height: 50,
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
        }}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <ChevronRight
          style={{
            transform: `rotate(${isExpanded ? -180 : 0}deg)`,
            height: 30,
            width: 40,
          }}
          aria-hidden
        />
        <span className="screenReaderOnly">
          {isExpanded ? 'Close' : 'Open'} {siteInformationProps.siteName} side
          menu
        </span>
      </button>
      <div
        style={{
          position: 'relative',
          // Ensures that the div takes up all the available height.
          height: '100%',
        }}
      >
        <div
          style={{
            // Ensures that these children nav items are contained to
            // 70% of the navigation, leaving 30% for the navigation
            // footer items.
            height: '70%',
            overflow: 'scroll',
          }}
        >
          {children}
        </div>
        <hr
          style={{
            // Styles for the <hr />
            backgroundColor: `rgba(0, 0, 0,0.25)`,
            border: 0,
            height: '1px',
            marginBottom: '1.5rem',
            width: '90%',
          }}
        />
        <div
          style={{
            // This handles short viewports. These styles allow
            // content inside the div to be scrollable when it exceeds the
            // height constraints of a short viewport.
            marginLeft: '0.5rem',
            // This pins the items to the bottom of the navigation
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
              <a style={bottomLinkStyles} href={siteInformationProps.loginUrl}>
                <LockOpen />
                <p style={{ margin: '0 0 0 5px' }}>Login</p>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
