import { MonotoneSvgProps } from './types';

export default function RxCSVG({ primaryColor }: MonotoneSvgProps) {
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
        <rect x="50" y="166.089" width="83.053" height="283.911" />

        <rect
          x="266.518"
          y="-50.429"
          transform="matrix(3.289589e-07 -1 1 3.289589e-07 216.5177 399.5713)"
          width="83.053"
          height="283.911"
        />
      </g>
      <g style={{ stroke: primaryColor }}>
        <line
          className="grid"
          x1="260.726"
          y1="450"
          x2="260.726"
          y2="166.089"
        />
        <line
          className="grid"
          x1="355.363"
          y1="450"
          x2="355.363"
          y2="166.089"
        />
        <g>
          <path
            style={{ fill: primaryColor }}
            d="M445.818,170.271v275.548H170.271l0-275.548H445.818 M450,166.089H166.089l0,283.911H450V166.089L450,166.089
          z"
          />
        </g>
        <line
          className="grid"
          x1="168.003"
          y1="308.045"
          x2="450"
          y2="308.045"
        />
        <line
          className="grid"
          x1="168.003"
          y1="237.067"
          x2="450"
          y2="237.067"
        />
        <line
          className="grid"
          x1="168.003"
          y1="379.022"
          x2="450"
          y2="379.022"
        />
      </g>
      <g>
        <line
          className="varlines"
          x1="355.363"
          y1="134.486"
          x2="355.363"
          y2="49.123"
        />
        <line
          className="varlines"
          x1="260.726"
          y1="134.486"
          x2="260.726"
          y2="49.123"
        />
        <line
          className="varlines"
          x1="134.667"
          y1="237.067"
          x2="49.305"
          y2="237.067"
        />
        <line
          className="varlines"
          x1="134.667"
          y1="308.045"
          x2="49.305"
          y2="308.045"
        />
        <line
          className="varlines"
          x1="134.667"
          y1="379.022"
          x2="49.305"
          y2="379.022"
        />
      </g>
    </svg>
  );
}
