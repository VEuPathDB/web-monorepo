import React from 'react';
import { range } from 'd3';

// set props for custom legend function
interface PlotLegendGradientProps {
  legendMax: number;
  legendMin: number;
  gradientColorscale: string[];
  nTicks: number; // MUST be odd!
  legendTitle?: string;
}
export default function PlotGradientLegend({
  legendMax,
  legendMin,
  gradientColorscale,
  legendTitle,
  nTicks,
}: PlotLegendGradientProps) {
  // Decalre constants
  const legendTextSize = '1.0em';

  /** Most of below identical to the current custom legend. Hoping that eventually the GradientColorscaleLegend can work within
   * the nice custom legend that DK created.  */
  return (
    <>
      {
        <div
          style={{
            border: '1px solid #dedede',
            boxShadow: '1px 1px 4px #00000066',
            padding: '1em',
          }}
        >
          <div
            title={legendTitle}
            style={{ cursor: 'pointer', fontSize: legendTextSize }}
          >
            {legendTitle != null
              ? legendEllipsis(legendTitle, 23)
              : legendTitle}
          </div>

          <GradientColorscaleLegend
            legendMax={legendMax}
            legendMin={legendMin}
            gradientColorscale={gradientColorscale}
            nTicks={nTicks}
          />
        </div>
      }
    </>
  );
}

// legend ellipsis function for legend title (23) and legend items (20) (from custom legend work)
const legendEllipsis = (label: string, ellipsisLength: number) => {
  return (label || '').length > ellipsisLength
    ? (label || '').substring(0, ellipsisLength) + '...'
    : label;
};

// make gradient colorscale legend into a component so it can be more easily incorporated into DK's custom legend
function GradientColorscaleLegend({
  legendMax,
  legendMin,
  gradientColorscale,
  nTicks,
}: PlotLegendGradientProps) {
  // set constants
  const tickFontSize = '0.8em';
  const gradientBoxHeight = 150;
  const gradientBoxWidth = 20;
  const tickLength = 4;

  // Create gradient stop points from the colorscale
  const stopPoints = gradientColorscale.map((color: string, index: number) => {
    let stopPercentage = (100 * index) / (gradientColorscale.length - 1) + '%';
    return (
      <stop
        offset={stopPercentage}
        stopColor={color}
        key={'gradientStop' + index}
      />
    );
  });

  // Create ticks
  const ticks = range(nTicks).map((a: number) => {
    const location: number =
      gradientBoxHeight - gradientBoxHeight * (a / (nTicks - 1)); // draw bottom to top
    return (
      <g className="axisTick" overflow="visible" key={'gradientTick' + a}>
        <line
          x1={gradientBoxWidth + 3}
          x2={gradientBoxWidth + 3 + tickLength}
          y1={location}
          y2={location}
          stroke="black"
          strokeWidth="1px"
        ></line>
        <text
          x={gradientBoxWidth + 6 + tickLength}
          y={location}
          alignmentBaseline="middle"
          fontSize={tickFontSize}
        >
          {(a / (nTicks - 1)) * (legendMax - legendMin) + legendMin}
        </text>
      </g>
    );
  });

  return (
    <div>
      <svg id="gradientLegend" height={gradientBoxHeight + 20}>
        <defs>
          <linearGradient id="linearGradient" x1="0" x2="0" y1="1" y2="0">
            {stopPoints}
          </linearGradient>
        </defs>
        <g overflow="visible" style={{ transform: 'translate(0, 10px)' }}>
          <rect
            width={gradientBoxWidth}
            height={gradientBoxHeight}
            fill="url(#linearGradient)"
          ></rect>
          {ticks}
        </g>
      </svg>
    </div>
  );
}
