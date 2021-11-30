import { gray } from '../../definitions/colors';

// TODO: Make this more generic.
type CaretUpIconProps = {
  width?: number;
  height?: number;
  color?: React.CSSProperties['color'];
  extraCSS?: React.CSSProperties;
};

export default function CaretUpIcon({
  width = 12,
  height = 8,
  color = gray[400],
  extraCSS = {},
}: CaretUpIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      version='1.1'
      fill={color}
      css={{ ...extraCSS }}
    >
      <g transform='matrix(1,0,0,1,-6,-8)'>
        <path d='M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z' />
      </g>
    </svg>
  );
}
