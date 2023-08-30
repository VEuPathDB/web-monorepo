import { MonotoneSvgProps } from './types';

export default function TimeSeriesSVG({ primaryColor }: MonotoneSvgProps) {
  return (
    // <!-- Generator: Adobe Illustrator 26.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
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
        .primary-markers&#123;fill-rule:evenodd;clip-rule:evenodd;&#125;
        .primary-line&#123;fill-rule:evenodd;clip-rule:evenodd;fill:none;stroke-width:5.6;stroke-miterlimit:10;&#125;
      </style>
      <g style={{ stroke: primaryColor }}>
        <polyline
          className="primary-line"
          points="63.02 357.84 137.81 271.03 212.6 257.25 287.4 235.88 362.19 164.49 440.85 65.71"
        />
      </g>
      <g style={{ fill: primaryColor }}>
        <polygon
          className="primary-markers"
          points="113.41 423.02 367.13 418.97 367.13 427.07 113.41 423.02"
        />
        <polygon
          className="primary-markers"
          points="362.73 390.22 362.73 455.82 395.52 423.02 362.73 390.22"
        />
        <circle
          id="uuid-0570c059-3b45-45c9-a983-204322eaadb2"
          className="primary-markers"
          cx="63.02"
          cy="357.84"
          r="13.02"
        />
        <circle
          id="uuid-576cfcd3-fe12-46c9-831c-f3ca97bf0567"
          className="primary-markers"
          cx="137.81"
          cy="271.03"
          r="13.02"
        />
        <circle
          id="uuid-7d83ea2a-6025-4e58-8562-5e8d772ac1f1"
          className="primary-markers"
          cx="287.4"
          cy="235.88"
          r="13.02"
        />
        <circle
          id="uuid-261e983d-4a1c-42b1-ac4a-390f50340c1d"
          className="primary-markers"
          cx="362.19"
          cy="162.6"
          r="13.02"
        />
        <circle
          id="uuid-659b4b53-b28d-4698-a711-75d37eb89711"
          className="primary-markers"
          cx="436.98"
          cy="65.71"
          r="13.02"
        />
        <circle
          id="uuid-6fbf927f-eab3-419e-bf6b-6b9ff7c23bd3"
          className="primary-markers"
          cx="212.6"
          cy="256.16"
          r="13.02"
        />
      </g>
    </svg>
  );
}
