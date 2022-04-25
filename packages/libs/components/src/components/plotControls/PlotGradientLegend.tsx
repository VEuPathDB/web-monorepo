import React from 'react';
import { range } from 'd3';

import {
  SequentialGradientColorscale,
  DivergingGradientColorscale,
} from '../../types/plots/addOns';

// set props for custom legend function
export interface PlotLegendGradientProps {
  legendMax: number;
  legendMin: number;
  gradientColorscaleType?: string;
  nTicks?: number; // MUST be odd!
  legendTitle?: string;
  showMissingness?: boolean;
}
export default function PlotGradientLegend({
  legendMax,
  legendMin,
  gradientColorscaleType,
  legendTitle,
  nTicks,
  showMissingness,
}: PlotLegendGradientProps) {
  // Declare constants
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
            gradientColorscaleType={gradientColorscaleType}
            nTicks={nTicks}
            showMissingness={showMissingness}
          />
        </div>
      }
    </>
  );
}

// legend ellipsis function for legend title and legend items (from custom legend work)
const legendEllipsis = (label: string, ellipsisLength: number) => {
  return (label || '').length > ellipsisLength
    ? (label || '').substring(0, ellipsisLength) + '...'
    : label;
};

// make gradient colorscale legend into a component so it can be more easily incorporated into DK's custom legend if we need
function GradientColorscaleLegend({
  legendMax,
  legendMin,
  gradientColorscaleType,
  nTicks,
  showMissingness,
}: PlotLegendGradientProps) {
  // Declare constants
  const tickFontSize = '0.8em';
  const gradientBoxHeight = 150;
  const gradientBoxWidth = 20;
  const tickLength = 4;
  const defaultNTicks = 5;
  const legendTextSize = '1.0em';

  nTicks = nTicks || defaultNTicks;

  let gradientColorscale =
    gradientColorscaleType == 'divergent'
      ? DivergingGradientColorscale
      : SequentialGradientColorscale;

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
      gradientBoxHeight - gradientBoxHeight * (a / (nTicks! - 1)); // draw bottom to top
    return (
      <g className="axisTick" overflow="visible" key={'gradientTick' + a}>
        <line
          x1={gradientBoxWidth}
          x2={gradientBoxWidth + tickLength}
          y1={location}
          y2={location}
          stroke="black"
          strokeWidth="1px"
        ></line>
        <text
          x={gradientBoxWidth + 3 + tickLength}
          y={location}
          alignmentBaseline="middle"
          fontSize={tickFontSize}
        >
          {(a / (nTicks! - 1)) * (legendMax - legendMin) + legendMin}
        </text>
      </g>
    );
  });

  return (
    <div>
      <svg id="gradientLegend" height={gradientBoxHeight + 40} width={150}>
        <defs>
          <linearGradient id="linearGradient" x1="0" x2="0" y1="1" y2="0">
            {stopPoints}
          </linearGradient>
        </defs>
        <g style={{ transform: 'translate(0, 10px)' }}>
          <rect
            width={gradientBoxWidth}
            height={gradientBoxHeight}
            fill="url(#linearGradient)"
          ></rect>
          {ticks}
        </g>
      </svg>
      {showMissingness && (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '2em' }}>
            <div
              style={{
                textAlign: 'center',
                fontWeight: 'normal',
                fontSize: `calc(1.5 * ${legendTextSize})`,
                color: '#999',
              }}
            >
              &times;
            </div>
          </div>
          &nbsp;&nbsp;
          <label
            title={'No data'}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: legendTextSize,
              color: '#999',
            }}
          >
            <i>{legendEllipsis('No data', 20)}</i>
          </label>
        </div>
      )}
    </div>
  );
}
