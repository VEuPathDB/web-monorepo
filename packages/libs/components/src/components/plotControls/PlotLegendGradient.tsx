import React from 'react';
import { Checkbox } from '@material-ui/core';
import * as ColorMath from 'color-math';
import { scaleLinear } from 'd3-scale';
import {
  SequentialGradientColormap,
  DivergingGradientColormap,
} from '../../types/plots/addOns';
import { interpolateLab, create, axisRight } from 'd3';
// import {Legend, Swatches} from 'https://observablehq.com/@d3/color-legend';

// set props for custom legend function
interface PlotLegendGradientProps {
  legendMax: number;
  legendMin: number;
  gradientColorMap: any;
  legendTitle?: string;
  markMidpoint?: boolean;
}
export default function PlotLegendGradient({
  legendMax,
  legendMin,
  gradientColorMap,
  legendTitle,
  markMidpoint,
}: PlotLegendGradientProps) {
  // Calculate ticks here

  // set some default sizes
  const legendTextSize = '1.0em';
  const gradientBoxHeight = 150;
  const gradientBoxWidth = 20;

  // Set up gradient (from visual cinnamon)
  // const colorScale = scaleLinear<string>()
  //   .range(gradientColorMap);

  const gradientDivergingColorscaleMap = scaleLinear<string>()
    .domain([0, 1])
    .range(SequentialGradientColormap)
    .interpolate(interpolateLab);

  let svg = create('svg');
  //Append a defs (for definition) element to your SVG
  let defs = svg.append('defs');

  //Append a linearGradient element to the defs and give it a unique id
  let linearGradient = defs.append('linearGradient').attr('id', 'grad1');

  //Vertical gradient
  linearGradient
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');

  //Set the color for the start (0%)
  linearGradient
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#ffa474'); //light blue

  //Set the color for the end (100%)
  linearGradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#8b0000'); //dark blue

  svg
    .append('rect')
    .attr('width', 300)
    .attr('height', 20)
    .style('fill', 'url(#linear-gradient)');
  //Append multiple color stops by using D3's data/enter step
  // linearGradient.selectAll("stop")
  // .data( colorScale.range() )
  // .enter().append("stop")
  // .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
  // .attr("stop-color", function(d) { return d; });

  // Create gradient stop points
  const stopPoints = SequentialGradientColormap.map(
    (color: string, index: number) => {
      let stopPercentage =
        (100 * index) / (SequentialGradientColormap.length - 1) + '%';
      console.log(stopPercentage);
      return <stop offset={stopPercentage} stopColor={color} />;
    }
  );

  // Create ticks
  let colorAxisScale = scaleLinear().domain([0, 100]).range([0, 1]);
  let colorAxis = axisRight(colorAxisScale);

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
          <div>
            {/* Gradient box */}
            <svg id="gradientLegend">
              <defs>
                <linearGradient id="linearGradient" x1="0" x2="0" y1="0" y2="1">
                  {stopPoints}
                </linearGradient>
              </defs>
              <rect
                width={gradientBoxWidth}
                height={gradientBoxHeight}
                fill="url(#linearGradient)"
              ></rect>
              <line
                x1={gradientBoxWidth + 5}
                y1="0"
                x2={gradientBoxWidth + 5}
                y2={gradientBoxHeight}
                stroke="black"
                stroke-width="1px"
              ></line>
              {colorAxis}
            </svg>
          </div>
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

// Ann write your own version of this that's all typed and such

// function Legend(color, {
//   title,
//   tickSize = 6,
//   width = 320,
//   height = 44 + tickSize,
//   marginTop = 18,
//   marginRight = 0,
//   marginBottom = 16 + tickSize,
//   marginLeft = 0,
//   ticks = width / 64,
//   tickFormat,
//   tickValues
// } = {}) {

// // Makes the gradient bar
// function ramp(color, n = 256) {
//   const canvas = document.createElement("canvas");
//   canvas.width = n;
//   canvas.height = 1;
//   const context = canvas.getContext("2d");
//   for (let i = 0; i < n; ++i) {
//     context.fillStyle = color(i / (n - 1));
//     context.fillRect(i, 0, 1, 1);
//   }
//   return canvas;
// }

// const svg = d3.create("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("viewBox", [0, 0, width, height])
//     .style("overflow", "visible")
//     .style("display", "block");

// let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
// let x;

// // Continuous
// if (color.interpolate) {
//   const n = Math.min(color.domain().length, color.range().length);

//   x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

//   svg.append("image")
//       .attr("x", marginLeft)
//       .attr("y", marginTop)
//       .attr("width", width - marginLeft - marginRight)
//       .attr("height", height - marginTop - marginBottom)
//       .attr("preserveAspectRatio", "none")
//       .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
// }

// // Sequential
// else if (color.interpolator) {
//   x = Object.assign(color.copy()
//       .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
//       {range() { return [marginLeft, width - marginRight]; }});

//   svg.append("image")
//       .attr("x", marginLeft)
//       .attr("y", marginTop)
//       .attr("width", width - marginLeft - marginRight)
//       .attr("height", height - marginTop - marginBottom)
//       .attr("preserveAspectRatio", "none")
//       .attr("xlink:href", ramp(color.interpolator()).toDataURL());

//   // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
//   if (!x.ticks) {
//     if (tickValues === undefined) {
//       const n = Math.round(ticks + 1);
//       tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
//     }
//     if (typeof tickFormat !== "function") {
//       tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
//     }
//   }
// }

// // Threshold
// else if (color.invertExtent) {
//   const thresholds
//       = color.thresholds ? color.thresholds() // scaleQuantize
//       : color.quantiles ? color.quantiles() // scaleQuantile
//       : color.domain(); // scaleThreshold

//   const thresholdFormat
//       = tickFormat === undefined ? d => d
//       : typeof tickFormat === "string" ? d3.format(tickFormat)
//       : tickFormat;

//   x = d3.scaleLinear()
//       .domain([-1, color.range().length - 1])
//       .rangeRound([marginLeft, width - marginRight]);

//   svg.append("g")
//     .selectAll("rect")
//     .data(color.range())
//     .join("rect")
//       .attr("x", (d, i) => x(i - 1))
//       .attr("y", marginTop)
//       .attr("width", (d, i) => x(i) - x(i - 1))
//       .attr("height", height - marginTop - marginBottom)
//       .attr("fill", d => d);

//   tickValues = d3.range(thresholds.length);
//   tickFormat = i => thresholdFormat(thresholds[i], i);
// }

// // Ordinal
// else {
//   x = d3.scaleBand()
//       .domain(color.domain())
//       .rangeRound([marginLeft, width - marginRight]);

//   svg.append("g")
//     .selectAll("rect")
//     .data(color.domain())
//     .join("rect")
//       .attr("x", x)
//       .attr("y", marginTop)
//       .attr("width", Math.max(0, x.bandwidth() - 1))
//       .attr("height", height - marginTop - marginBottom)
//       .attr("fill", color);

//   tickAdjust = () => {};
// }

// svg.append("g")
//     .attr("transform", `translate(0,${height - marginBottom})`)
//     .call(d3.axisBottom(x)
//       .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
//       .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
//       .tickSize(tickSize)
//       .tickValues(tickValues))
//     .call(tickAdjust)
//     .call(g => g.select(".domain").remove())
//     .call(g => g.append("text")
//       .attr("x", marginLeft)
//       .attr("y", marginTop + marginBottom - height - 6)
//       .attr("fill", "currentColor")
//       .attr("text-anchor", "start")
//       .attr("font-weight", "bold")
//       .attr("class", "title")
//       .text(title));

// return svg.node();
// }
