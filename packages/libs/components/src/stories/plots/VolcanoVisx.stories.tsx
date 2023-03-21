import React, { useState } from 'react';
import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import {
  XYChart,
  Tooltip,
  Axis,
  Grid,
  GlyphSeries,
  LineSeries,
} from '@visx/xychart';
// import { min, max, lte, gte } from 'lodash';
// import { dataSetProcess, xAxisRange, yAxisRange } from './ScatterPlot.storyData';
import { Story, Meta } from '@storybook/react/types-6-0';
// test to use RadioButtonGroup directly instead of ScatterPlotControls
import { NumberRange } from '../../types/general';

import { ScatterPlotData } from '../../types/plots';
import { AxisBottom } from '@visx/visx';
import { scaleLinear } from '@visx/scale';
import ControlsHeader from '../../../lib/components/typography/ControlsHeader';
import { Line } from '@visx/shape';
import { Group } from '@visx/group';

export default {
  title: 'Plots/VolcanoPlotVisx',
  component: VolcanoPlot,
} as Meta;

interface VEuPathDBVolcanoPlotData {
  volcanoplot: {
    data: Array<{
      foldChange: string[];
      pValue: string[];
      adjustedPValue: string[];
      pointId: string[];
      overlayValue: string;
      id: string;
    }>;
  };
}

// Let's make some fake data!
const dataSetVolcano: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    data: [
      {
        foldChange: ['2', '3'],
        pValue: ['0.001', '0.0001'],
        adjustedPValue: ['0.01', '0.001'],
        pointId: ['a', 'b'],
        overlayValue: 'positive',
        id: 'id1',
      },
      {
        foldChange: ['0.5', '0', '1', '0.5', '0.1', '4', '0.2'],
        pValue: ['0.001', '0.0001', '0.2', '0.1', '0.7', '0.1', '0.4'],
        adjustedPValue: ['0.01', '0.001', '2', '1', '7', '1', '4'],
        pointId: ['c', 'd', 'e', 'f', 'g', 'h', 'i'],
        overlayValue: 'none',
        id: 'id2',
      },
      {
        foldChange: ['0.01', '0.02', '0.03'],
        pValue: ['0.001', '0.0001', '0.002'],
        adjustedPValue: ['0.01', '0.001', '0.02'],
        pointId: ['j', 'k', 'l'],
        overlayValue: 'negative',
        id: 'id3',
      },
    ],
  },
};

// These can go into addons eventually. I'd expect other vizs that involve significance to use these as well
// These are NOT the final proposed colors
const highMedLowColors = ['#dd1111', '#bbbbbb', '#1111dd'];

const plotTitle = 'Volcano erupt!';

interface TemplateProps {
  data: VEuPathDBVolcanoPlotData;
  markerBodyOpacity: number;
  // foldChangeHighGate: number;
  // foldChangeLowGate: number; // we can't have gates unless we mimic the backend updating the data format when we change gates
  adjustedPValueGate: number;
}

const Template: Story<TemplateProps> = (args) => {
  const { dataSetProcess: datasetProcess } = processVolcanoData(
    args.data,
    highMedLowColors
  );

  // Better to break into a high and low prop? Would be more clear
  const foldChangeGates = [-1.5, 1.5];

  const comparisonLabels = ['group a', 'group b'];

  /**
   * Volcano knows
   * x and y label (always fold change and pvalue)
   */

  /**
   * datasetProcess has three or fewer series
   * has columms for foldChange, adjustedPValue, pointId, significanceDirection (naming help!!)
   *
   */

  const independentAxisRange = {
    min: -5,
    max: 5,
  };
  // Determined by the data and symmetric around 0 by default?
  const dependentAxisRange = {
    min: 0,
    max: 0.03,
  }; // By default max determined by data and min at 0

  const accessors = {
    xAccessor: (d: any) => {
      return d.x;
    },
    yAccessor: (d: any) => {
      return d.y;
    },
  };

  const bottomScale = scaleLinear({
    domain: [-4, 4],
    range: [-1, 8],
    nice: true,
  });

  return (
    <Group>
      <XYChart
        height={300}
        xScale={{ type: 'linear', domain: [-7, 7] }}
        yScale={{ type: 'linear', domain: [-2, 4] }}
        width={300}
      >
        <Axis orientation="left" label="-log10 p value" />
        <Grid columns={false} numTicks={4} />
        <Axis orientation="bottom" label="log2 Fold Change" />
        {datasetProcess.series.map((series, index) => {
          console.log(String(index) + 'a');
          return (
            <GlyphSeries
              dataKey={String(index)}
              data={(series as unknown) as any[]}
              {...accessors}
            />
          );
        })}
        {/* <LineSeries className='pvalLine' data = {[{x: -7, y:1.5},{x:7, y:1.5}]} fill='#000000' stroke='#000000' strokeWidth={3}/> */}
        {/* <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={({ tooltipData, colorScale }) => {
          console.log(tooltipData!.nearestDatum!);
          return (
            <div>
              <div style={{ color: colorScale!(tooltipData!.nearestDatum!.key) }}>
                {tooltipData!.nearestDatum!.key}
              </div>
              {accessors.xAccessor(tooltipData!.nearestDatum!.datum)}
              {', '}
              {accessors.yAccessor(tooltipData!.nearestDatum!.datum)}
            </div>
          )
        }
        }
      /> */}
      </XYChart>
      <Line
        className="pvalLine"
        from={{ x: -7, y: 1.5 }}
        to={{ x: 7, y: 1.5 }}
        fill="#000000"
        stroke="#000000"
        strokeWidth={3}
      />
    </Group>
  );
};

export const Default2 = Template.bind({});
Default2.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
};

// this process input data function is similar to scatter's but not the same.
// would probably be worth revisiting what is in common and factoring accordingly
function processVolcanoData<T extends number>(
  dataSet: VEuPathDBVolcanoPlotData,
  colors: string[]
): {
  dataSetProcess: ScatterPlotData;
  xAxisRange: NumberRange;
  yAxisRange: NumberRange;
} {
  // set variables for x- and yaxis ranges
  let xMin: number = 0;
  let xMax: number = 0;
  let yMin: number = 0;
  let yMax: number = 0;

  let processedDataSeries: any = [];
  dataSet.volcanoplot.data.forEach(function (el: any, index: number) {
    // initialize variables: setting with union type for future, but this causes typescript issue in the current version
    let xSeries = [];
    let ySeries: never[] = [];

    // set rgbValue here per dataset with a default color
    // Add check for len(colors) = number of series
    let rgbValue: number[] = hexToRgb(colors[index]);

    let scatterPointColor: string = '';

    // series is for scatter plot
    if (el) {
      // check the number of x = number of y
      if (el.foldChange.length !== el.adjustedPValue.length) {
        console.log(
          'x length=',
          el.foldChange.length,
          '  y length=',
          el.adjustedPValue.length
        );
        alert('The number of X data is not equal to the number of Y data');
        throw new Error(
          'The number of X data is not equal to the number of Y data'
        );
      }

      /*
       *  set variables for x-/y-axes ranges including x,y data points: considering Date data for X as well
       * This is for finding global min/max values among data arrays for better display of the plot(s)
       */

      xSeries = el.foldChange.map((fc: number) => Math.log2(fc));
      ySeries = el.adjustedPValue.map((apv: number) => -Math.log10(apv));

      xMin =
        xMin < Math.min(...(xSeries as number[]))
          ? xMin
          : Math.min(...(xSeries as number[]));
      xMax =
        xMax > Math.max(...(xSeries as number[]))
          ? xMax
          : Math.max(...(xSeries as number[]));

      // check if this Y array consists of numbers & add type assertion
      if (index == 0) {
        yMin = Math.min(...ySeries);
        yMax = Math.max(...ySeries);
      } else {
        yMin = yMin < Math.min(...ySeries) ? yMin : Math.min(...ySeries);
        yMax = yMax > Math.max(...ySeries) ? yMax : Math.max(...ySeries);
      }

      // use global opacity for coloring
      scatterPointColor =
        'rgba(' +
        rgbValue[0] +
        ',' +
        rgbValue[1] +
        ',' +
        rgbValue[2] +
        ',' +
        0.8 +
        ')';

      // add scatter data considering input options
      const points = xSeries.map((x: any, i: any) => {
        return {
          x: Number(x),
          y: Number(ySeries[i]),
        };
      });
      processedDataSeries.push(points);
    }

    // make some margin for y-axis range (5% of range for now)
    if (typeof yMin == 'number' && typeof yMax == 'number') {
      yMin = yMin - (yMax - yMin) * 0.05;
      yMax = yMax + (yMax - yMin) * 0.05;
    }
  });

  return {
    dataSetProcess: { series: processedDataSeries },
    xAxisRange: { min: xMin, max: xMax },
    yAxisRange: { min: yMin, max: yMax },
  };
}

// change HTML hex code to rgb array
const hexToRgb = (hex?: string): [number, number, number] => {
  if (!hex) return [0, 0, 0];
  const fullHex = hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (m: string, r: string, g: string, b: string): string =>
      '#' + r + r + g + g + b + b
  );
  const hexDigits = fullHex.substring(1);
  const matches = hexDigits.match(/.{2}/g);
  if (matches == null) return [0, 0, 0];
  return matches.map((x: string) => parseInt(x, 16)) as [
    number,
    number,
    number
  ];
};
