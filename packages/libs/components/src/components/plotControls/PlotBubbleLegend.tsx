import React from 'react';
import { range } from 'd3';
import _ from 'lodash';

// set props for custom legend function
export interface PlotLegendBubbleProps {
  legendMin: number;
  legendMax: number;
  //   legendMin: number;
  valueToDiameterMapper: ((value: number) => number) | undefined;
  //   nTicks?: number;
  //   showMissingness?: boolean;
}

// legend ellipsis function for legend title and legend items (from custom legend work)
// const legendEllipsis = (label: string, ellipsisLength: number) => {
//   return (label || '').length > ellipsisLength
//     ? (label || '').substring(0, ellipsisLength) + '...'
//     : label;
// };

// make gradient colorscale legend into a component so it can be more easily incorporated into DK's custom legend if we need
export default function PlotBubbleLegend({
  legendMin,
  legendMax,
  //   legendMin,
  valueToDiameterMapper,
}: //   nTicks = 5,
//   showMissingness,
PlotLegendBubbleProps) {
  if (valueToDiameterMapper) {
    // Declare constants
    const tickFontSize = '0.8em';
    // const legendTextSize = '1.0em';
    const circleStrokeWidth = 3;
    const padding = 5;
    const numCircles = 3;

    // the value of the largest circle in the legend will be the smallest power of 10 that's larger than legendMax
    // const largestCircleValue = Math.pow(10, Math.ceil(Math.log10(legendMax)));
    // const circleValues = range(numCircles).map(
    //   (i) => largestCircleValue / Math.pow(10, i)
    // );

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
        width={largestCircleDiameter + (tickLength - largestCircleRadius) + 40}
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
