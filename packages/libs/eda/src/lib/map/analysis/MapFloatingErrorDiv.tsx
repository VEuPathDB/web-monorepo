import Banner from '@veupathdb/coreui/lib/components/banners/Banner';

interface MapFloatingErrorDivProps {
  error: unknown;
}

export function MapFloatingErrorDiv(props: MapFloatingErrorDivProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '30vh',
        left: 0,
        right: 0,
        zIndex: 1000,
        margin: 'auto',
        width: '80em',
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
    </div>
  );
}
