import React from 'react';
import { range } from 'd3';
import _ from 'lodash';

// set props for custom legend function
export interface PlotLegendBubbleProps {
  legendMax: number;
  valueToDiameterMapper: ((value: number) => number) | undefined;
}

export default function PlotBubbleLegend({
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

    // The largest circle's value will be the first number that's larger than
    // legendMax and has only one significant digit. Each smaller circle will
    // be half the size of the last (rounded and >= 1)
    const roundedOneSigFig = Number(legendMax.toPrecision(1));
    const largestCircleValue =
      legendMax <= 10
        ? legendMax
        : roundedOneSigFig < legendMax
        ? roundedOneSigFig + 10 ** Math.floor(Math.log10(legendMax)) // effectively rounding up
        : roundedOneSigFig; // no need to adjust - already rounded up
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
