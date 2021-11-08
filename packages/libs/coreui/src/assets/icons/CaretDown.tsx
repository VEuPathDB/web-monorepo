import { GRAY } from '../../definitions/colors';

// TODO: Make this more generic.
type CaretDownIconProps = {
  width?: number;
  height?: number;
  color?: React.CSSProperties['color'];
  extraCSS?: React.CSSProperties;
};

export default function CaretDownIcon({
  width = 12,
  height = 8,
  color = GRAY['400'],
  extraCSS = {},
}: CaretDownIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      version='1.1'
      fill={color}
      css={{ ...extraCSS }}
    >
      <g transform='matrix(-1,-1.22465e-16,1.22465e-16,-1,18,15.41)'>
        <path d='M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z' />
      </g>
    </svg>
  );
}
