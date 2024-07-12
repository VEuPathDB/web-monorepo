import { DuotoneSvgProps } from './types';

export default function BipartiteNetworkSVG({
  primaryColor,
  secondaryColor,
}: DuotoneSvgProps) {
  return (
    // <!-- Generator: Adobe Illustrator 25.4.1, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
    <svg
      id="uuid-9371679f-88e3-4529-bdd4-d92bc2c66834"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
    >
      <defs>
        <style>
          .nodes&#123;stroke:#fff;stroke-miterlimit:10;stroke-width:4.04px;&#125;
          .edges&#123;fill:none;fill-rule:evenodd;stroke-linejoin:bevel;stroke-width:5.6px;&#125;
        </style>
      </defs>
      <g style={{ stroke: primaryColor }}>
        <line className="edges" x1="426.81" y1="249.37" x2="68.86" y2="433.8" />
        <line
          className="edges"
          x1="68.86"
          y1="340.59"
          x2="428.11"
          y2="158.15"
        />
        <line
          className="edges"
          x1="68.86"
          y1="158.15"
          x2="426.81"
          y2="249.37"
        />
        <line
          className="edges"
          x1="70.46"
          y1="247.78"
          x2="428.11"
          y2="158.15"
        />
      </g>
      <g style={{ stroke: secondaryColor }}>
        <polyline
          className="edges"
          points="428.11 342.06 69.65 66.93 428.11 158.15"
        />
        <line className="edges" x1="69.65" y1="66.93" x2="428.11" y2="66.93" />
      </g>
      <g style={{ fill: primaryColor }}>
        <circle
          id="uuid-9d4bdf61-dea6-4d52-bc59-3e16bf447cbb"
          className="nodes"
          cx="68.86"
          cy="158.15"
          r="21"
        />
        <circle
          id="uuid-c19d3359-3bdb-4a57-b94b-60bc23fbc865"
          className="nodes"
          cx="68.86"
          cy="340.59"
          r="21"
        />
        <circle
          id="uuid-5e6b6751-bea9-4bd4-b3ba-39f125de9f2d"
          className="nodes"
          cx="428.11"
          cy="340.59"
          r="21"
        />
        <circle
          id="uuid-89a1ebf3-6b15-4b81-8b22-2c07c9c1b3de"
          className="nodes"
          cx="428.11"
          cy="66.93"
          r="21"
        />
        <circle
          id="uuid-6787eb9e-cb54-4540-927c-acbf5e37d93a"
          className="nodes"
          cx="428.11"
          cy="249.37"
          r="21"
        />
        <circle
          id="uuid-a84e1a38-cb87-4a2f-9ef8-f273aa83de1f"
          className="nodes"
          cx="428.11"
          cy="158.15"
          r="21"
        />
        <circle
          id="uuid-28e9c4f4-0109-4117-a7d2-1b84ce8bd679"
          className="nodes"
          cx="68.86"
          cy="249.37"
          r="21"
        />
        <circle
          id="uuid-fe06ca42-8750-496c-819f-94dbb9a02e21"
          className="nodes"
          cx="68.86"
          cy="431.81"
          r="21"
        />
      </g>
      <g style={{ fill: secondaryColor }}>
        <circle
          id="uuid-40bda367-4949-4e74-be6a-db65d520923f"
          className="nodes"
          cx="68.86"
          cy="66.93"
          r="21"
        />
      </g>
    </svg>
    // R = 16.53r
  );
}
