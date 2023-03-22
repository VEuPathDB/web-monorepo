import * as React from "react";
import { SVGProps } from "react";

const SvgDownload = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
    }}
    width="1em"
    height="1em"
    {...props}
  >
    <path
      d="M10.207 3.104v2.779c0 .152 0 .152.156.152h2.8c.391.001.665.219.725.586a.673.673 0 0 1-.21.61l-1.192 1.192c-1.317 1.317-2.635 2.634-3.951 3.952-.208.208-.448.312-.735.211a.884.884 0 0 1-.314-.206C6.197 11.1 4.913 9.816 3.629 8.532c-.433-.433-.867-.864-1.298-1.299-.312-.314-.302-.748.021-1.037.147-.132.327-.161.514-.161h2.77c.163 0 .164 0 .164-.164l.001-4.792c0-.267.059-.51.265-.7a.76.76 0 0 1 .523-.22c.94-.002 1.88-.006 2.82.001.465.004.797.383.798.891.002.92 0 1.134 0 2.053ZM14.17 15.844H1.83a1.006 1.006 0 0 1 0-2.012h12.34a1.006 1.006 0 0 1 0 2.012Z"
      style={{
        fillRule: "nonzero",
      }}
      transform="matrix(.68863 0 0 .68863 2.49 2.49)"
    />
  </svg>
);

export default SvgDownload;
