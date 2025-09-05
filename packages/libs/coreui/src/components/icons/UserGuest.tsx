import * as React from 'react';
import type { SVGProps } from 'react';
// Originally font awesome user-circle-o icon
const SvgUserGuest = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M12 22C6.3 22 2 17.5 2 12 2 6.4 6.5 2 12 2c5.6 0 10 4.5 10 10 0 5.6-4.5 10-10 10m6.9-5c2.6-3.5 2.1-8.6-1.4-11.6-3.8-3.2-9.1-2.5-12.1 1C2.3 10 3.1 14.6 5 17v-.2c.2-.6.3-1.3.7-1.8.5-.8 1.2-1.4 2.1-1.5.3 0 .6 0 .9.2.6.6 1.4.9 2.2 1.1 1 .2 2 0 2.9-.3.5-.2 1-.5 1.4-.9l.2-.1c.5 0 .9 0 1.3.3.7.4 1.2 1 1.5 1.7.2.5.4 1.1.5 1.6Z" />
    <path d="M12 5.6c2.4 0 4.3 1.9 4.3 4.3s-1.9 4.3-4.3 4.3-4.3-1.9-4.3-4.3S9.6 5.6 12 5.6" />
  </svg>
);
export default SvgUserGuest;
