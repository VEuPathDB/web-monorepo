import CircularProgress from '@material-ui/core/CircularProgress';
import { CSSProperties } from 'react';

export type SpinnerStyleOverrides = {
  position?: CSSProperties['position'];
  top?: CSSProperties['top'];
  left?: CSSProperties['left'];
  transform?: CSSProperties['transform'];
  zIndex?: CSSProperties['zIndex'];
};

interface Props {
  size?: string | number;
  styleOverrides?: SpinnerStyleOverrides;
}

export default function Spinner({ size = 50, styleOverrides }: Props) {
  return (
    <div
      style={{
        position: styleOverrides?.position ?? 'absolute',
        top: styleOverrides?.top ?? '50%',
        left: styleOverrides?.left ?? '50%',
        transform: styleOverrides?.transform ?? 'translate(-50%, -50%)',
        zIndex: styleOverrides?.zIndex ?? 450,
      }}
    >
      <CircularProgress color={'secondary'} size={size} thickness={5} />
    </div>
  );
}
