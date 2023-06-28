import React from 'react';
import { range } from 'd3';
import _ from 'lodash';

// set props for custom legend function
export interface PlotLegendBubbleProps {
  legendMax: number;
  //   legendMin: number;
  valueToDiameterMapper: (value: number) => number;
  //   nTicks?: number; // MUST be odd!
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
  legendMax,
  //   legendMin,
  valueToDiameterMapper,
}: //   nTicks = 5,
//   showMissingness,
PlotLegendBubbleProps) {
  // Declare constants
  //   const gradientBoxHeight = 150;
  //   const gradientBoxWidth = 20;
  const tickFontSize = '0.8em';
  const legendTextSize = '1.0em';
  const circleStrokeWidth = 3;
  const padding = 5;
  // const largestDataCircleSize = valueToDiameterMapper(legendMax);
  const numCircles = 3;

  // the value of the largest circle in the legend will be the smallest power of 10 that's larger than legendMax
  // const largestCircleValue = Math.pow(10, Math.ceil(Math.log10(legendMax)));
  // const circleValues = range(numCircles).map(
  //   (i) => largestCircleValue / Math.pow(10, i)
  // );

  console.log('here9');

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
  console.log({ legendMax, legendMaxLog10, largestCircleValue, circleValues });

  const largestCircleDiameter = valueToDiameterMapper(largestCircleValue);
  const largestCircleRadius = largestCircleDiameter / 2;

  console.log({ circleValues });

  const tickLength = largestCircleRadius + 5;

  // Create gradient stop points from the colorscale from values [legendMin TO legendMax] at an arbitrary 50 step resolution
  //   const numCircles = 3;
  //   const legendStep = legendMax / (numCircles - 1);
  // //   const fudge = legendStep / 10; // to get an inclusive range from d3 we have to make a slightly too-large max
  // const stopPoints = range(legendStep, legendMax, legendStep).map(
  //     (value: number, index: number) => {
  //       const size = valueToDiameterMapper(value);
  //       return (
  //         <stop
  //           offset={stopPercentage}
  //           stopColor={value}
  //           key={'gradientStop' + index}
  //         />
  //       );
  //     }
  //   );

  // let svgHTML: string = '';
  // set drawing area
  // svgHTML +=
  // '<svg width="' + largestCircleSize + '" height="' + largestCircleSize + '">'; // initiate svg marker icon

  const BubbleLegendSVG = () => (
    <svg
      width={largestCircleDiameter + (tickLength - largestCircleRadius) + 40}
      height={largestCircleDiameter + circleStrokeWidth * 2 + padding * 2}
    >
      {circleValues.map((value, i) => {
        console.log({ value });
        // const value = legendMax * (i / (numCircles - 1));
        const circleDiameter = valueToDiameterMapper(value);
        const circleRadius = circleDiameter / 2;
        const tickY =
          padding + largestCircleDiameter + circleStrokeWidth - circleDiameter;
        // const stopPercentage = (i / (numCircles - 1)) * 100;

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
              stroke-width={circleStrokeWidth}
              fill="white"
            />
            <g className="axisTick" overflow="visible" key={'gradientTick' + i}>
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
  // '<circle cx="' +
  // (largestCircleSize / 2) +
  // '" cy="' +
  // (largestCircleSize - (circleDiameter / 2)) +
  // '" r="' +
  // (circleDiameter / 2) +
  // '" stroke="black" stroke-width="2" fill="white" />';

  // </svg>
  // );

  // });

  // for display, convert large value with k (e.g., 12345 -> 12k): return original value if less than a criterion
  // const sumLabel = props.markerLabel ?? String(fullPieValue);

  // draw a larger white-filled circle
  // svgHTML +=
  //   '<circle cx="' +
  //   circleRadius +
  //   '" cy="' +
  //   circleRadius +
  //   '" r="' +
  //   circleRadius +
  //   '" stroke="green" stroke-width="0" fill="white" />';

  // create bubble
  //TODO: two things to consider: a) bubble size; b) bubble color
  // svgHTML +=
  //   '<circle cx="' +
  //   circleRadius +
  //   '" cy="' +
  //   circleRadius +
  //   '" r="' +
  //   circleRadius +
  //   '" stroke="green" stroke-width="0" fill="' +
  //   // color is possibly undefined
  //   props.data[0].color +
  //   '" />';

  //TODO: do we need to show total number for bubble marker?
  // adding total number text/label and centering it
  // svgHTML +=
  //   '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" opacity="1" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="1em">' +
  //   props.data[0].value +
  //   '</text>';

  // // check isAtomic: draw pushpin if true
  // if (props.isAtomic) {
  //   let pushPinCode = '&#128392;';
  //   svgHTML +=
  //     '<text x="86%" y="14%" dominant-baseline="middle" text-anchor="middle" opacity="0.75" font-weight="bold" font-size="1.2em">' +
  //     pushPinCode +
  //     '</text>';
  // }

  // // closing svg tag
  // svgHTML += '</svg>';

  // Create ticks
  // const ticks = range(nTicks).map((a: number) => {
  //   const location: number =
  //     gradientBoxHeight - gradientBoxHeight * (a / (nTicks! - 1)); // draw bottom to top
  //   return (
  //     <g className="axisTick" overflow="visible" key={'gradientTick' + a}>
  //       <line
  //         x1={gradientBoxWidth + 1}
  //         x2={gradientBoxWidth + tickLength + 1}
  //         y1={location}
  //         y2={location}
  //         stroke="black"
  //         strokeWidth="1px"
  //       ></line>
  //       <text
  //         x={gradientBoxWidth + 4 + tickLength}
  //         y={location}
  //         dominantBaseline="middle"
  //         fontSize={tickFontSize}
  //       >
  //         {(
  //           (a / (nTicks! - 1)) * (legendMax - legendMin) +
  //           legendMin
  //         ).toPrecision(3)}
  //       </text>
  //     </g>
  //   );
  // });

  return (
    <div>
      <BubbleLegendSVG />
    </div>
  );
}
