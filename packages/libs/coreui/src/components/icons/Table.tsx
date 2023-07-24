import * as React from 'react';
import { SVGProps } from 'react';

const SvgTable = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    xmlSpace="preserve"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M15.41 2.578H.59a.567.567 0 0 0-.566.566v9.711c0 .312.254.566.566.566h14.82a.567.567 0 0 0 .566-.566V3.144a.566.566 0 0 0-.566-.566zM7.619 12.66H.785V9.432h6.834v3.228zm0-3.99H.785V5.436h6.834V8.67zm7.596 3.99H8.381V9.432h6.834v3.228zm0-3.99H8.381V5.436h6.834V8.67z" />
  </svg>
);

export default SvgTable;
