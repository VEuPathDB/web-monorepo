import React from 'react';
import Heatmap, { HeatmapProps } from '../../plots/Heatmap';
import { Meta, Story } from '@storybook/react';
import { Group } from '@visx/group';
import genBins, { Bin, Bins } from '@visx/mock-data/lib/generators/genBins';
import { scaleLinear } from '@visx/scale';
import { HeatmapCircle } from '@visx/heatmap';
import { getSeededRandom } from '@visx/mock-data';
import { useTooltip, Tooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { XYChart } from '@visx/xychart';

export default {
  title: 'Plots/HeatmapCircle',
  component: Heatmap,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/42052',
  },
} as Meta;

// Make some fake data
const seededRandom = getSeededRandom(0.41);

const smallBinData = genBins(
  /* length = */ 10,
  /* height = */ 16,
  /** binFunc */ (idx) => 150 * idx,
  /** countFunc */ (i, number) => 25 * (number - i) * seededRandom()
);

const largeBinData = genBins(
  /* length = */ 100,
  /* height = */ 160,
  /** binFunc */ (idx) => 150 * idx,
  /** countFunc */ (i, number) => 25 * (number - i) * seededRandom()
);

type TooltipData = string;

interface TemplateProps {
  binData: Bins[];
}

const Template: Story<TemplateProps> = (args) => {
  const hot1 = '#77312f';
  const hot2 = '#f33d15';
  const cool1 = '#122549';
  const cool2 = '#b4fbde';
  const background = '#28272c';

  function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
    return Math.max(...data.map(value));
  }

  function min<Datum>(data: Datum[], value: (d: Datum) => number): number {
    return Math.min(...data.map(value));
  }

  // accessors
  const bins = (d: Bins) => d.bins;
  const count = (d: Bin) => d.count;

  const colorMax = max(args.binData, (d) => max(bins(d), count));
  const bucketSizeMax = max(args.binData, (d) => bins(d).length);

  // scales
  const xScale = scaleLinear<number>({
    domain: [0, args.binData.length],
  });
  const yScale = scaleLinear<number>({
    domain: [0, bucketSizeMax],
  });
  const circleColorScale = scaleLinear<string>({
    range: [hot1, hot2],
    domain: [0, colorMax],
  });
  const opacityScale = scaleLinear<number>({
    range: [0.1, 1],
    domain: [0, colorMax],
  });

  const defaultMargin = { top: 10, left: 20, right: 20, bottom: 110 };

  const events = false;
  const margin = defaultMargin;
  const separation = 20;
  const width = 1600;
  const height = 900;

  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right - separation
      : width;
  const xMax = size / 2;
  const yMax = height - margin.bottom - margin.top;

  const binWidth = xMax / args.binData.length;
  const binHeight = yMax / bucketSizeMax;
  const radius = min([binWidth, binHeight], (d) => d) / 2;

  xScale.range([0, xMax]);
  yScale.range([yMax, 0]);

  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<TooltipData>({
    // initial tooltip state
    tooltipOpen: true,
    tooltipLeft: width / 3,
    tooltipTop: height / 3,
    tooltipData: 'Move me with your mouse or finger',
  });

  const handleMouseOver = (event: any) => {
    const coords = localPoint(event.target.ownerSVGElement, event);
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData: 'hi',
    });
  };

  return (
    <svg width={width} height={height}>
      <HeatmapCircle
        data={args.binData}
        xScale={(d) => xScale(d) ?? 0}
        yScale={(d) => yScale(d) ?? 0}
        colorScale={circleColorScale}
        // radius={radius}
        left={300}
        gap={2}
        top={50}
      >
        {(heatmap) => {
          console.log(heatmap);
          return heatmap.map((heatmapBins) =>
            heatmapBins.map((bin) => (
              <circle
                key={`heatmap-circle-${bin.row}-${bin.column}`}
                className="visx-heatmap-circle"
                cx={bin.cx}
                cy={bin.cy}
                r={Math.random() * 5}
                fill={bin.color}
                fillOpacity={bin.opacity}
                onClick={() => {
                  if (!events) return;
                  const { row, column } = bin;
                  alert(JSON.stringify({ row, column, bin: bin.bin }));
                }}
                onMouseOver={handleMouseOver}
              />
            ))
          );
        }}
      </HeatmapCircle>
      {/* <g transform={`translate(0, ${height-60})`}> */}
      <AxisBottom scale={xScale} />
      {/* </g> */}
      {/* <g transform={`translate(0, 40)`}> */}
      <AxisLeft scale={yScale} />
      {/* </g> */}
    </svg>
  );
};

export const Small = Template.bind({});
Small.args = {
  binData: smallBinData,
};

export const Large = Template.bind({});
Large.args = {
  binData: largeBinData,
};
