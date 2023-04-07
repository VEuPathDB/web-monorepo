import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { range } from 'lodash';
import { getNormallyDistributedRandomNumber } from './ScatterPlot.storyData';

export default {
  title: 'Plots/VolcanoPlot',
  component: VolcanoPlot,
  argTypes: {
    log2FoldChangeThreshold: {
      control: { type: 'range', min: 0.5, max: 10, step: 0.5 },
    },
    significanceThreshold: {
      control: { type: 'range', min: 0.001, max: 0.1, step: 0.001 },
    },
  },
} as Meta;

interface VEuPathDBVolcanoPlotData {
  volcanoplot: {
    series: {
      foldChange: string[];
      pValue: string[];
      adjustedPValue: string[];
      pointId: string[];
    };
  };
}

// Let's make some fake data!
const dataSetVolcano: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    series: {
      foldChange: [
        '2',
        '3',
        '0.5',
        '0.8',
        '1',
        '0.5',
        '0.1',
        '4',
        '0.2',
        '0.01',
        '0.02',
        '0.03',
      ],
      pValue: [
        '0.001',
        '0.0001',
        '0.01',
        '0.001',
        '2',
        '1',
        '7',
        '1',
        '4',
        '0.001',
        '0.0001',
        '0.002',
      ],
      adjustedPValue: ['0.01', '0.001', '0.01', '0.001', '0.02'],
      pointId: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
    },
  },
};

const nPoints = 300;
const dataSetVolcanoManyPoints: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    series: {
      foldChange: range(1, nPoints).map((p) =>
        String(Math.abs(getNormallyDistributedRandomNumber(0, 5)))
      ),
      pValue: range(1, nPoints).map((p) => String(Math.random() / 2)),
      adjustedPValue: range(1, nPoints).map((p) =>
        String(nPoints * Math.random())
      ),
      pointId: range(1, nPoints).map((p) => String(p)),
    },
  },
};

const plotTitle = 'Volcano erupt!';

interface TemplateProps {
  data: VEuPathDBVolcanoPlotData;
  markerBodyOpacity: number;
  log2FoldChangeThreshold: number;
  significanceThreshold: number;
  adjustedPValueGate: number;
}

const Template: Story<TemplateProps> = (args) => {
  const comparisonLabels = ['up in group a', 'up in group b']; // not yet used

  const volcanoPlotProps: VolcanoPlotProps = {
    data: args.data.volcanoplot.series,
    significanceThreshold: args.significanceThreshold,
    log2FoldChangeThreshold: args.log2FoldChangeThreshold,
    markerBodyOpacity: args.markerBodyOpacity,
    comparisonLabels: comparisonLabels,
  };

  return <VolcanoPlot {...volcanoPlotProps} />;
};

// Stories!
export const Simple = Template.bind({});
Simple.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
  log2FoldChangeThreshold: 1,
  significanceThreshold: 0.01,
};

export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: dataSetVolcanoManyPoints,
  markerBodyOpacity: 0.5,
  log2FoldChangeThreshold: 3,
  significanceThreshold: 0.01,
};

// Add story for truncation
// export const Truncation = Template.bind({})
// Truncation.args = {
//   data: dataSetVolcano,
//   independentAxisRange: []
// }
