import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';

interface MapFloatingErrorDivProps {
  error: unknown;
}

export function MapFloatingErrorDiv(props: MapFloatingErrorDivProps) {
  // We're using a portal here so that the user can select the text
  // in the banner. The portal causes the resulting DOM node to be a
  // child of the DOM node that is passed as a second argument to the
  // function. Without a portal, the banner's DOM is a child of the
  // map, which prevents the ability to select text.
  //
  // See https://react.dev/reference/react-dom/createPortal
  const map = useMap();
  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: '30vh',
        left: 0,
        right: 0,
        zIndex: 1,
        margin: 'auto',
        width: '80em',
        pointerEvents: 'all',
      }}
    >
      <Banner
        banner={{
          type: 'error',
          message: (
            <pre style={{ whiteSpace: 'break-spaces' }}>
              {String(props.error)}
            </pre>
          ),
        }}
      />
    </div>,
    map.getContainer().parentElement!
  );
}
