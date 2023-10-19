import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { range } from 'lodash';
import { getNormallyDistributedRandomNumber } from './ScatterPlot.storyData';
import { VolcanoPlotData } from '../../types/plots/volcanoplot';
import { NumberRange } from '../../types/general';
import { yellow } from '@veupathdb/coreui/lib/definitions/colors';
import { assignSignificanceColor } from '../../plots/VolcanoPlot';
import { significanceColors } from '../../types/plots';

export default {
  title: 'Plots/VolcanoPlot',
  component: VolcanoPlot,
  argTypes: {
    effectSizeThreshold: {
      control: { type: 'range', min: 0.5, max: 10, step: 0.01 },
    },
    significanceThreshold: {
      control: { type: 'range', min: 0.0001, max: 0.2, step: 0.001 },
    },
  },
} as Meta;

// The backend nicely sends us an array of objects. That's a pretty annoying way to make fake data though.
// Let's just use the below to more easily make some fake data. Then we'll process it into an array
// of objects for actual use :)
interface VEuPathDBVolcanoPlotData {
  volcanoplot: {
    effectSizeLabel: string;
    statistics: {
      effectSize: string[];
      pValue: string[];
      adjustedPValue: string[];
      pointID: string[];
    };
  };
}

// Let's make some fake data!
const dataSetVolcano: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    effectSizeLabel: 'log2FoldChange',
    statistics: {
      effectSize: [
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
        '-8.2',
        '7',
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
        '0',
        '0',
      ],
      adjustedPValue: ['0.01', '0.001', '0.01', '0.001', '0.02', '0', '0'],
      pointID: [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'buzz',
        'lightyear',
      ],
    },
  },
};

// Make a fake dataset with lots of points!
const nPoints = 300;
const dataSetVolcanoManyPoints: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    effectSizeLabel: 'log2FoldChange',
    statistics: {
      effectSize: range(1, nPoints).map((p) =>
        String(Math.log2(Math.abs(getNormallyDistributedRandomNumber(0, 5))))
      ),
      pValue: range(1, nPoints).map((p) => String(Math.random() / 2)),
      adjustedPValue: range(1, nPoints).map((p) =>
        String(nPoints * Math.random())
      ),
      pointID: range(1, nPoints).map((p) => String(p)),
    },
  },
};

interface TemplateProps {
  data: VEuPathDBVolcanoPlotData | undefined;
  markerBodyOpacity: number;
  effectSizeThreshold: number;
  significanceThreshold: number;
  adjustedPValueGate: number;
  independentAxisRange?: NumberRange;
  dependentAxisRange?: NumberRange;
  comparisonLabels?: string[];
  truncationBarFill?: string;
  showSpinner?: boolean;
}

const Template: Story<TemplateProps> = (args) => {
  // Process input data. Take the object of arrays and turn it into
  // an array of data points. Note the backend will do this for us!
  const volcanoDataPoints: VolcanoPlotData | undefined = {
    effectSizeLabel: args.data?.volcanoplot.effectSizeLabel ?? '',
    statistics:
      args.data?.volcanoplot.statistics.effectSize.map((effectSize, index) => {
        return {
          effectSize: effectSize,
          pValue: args.data?.volcanoplot.statistics.pValue[index],
          adjustedPValue:
            args.data?.volcanoplot.statistics.adjustedPValue[index],
          pointID: args.data?.volcanoplot.statistics.pointID[index],
          significanceColor: assignSignificanceColor(
            Number(effectSize),
            Number(args.data?.volcanoplot.statistics.pValue[index]),
            args.significanceThreshold,
            args.effectSizeThreshold,
            significanceColors
          ),
        };
      }) ?? [],
  };

  const rawDataMinMaxValues = {
    x: {
      min:
        (volcanoDataPoints &&
          Math.min(
            ...volcanoDataPoints.statistics.map((d) => Number(d.effectSize))
          )) ??
        0,
      max:
        (volcanoDataPoints &&
          Math.max(
            ...volcanoDataPoints.statistics.map((d) => Number(d.effectSize))
          )) ??
        0,
    },
    y: {
      min:
        (volcanoDataPoints &&
          Math.min(
            ...volcanoDataPoints.statistics.map((d) => Number(d.pValue))
          )) ??
        1,
      max:
        (volcanoDataPoints &&
          Math.max(
            ...volcanoDataPoints.statistics.map((d) => Number(d.pValue))
          )) ??
        1,
    },
  };

  const volcanoPlotProps: VolcanoPlotProps = {
    data: volcanoDataPoints,
    significanceThreshold: args.significanceThreshold,
    effectSizeThreshold: args.effectSizeThreshold,
    markerBodyOpacity: args.markerBodyOpacity,
    comparisonLabels: args.comparisonLabels,
    independentAxisRange: args.independentAxisRange,
    dependentAxisRange: args.dependentAxisRange,
    truncationBarFill: args.truncationBarFill,
    showSpinner: args.showSpinner,
    rawDataMinMaxValues,
  };

  return (
    <>
      <VolcanoPlot {...volcanoPlotProps} />
    </>
  );
};

/**
 * Stories
 */

// A small volcano plot. Proof of concept
export const Simple = Template.bind({});
Simple.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
  effectSizeThreshold: 1,
  significanceThreshold: 0.01,
  comparisonLabels: ['up in group a', 'up in group b'],
  independentAxisRange: { min: -9, max: 9 },
  dependentAxisRange: { min: 0, max: 9 },
};

// Most volcano plots will have thousands of points, since each point
// represents a gene or taxa. Make a volcano plot with
// a lot of points.
export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: dataSetVolcanoManyPoints,
  markerBodyOpacity: 0.8,
  effectSizeThreshold: 3,
  significanceThreshold: 0.01,
  independentAxisRange: { min: -9, max: 9 },
  dependentAxisRange: { min: 0, max: 9 },
  comparisonLabels: [
    'up in super long group name',
    'up in other long group name',
  ],
};

// Test truncation indicators
export const Truncation = Template.bind({});
Truncation.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.5,
  effectSizeThreshold: 2,
  significanceThreshold: 0.01,
  independentAxisRange: { min: -3, max: 3 },
  dependentAxisRange: { min: 1, max: 3 },
  truncationBarFill: yellow[300],
};

// Test the spinner
export const Spinner = Template.bind({});
Spinner.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
  effectSizeThreshold: 1,
  significanceThreshold: 0.01,
  comparisonLabels: ['up in group a', 'up in group b'],
  independentAxisRange: { min: -8, max: 9 },
  dependentAxisRange: { min: -1, max: 9 },
  showSpinner: true,
};

// Test empty placeholder viz
export const Empty = Template.bind({});
Empty.args = {
  data: undefined,
  markerBodyOpacity: 0,
  effectSizeThreshold: 2,
  significanceThreshold: 0.05,
  independentAxisRange: { min: -9, max: 9 },
  dependentAxisRange: { min: -1, max: 9 },
};
