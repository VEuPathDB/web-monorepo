import * as React from "react";

function SvgCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path
        d="M10.054 14.619l-5.43-4.897-2.292 2.531 7.97 7.19L21.668 6.84l-2.53-2.282-9.084 10.06z"
        fillRule="nonzero"
      />
    </svg>
  );
}

export default SvgCheckIcon;
