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
  gradientColorscaleType?: 'sequential' | 'divergent';
  nTicks?: number; // MUST be odd!
  showMissingness?: boolean;
}

// legend ellipsis function for legend title and legend items (from custom legend work)
const legendEllipsis = (label: string, ellipsisLength: number) => {
  return (label || '').length > ellipsisLength
    ? (label || '').substring(0, ellipsisLength) + '...'
    : label;
};

// make gradient colorscale legend into a component so it can be more easily incorporated into DK's custom legend if we need
export default function PlotGradientLegend({
  legendMax,
  legendMin,
  gradientColorscaleType,
  nTicks,
  showMissingness,
}: PlotLegendGradientProps) {
  // Declare constants
  const gradientBoxHeight = 150;
  const gradientBoxWidth = 20;
  const tickLength = 4;
  const defaultNTicks = 5;
  const tickFontSize = '0.8em';
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
          x1={gradientBoxWidth + 1}
          x2={gradientBoxWidth + tickLength + 1}
          y1={location}
          y2={location}
          stroke="black"
          strokeWidth="1px"
        ></line>
        <text
          x={gradientBoxWidth + 4 + tickLength}
          y={location}
          dominantBaseline="middle"
          fontSize={tickFontSize}
        >
          {(a / (nTicks! - 1)) * (legendMax - legendMin) + legendMin}
        </text>
      </g>
    );
  });

  return (
    <div>
      <svg id="gradientLegend" height={gradientBoxHeight + 20} width={150}>
        <defs>
          <linearGradient id="linearGradient" x1="0" x2="0" y1="1" y2="0">
            {stopPoints}
          </linearGradient>
        </defs>
        <g style={{ transform: 'translate(5px, 10px)' }}>
          <rect
            width={gradientBoxWidth}
            height={gradientBoxHeight}
            fill="url(#linearGradient)"
            stroke="black"
            strokeWidth={1}
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
          <label
            title={'No data'}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: legendTextSize,
              color: '#999',
              margin: 0,
            }}
          >
            <i>{legendEllipsis('No data', 20)}</i>
          </label>
        </div>
      )}
    </div>
  );
}
