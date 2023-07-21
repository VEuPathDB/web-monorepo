import * as React from 'react';
import { SVGProps } from 'react';

const SvgCheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      strokeLinejoin: 'round',
      strokeMiterlimit: 2,
    }}
    width="1em"
    height="1em"
    {...props}
  >
    <path
      style={{
        fill: 'none',
        fillRule: 'nonzero',
      }}
      d="M0 0h24v24H0z"
    />
    <path
      d="M9 14.17 3.83 9l-2.42 2.41L9 19 21 7l-2.41-2.41L9 14.17Z"
      style={{
        fillRule: 'nonzero',
      }}
      transform="rotate(-2.951 18.236 -6.055)"
    />
  </svg>
);

export default SvgCheckIcon;
