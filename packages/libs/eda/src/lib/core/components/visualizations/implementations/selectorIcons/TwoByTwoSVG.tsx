import { MonotoneSvgProps } from './types';

export default function TwoByTwoSVG({ primaryColor }: MonotoneSvgProps) {
  return (
    // <!-- Generator: Adobe Illustrator 25.4.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 500 500"
      xmlSpace="preserve"
    >
      <style type="text/css">
        {/* <!-- svg classes --> */}
        .grid&#123;fill:none;stroke-width:4.1816;stroke-miterlimit:10;&#125;
        .varlines&#123;fill:none;stroke:#FFFFFF;stroke-width:4.1816;stroke-miterlimit:10;&#125;
      </style>
      <g style={{ fill: primaryColor }}>
        <rect x="50" y="165.288" width="83.839" height="284.712" />

        <rect
          x="265.724"
          y="-50.437"
          transform="matrix(-3.267947e-07 1 -1 -3.267947e-07 399.5636 -215.7242)"
          width="83.839"
          height="284.712"
        />
      </g>
      <g style={{ stroke: primaryColor }}>
        <line
          className="grid"
          x1="307.644"
          y1="449.154"
          x2="307.644"
          y2="166.403"
        />
        <g style={{ fill: primaryColor }}>
          <path
            d="M445.819,169.469v276.349H169.469l0-276.349H445.819 M450,165.288H165.288l0,284.712H450V165.288L450,165.288
			z"
          />
        </g>
        <line
          className="grid"
          x1="167.09"
          y1="307.644"
          x2="447.374"
          y2="307.644"
        />
      </g>
      <g>
        <line
          className="varlines"
          x1="48.849"
          y1="307.779"
          x2="134.212"
          y2="307.779"
        />
        <line
          className="varlines"
          x1="307.232"
          y1="134.601"
          x2="307.232"
          y2="49.238"
        />
      </g>
    </svg>
  );
}
