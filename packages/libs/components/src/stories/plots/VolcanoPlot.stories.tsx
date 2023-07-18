import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { range } from 'lodash';
import { getNormallyDistributedRandomNumber } from './ScatterPlot.storyData';
import { VolcanoPlotData } from '../../types/plots/volcanoplot';
import { NumberRange } from '../../types/general';

export default {
  title: 'Plots/VolcanoPlot',
  component: VolcanoPlot,
  argTypes: {
    log2FoldChangeThreshold: {
      control: { type: 'range', min: 0.5, max: 10, step: 0.01 },
    },
    significanceThreshold: {
      control: { type: 'range', min: 0.0001, max: 0.2, step: 0.001 },
    },
  },
} as Meta;

// Currently going to assume that the backend will send us data like this. Then
// the volcano visualization will do some processing. Will discuss
// with Danielle if we can have the backend send us an array of objects
// instead of this object of arrays...
interface VEuPathDBVolcanoPlotData {
  volcanoplot: {
    log2foldChange: string[];
    pValue: string[];
    adjustedPValue: string[];
    pointId: string[];
  };
}

// Let's make some fake data!
const dataSetVolcano: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    log2foldChange: [
      '2',
      '3',
      '0.5',
      '-0.1',
      '1',
      '-0.5',
      '-1.2',
      '4',
      '0.2',
      '-8',
      '-4',
      '-3',
    ],
    pValue: [
      '0.001',
      '0.0001',
      '0.01',
      '0.001',
      '0.98',
      '1',
      '0.8',
      '1',
      '0.6',
      '0.001',
      '0.0001',
      '0.002',
    ],
    adjustedPValue: ['0.01', '0.001', '0.01', '0.001', '0.02'],
    pointId: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
  },
};

// Make a fake dataset with lots of points!
const nPoints = 300;
const dataSetVolcanoManyPoints: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    log2foldChange: range(1, nPoints).map((p) =>
      String(Math.log2(Math.abs(getNormallyDistributedRandomNumber(0, 5))))
    ),
    pValue: range(1, nPoints).map((p) => String(Math.random() / 2)),
    adjustedPValue: range(1, nPoints).map((p) =>
      String(nPoints * Math.random())
    ),
    pointId: range(1, nPoints).map((p) => String(p)),
  },
};

interface TemplateProps {
  data: VEuPathDBVolcanoPlotData;
  markerBodyOpacity: number;
  log2FoldChangeThreshold: number;
  significanceThreshold: number;
  adjustedPValueGate: number;
  independentAxisRange?: NumberRange;
  dependentAxisRange?: NumberRange;
  comparisonLabels?: string[];
  width?: number;
  height?: number;
}

const Template: Story<TemplateProps> = (args) => {
  // Process input data. Take the object of arrays and turn it into
  // an array of data points
  const volcanoDataPoints: VolcanoPlotData =
    args.data.volcanoplot.log2foldChange.map((l2fc, index) => {
      return {
        log2foldChange: l2fc,
        pValue: args.data.volcanoplot.pValue[index],
        adjustedPValue: args.data.volcanoplot.adjustedPValue[index],
        pointId: args.data.volcanoplot.pointId[index],
      };
    });

  const volcanoPlotProps: VolcanoPlotProps = {
    data: volcanoDataPoints,
    significanceThreshold: args.significanceThreshold,
    log2FoldChangeThreshold: args.log2FoldChangeThreshold,
    markerBodyOpacity: args.markerBodyOpacity,
    comparisonLabels: args.comparisonLabels,
    independentAxisRange: args.independentAxisRange,
    dependentAxisRange: args.dependentAxisRange,
    width: args.width,
    height: args.height,
  };

  return <VolcanoPlot {...volcanoPlotProps} />;
};

/**
 * Stories
 */

// A small volcano plot. Proof of concept
export const Simple = Template.bind({});
Simple.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
  log2FoldChangeThreshold: 1,
  significanceThreshold: 0.01,
  comparisonLabels: ['up in group a', 'up in group b'],
  independentAxisRange: { min: -8, max: 9 },
  dependentAxisRange: { min: -1, max: 9 },
  height: 500,
  width: 600,
};

// Most volcano plots will have thousands of points, since each point
// represents a gene or taxa. Make a volcano plot with
// a lot of points.
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: dataSetVolcanoManyPoints,
  markerBodyOpacity: 0.5,
  log2FoldChangeThreshold: 3,
  significanceThreshold: 0.01,
  independentAxisRange: { min: -8, max: 9 },
  dependentAxisRange: { min: -1, max: 9 },
};

// Add story for truncation
// export const Truncation = Template.bind({})
// Truncation.args = {
//   data: dataSetVolcano,
//   independentAxisRange: []
// }
