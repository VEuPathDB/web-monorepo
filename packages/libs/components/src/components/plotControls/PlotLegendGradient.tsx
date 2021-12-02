import React from 'react';
import { range } from 'd3';

// set props for custom legend function
interface PlotLegendGradientProps {
  legendMax: number;
  legendMin: number;
  gradientColormap: string[];
  nTicks: number; // MUST be odd!
  legendTitle?: string;
}
export default function PlotLegendGradient({
  legendMax,
  legendMin,
  gradientColormap,
  legendTitle,
  nTicks,
}: PlotLegendGradientProps) {
  // Calculate ticks here
  const legendTextSize = '1.0em';

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

          <GradientColormapLegend
            legendMax={legendMax}
            legendMin={legendMin}
            gradientColormap={gradientColormap}
            nTicks={nTicks}
          />
        </div>
      }
    </>
  );
}

// legend ellipsis function for legend title (23) and legend items (20)
const legendEllipsis = (label: string, ellipsisLength: number) => {
  return (label || '').length > ellipsisLength
    ? (label || '').substring(0, ellipsisLength) + '...'
    : label;
};

// Make gradient colormap legend into a component so it can be more easily incorporated into DK's custom legend
function GradientColormapLegend({
  legendMax,
  legendMin,
  gradientColormap,
  nTicks,
}: PlotLegendGradientProps) {
  // set default values
  const tickFontSize = '0.8em';
  const gradientBoxHeight = 150;
  const gradientBoxWidth = 20;
  const tickLength = 4;

  // Create gradient stop points
  const stopPoints = gradientColormap.map((color: string, index: number) => {
    let stopPercentage = (100 * index) / (gradientColormap.length - 1) + '%';
    return <stop offset={stopPercentage} stopColor={color} />;
  });

  // Create ticks
  const ticks = range(nTicks).map((a: number) => {
    const location: number = gradientBoxHeight * (a / (nTicks - 1));
    return (
      <g className="axisTick" overflow="visible">
        <line
          x1={gradientBoxWidth + 3}
          x2={gradientBoxWidth + 3 + tickLength}
          y1={location}
          y2={location}
          stroke="black"
          stroke-width="1px"
        ></line>
        <text
          x={gradientBoxWidth + 6 + tickLength}
          y={location}
          alignment-baseline="middle"
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
          <linearGradient id="linearGradient" x1="0" x2="0" y1="0" y2="1">
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
