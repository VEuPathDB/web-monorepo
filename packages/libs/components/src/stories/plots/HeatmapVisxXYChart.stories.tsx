import React from 'react';
import Heatmap, { HeatmapProps } from '../../plots/Heatmap';
import { Meta, Story } from '@storybook/react';
import { Group } from '@visx/group';
import genBins, { Bin, Bins } from '@visx/mock-data/lib/generators/genBins';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GlyphSeries, XYChart, Axis } from '@visx/xychart';
import {
  HeatmapCell,
  HeatmapDataVisx,
  HeatmapColumn,
} from '../../types/plots/heatmapVisx';
import { gradientDivergingColorscaleMap } from '../../../lib/types/plots/addOns';

export default {
  title: 'Plots/HeatmapCircleXYChart',
  component: Heatmap,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/42052',
  },
} as Meta;

// Constants
const MAX_POINT_SIZE = 10;
const MIN_POINT_SIZE = 1;

// eventually should be memo-ized
const pointSizeScale = scaleLinear()
  .domain([0, 1])
  .range([MIN_POINT_SIZE, MAX_POINT_SIZE]);

// const dataAccessors = {
//   xAccessor: (d: HeatmapColumn) => {
//     return Number(d?.x);
//   },
//   yAccessor: (d: HeatmapCell) => {
//     return Number(d?.y);
//   },
// };

// Make some fake data

const smallBinData: HeatmapDataVisx = genHeatmapData(20, 10);
const largeBinData: HeatmapDataVisx = genHeatmapData(200, 100);
const hugeBinData: HeatmapDataVisx = genHeatmapData(2000, 1000);

interface TemplateProps {
  binData: HeatmapDataVisx;
  nRows: number;
  nColumns: number;
}

const Template: Story<TemplateProps> = (args) => {
  const defaultMargin = { top: 10, left: 20, right: 20, bottom: 110 };

  const events = false;
  const margin = defaultMargin;
  const separation = 20;
  const width = args.nColumns * 70; // why do these behave differently?
  const height = args.nRows * 30;

  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right - separation
      : width;
  const xMax = size / 2;
  const yMax = height - margin.bottom - margin.top;

  // const binWidth = xMax / args.binData.length;
  // const binHeight = yMax / bucketSizeMax;
  // const radius = min([binWidth, binHeight], (d) => d) / 2;

  // xScale.range([0, xMax]);
  // yScale.range([yMax, 0]);

  return (
    <div>
      <XYChart
        height={height}
        width={width}
        xScale={{ type: 'linear', domain: [-0.5, args.nRows] }}
        yScale={{ type: 'linear', domain: [-0.5, args.nColumns] }}
      >
        <Axis orientation="top" numTicks={args.nRows} />
        <Axis orientation="left" numTicks={args.nColumns} />
        <Group>
          {args.binData.map((column) => {
            return (
              <GlyphSeries
                dataKey={'data' + column.x}
                data={column.column}
                xAccessor={() => Number(column?.x)}
                yAccessor={(d) => d?.y}
                size={(d) => d?.radius * 20}
                colorAccessor={(d) => gradientDivergingColorscaleMap(d?.value)}
              />
            );
          })}
        </Group>
      </XYChart>
    </div>
  );
};

export const Small = Template.bind({});
Small.args = {
  binData: smallBinData,
  nColumns: 10,
  nRows: 20,
};

export const Large = Template.bind({});
Large.args = {
  binData: largeBinData,
  nColumns: 100,
  nRows: 200,
};

// My function for generating fake data
function genHeatmapData(nRows: number, nColumns: number) {
  return new Array(nRows).fill(1).reduce(
    (arr, _, i) =>
      arr.concat([
        {
          x: i,
          column: genHeatmapRow(nColumns),
        },
      ]),
    []
  );
}

function genHeatmapRow(nColumns: number) {
  return new Array(nColumns).fill(1).reduce(
    (arr2, _, i2) =>
      arr2.concat([
        {
          y: i2,
          value: Math.random() - 0.5,
          radius: Math.random(),
        },
      ]),
    []
  );
}
