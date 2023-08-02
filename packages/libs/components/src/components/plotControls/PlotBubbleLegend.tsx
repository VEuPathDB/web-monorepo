import React from 'react';
import { range } from 'd3';
import _ from 'lodash';

// set props for custom legend function
export interface PlotLegendBubbleProps {
  legendMin: number;
  legendMax: number;
  valueToDiameterMapper: ((value: number) => number) | undefined;
}

// legend ellipsis function for legend title and legend items (from custom legend work)
// const legendEllipsis = (label: string, ellipsisLength: number) => {
//   return (label || '').length > ellipsisLength
//     ? (label || '').substring(0, ellipsisLength) + '...'
//     : label;
// };

export default function PlotBubbleLegend({
  legendMin,
  legendMax,
  valueToDiameterMapper,
}: PlotLegendBubbleProps) {
  if (valueToDiameterMapper) {
    // Declare constants
    const tickFontSize = '0.8em';
    // const legendTextSize = '1.0em';
    const circleStrokeWidth = 3;
    const padding = 5;
    const numCircles = 3;

    const legendMaxLog10 = Math.floor(Math.log10(legendMax));
    const largestCircleValue =
      legendMax <= 10
        ? legendMax
        : (Number(legendMax.toPrecision(1)[0]) + 1) * 10 ** legendMaxLog10;
    const circleValues = _.uniq(
      range(numCircles)
        .map((i) => Math.round(largestCircleValue / 2 ** i))
        .filter((value) => value >= 1)
    );

    const largestCircleDiameter = valueToDiameterMapper(largestCircleValue);
    const largestCircleRadius = largestCircleDiameter / 2;

    const tickLength = largestCircleRadius + 5;

    return (
      <svg
        width={largestCircleDiameter + (tickLength - largestCircleRadius) + 50}
        height={largestCircleDiameter + circleStrokeWidth * 2 + padding * 2}
      >
        {circleValues.map((value, i) => {
          const circleDiameter = valueToDiameterMapper(value);
          const circleRadius = circleDiameter / 2;
          const tickY =
            padding +
            largestCircleDiameter +
            circleStrokeWidth -
            circleDiameter;

          return (
            <>
              <circle
                cx={padding + largestCircleRadius + circleStrokeWidth}
                cy={
                  padding +
                  largestCircleDiameter +
                  circleStrokeWidth -
                  circleRadius
                }
                r={circleRadius}
                stroke="black"
                strokeWidth={circleStrokeWidth}
                fill="white"
              />
              <g
                className="axisTick"
                overflow="visible"
                key={'gradientTick' + i}
              >
                <line
                  x1={padding + largestCircleRadius + circleStrokeWidth + 1}
                  x2={
                    padding +
                    largestCircleRadius +
                    circleStrokeWidth +
                    tickLength +
                    1
                  }
                  y1={tickY}
                  y2={tickY}
                  stroke="black"
                  strokeDasharray="2 2"
                  strokeWidth={2}
                />
                <text
                  x={padding + largestCircleRadius + tickLength + 5}
                  y={tickY}
                  dominantBaseline="middle"
                  fontSize={tickFontSize}
                >
                  {value}
                </text>
              </g>
            </>
          );
        })}
      </svg>
    );
  } else {
    return null;
  }

  // for display, convert large value with k (e.g., 12345 -> 12k): return original value if less than a criterion
  // const sumLabel = props.markerLabel ?? String(fullPieValue);
}
