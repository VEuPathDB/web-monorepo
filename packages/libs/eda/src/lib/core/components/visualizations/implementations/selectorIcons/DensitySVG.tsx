import { DuotoneSvgProps } from './types';

export default function DensitySVG({
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
        .primary-density&#123;fill-rule:evenodd;clip-rule:evenodd;stroke:#FFFFFF;stroke-width:4.3171;stroke-miterlimit:10;&#125;
        .secondary-density&#123;fill-rule:evenodd;clip-rule:evenodd;&#125;
        .outline&#123;fill:none;stroke:#FFFFFF;stroke-width:4;stroke-miterlimit:10;&#125;
      </style>
      <path
        className="primary-density"
        style={{ fill: primaryColor }}
        d="M50,50.848c55.795,0,3.709,341.517,200.737,341.517c102.873,0,152.019-169.374,199.097-169.374l0.409,226.434
      H49.486L50,50.848z"
      />
      <g>
        <path
          className="secondary-density"
          style={{ fill: secondaryColor }}
          d="M57.718,449.372c190.685-22.865,188.467-260.74,241.099-260.74c69.574,0,101.313,202.286,151.402,248.114
        l0.023,12.678L57.718,449.372C57.718,449.372,48.091,450.527,57.718,449.372z"
        />
        <path
          className="outline"
          d="M57.718,449.372c190.685-22.865,188.467-260.74,241.099-260.74c69.574,0,101.313,202.286,151.402,248.114
        l0.023,12.678L57.718,449.372C57.718,449.372,48.091,450.527,57.718,449.372z"
        />
      </g>
    </svg>
  );
}
