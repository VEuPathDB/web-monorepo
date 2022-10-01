import { DuotoneSvgProps } from './types';

export default function BarSVG({
  primaryColor,
  secondaryColor,
}: DuotoneSvgProps) {
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
        .primary-bar&#123;fill-rule:evenodd;clip-rule:evenodd;&#125;
        .secondary-bar&#123;fill-rule:evenodd;clip-rule:evenodd;&#125;
      </style>
      <g style={{ fill: secondaryColor, stroke: secondaryColor }}>
        <polygon
          id="Bar_3_2_00000048495463390938596500000006975623614097428635_"
          className="secondary-bar"
          points="398.571,449.257 398.571,212.719 
        450,212.719 450,449.257 	"
        />
        <polygon
          id="Bar_3_2_00000052105773469109772780000006484209051384272565_"
          className="secondary-bar"
          points="253.491,449.257 253.491,50.743 
        304.92,50.743 304.92,449.257 	"
        />
        <polygon
          id="Bar_3_2_00000096753796436377555540000013936653411542286759_"
          className="secondary-bar"
          points="108.411,449.257 108.411,121.179 
        159.839,121.179 159.839,449.257 	"
        />
      </g>
      <g style={{ fill: primaryColor, stroke: primaryColor }}>
        <polygon
          id="Bar_3_2_00000061456671929733528670000010001431429790302369_"
          className="primary-bar"
          points="340.161,449.257 340.161,263.574 
        391.589,263.574 391.589,449.257 	"
        />
        <polygon
          id="Bar_3_2_00000027576470245849488200000010285833394883246778_"
          className="primary-bar"
          points="195.08,449.257 195.08,159.321 
        246.509,159.321 246.509,449.257 	"
        />
        <polygon
          id="Bar_3_2_00000059279461434882055010000004644917446937729950_"
          className="primary-bar"
          points="50,449.257 50,220.347 
        101.429,220.347 101.429,449.257 	"
        />
      </g>
    </svg>
  );
}
