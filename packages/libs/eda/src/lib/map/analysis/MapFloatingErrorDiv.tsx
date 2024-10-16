import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';

interface MapFloatingErrorDivProps {
  error?: unknown;
  children?: React.ReactNode;
}

export function MapFloatingErrorDiv({
  error,
  children,
}: MapFloatingErrorDivProps) {
  // We're using a portal here so that the user can select the text
  // in the banner. The portal causes the resulting DOM node to be a
  // child of the DOM node that is passed as a second argument to the
  // function. Without a portal, the banner's DOM is a child of the
  // map, which prevents the ability to select text.
  //
  // See https://react.dev/reference/react-dom/createPortal
  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: '30vh',
        zIndex: 1,
        pointerEvents: 'all',
        right: '50%',
        transform: 'translate(50%)',
        width: '55em',
      }}
    >
      {children ?? (
        <Banner
          banner={{
            type: 'error',
            message: (
              <>
                We are not able to display the requested data. Try again later,
                or{' '}
                <Link to="/contact-us" target="_blank">
                  contact us
                </Link>{' '}
                for assistance.
              </>
            ),
            additionalMessage: (
              <pre style={{ whiteSpace: 'break-spaces' }}>{String(error)}</pre>
            ),
            showMoreLinkText: 'See details',
            showLessLinkText: 'Hide details',
            isShowMoreLinkBold: true,
          }}
        />
      )}
    </div>,
    useMap().getContainer().parentElement!
  );
}
