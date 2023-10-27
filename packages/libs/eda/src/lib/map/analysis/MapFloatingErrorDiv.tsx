import { FloatingDiv } from './FloatingDiv';

interface MapFloatingErrorDivProps {
  error: unknown;
}

export function MapFloatingErrorDiv(props: MapFloatingErrorDivProps) {
  return (
    <FloatingDiv
      style={{
        top: undefined,
        bottom: 50,
        left: 100,
        right: 100,
      }}
    >
      <pre>{String(props.error)}</pre>
    </FloatingDiv>
  );
}
