import { MonotoneSvgProps } from './types';

export default function BoxSVG({ primaryColor }: MonotoneSvgProps) {
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
        .whisker&#123;fill:none;stroke-width:4;stroke-miterlimit:10;&#125;
        .box&#123;fill-rule:evenodd;clip-rule:evenodd;stroke:#FFFFFF;stroke-width:4;stroke-miterlimit:10;&#125;
        .median&#123;fill-rule:evenodd;clip-rule:evenodd;stroke:#FFFFFF;stroke-width:4;stroke-miterlimit:10;&#125;
      </style>
      <g className="primary-stroke" style={{ stroke: primaryColor }}>
        <line
          className="whisker"
          x1="194.71"
          y1="103.657"
          x2="194.71"
          y2="322.919"
        />
        <line
          className="whisker"
          x1="207.5"
          y1="105.335"
          x2="181.754"
          y2="105.335"
        />
        <line
          className="whisker"
          x1="207.5"
          y1="321.651"
          x2="181.754"
          y2="321.651"
        />
        <line
          className="whisker"
          x1="305.373"
          y1="118.244"
          x2="305.373"
          y2="371.506"
        />
        <line
          className="whisker"
          x1="318.163"
          y1="119.922"
          x2="292.417"
          y2="119.922"
        />
        <line
          className="whisker"
          x1="318.163"
          y1="370.238"
          x2="292.417"
          y2="370.238"
        />
        <line
          className="whisker"
          x1="84.213"
          y1="229.197"
          x2="84.213"
          y2="448.458"
        />
        <line
          className="whisker"
          x1="97.003"
          y1="230.875"
          x2="71.258"
          y2="230.875"
        />
        <line
          className="whisker"
          x1="97.003"
          y1="447.191"
          x2="71.258"
          y2="447.191"
        />
        <line
          className="whisker"
          x1="415.953"
          y1="50.689"
          x2="415.953"
          y2="264.95"
        />
        <line
          className="whisker"
          x1="428.742"
          y1="52.367"
          x2="402.997"
          y2="52.367"
        />
        <line
          className="whisker"
          x1="428.742"
          y1="266.03"
          x2="402.997"
          y2="266.03"
        />
      </g>
      <g className="primary-fill" style={{ fill: primaryColor }}>
        <polygon
          id="Candle_00000165209661459121844280000004251976946761757057_"
          className="box"
          points="50,366.685 50,264.042 
		118.261,264.042 118.261,366.685 "
        />
        <polygon
          id="Candle_00000059269574352846140650000003074420534104876962_"
          className="box"
          points="160.58,273.725 160.58,138.502 
		228.84,138.502 228.84,273.725 "
        />
        <polygon
          id="Candle_00000116199801190919802600000006047105043637310088_"
          className="box"
          points="271.16,282.106 271.16,146.883 
		339.42,146.883 339.42,282.106 "
        />
        <polygon
          id="Candle_00000021087581734720710720000002982368070232113045_"
          className="box"
          points="381.739,221.61 381.739,86.386 
		450,86.386 450,221.61 "
        />
      </g>
      <line className="median" x1="118.261" y1="289.693" x2="50" y2="289.693" />
      <line
        className="median"
        x1="228.84"
        y1="185.077"
        x2="160.58"
        y2="185.077"
      />
      <line
        className="median"
        x1="339.42"
        y1="223.029"
        x2="271.16"
        y2="223.029"
      />
      <line
        className="median"
        x1="450"
        y1="132.961"
        x2="381.739"
        y2="132.961"
      />
    </svg>
  );
}
