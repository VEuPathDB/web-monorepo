import * as React from "react";
import { SVGProps } from "react";

const SvgChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="1em"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

export default SvgChevronRight;
