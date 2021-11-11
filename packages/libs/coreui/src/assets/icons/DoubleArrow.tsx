import { GRAY } from '../../definitions/colors';

type IconProps = {
  width?: number;
  height?: number;
  color?: React.CSSProperties['color'];
  extraCSS?: React.CSSProperties;
};

export default function DoubleArrow({
  width = 13,
  height = 12,
  color = GRAY[400],
  extraCSS = {},
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      version='1.1'
      fill={color}
      css={{ ...extraCSS }}
    >
      <g transform='matrix(6.12323e-17,1,-1.75439,1.07425e-16,13.444,0)'>
        <g transform='matrix(-1,-7.15676e-16,1.25557e-15,-0.57,18,11.97)'>
          <path d='M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z' />
        </g>
        <g transform='matrix(-1,-7.15676e-16,1.25557e-15,-0.57,18.0056,9.28981)'>
          <path d='M12,8L6,14L7.41,15.41L12,10.83L16.59,15.41L18,14L12,8Z' />
        </g>
      </g>
    </svg>
  );
}
