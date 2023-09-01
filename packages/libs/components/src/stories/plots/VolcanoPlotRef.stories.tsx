import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import { Story } from '@storybook/react/types-6-0';
import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { range } from 'lodash';
import { VolcanoPlotData } from '../../types/plots/volcanoplot';
import { getNormallyDistributedRandomNumber } from './ScatterPlot.storyData';
import { assignSignificanceColor } from '../../plots/VolcanoPlot';
import { significanceColors } from '../../types/plots';

export default {
  title: 'Plots/VolcanoPlot',
  component: VolcanoPlot,
};

interface TemplateProps {
  data: VEuPathDBVolcanoPlotData;
  markerBodyOpacity: number;
  log2FoldChangeThreshold: number;
  significanceThreshold: number;
  adjustedPValueGate: number;
  comparisonLabels?: string[];
  showSpinner?: boolean;
}

// Generate fake data
interface VEuPathDBVolcanoPlotData {
  volcanoplot: {
    log2foldChange: string[];
    pValue: string[];
    adjustedPValue: string[];
    pointID: string[];
  };
}
const nPoints = 20;
const data: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    log2foldChange: range(1, nPoints).map((p) =>
      String(Math.log2(Math.abs(getNormallyDistributedRandomNumber(0, 5))))
    ),
    pValue: range(1, nPoints).map((p) => String(Math.random() / 2)),
    adjustedPValue: range(1, nPoints).map((p) =>
      String(nPoints * Math.random())
    ),
    pointID: range(1, nPoints).map((p) => String(p)),
  },
};

// The following template includes the normal vixs volcano plot
// in addition to a screenshotted version below. This template
// should be used only to test screenshotting. In the future,
// conisder reusing for other visx plot types?
const Template: Story<TemplateProps> = (args) => {
  // Generate a jpeg version of the volcano plot (svg).
  // Mimicks the makePlotThumbnailUrl process in web-eda.
  const ref = useRef<any>(null);
  const [img, setImg] = useState('');
  useEffect(() => {
    setTimeout(() => {
      ref.current
        ?.toImage({ format: 'jpeg', height: 400, width: 600 })
        .then((src: string) => setImg(src));
    }, 2000);
  }, []);

  // Wrangle data to get it into the nice form for plot component.
  const volcanoDataPoints: VolcanoPlotData = data.volcanoplot.log2foldChange
    .map((l2fc, index) => {
      return {
        log2foldChange: l2fc,
        pValue: data.volcanoplot.pValue[index],
        adjustedPValue: data.volcanoplot.adjustedPValue[index],
        pointID: data.volcanoplot.pointID[index],
      };
    })
    .map((d) => ({
      ...d,
      pointID: d.pointID ? [d.pointID] : undefined,
      significanceColor: assignSignificanceColor(
        Number(d.log2foldChange),
        Number(d.pValue),
        args.significanceThreshold,
        args.log2FoldChangeThreshold,
        significanceColors
      ),
    }));

  const rawDataMinMaxValues = {
    x: {
      min:
        Math.min(...volcanoDataPoints.map((d) => Number(d.log2foldChange))) ??
        0,
      max:
        Math.max(...volcanoDataPoints.map((d) => Number(d.log2foldChange))) ??
        0,
    },
    y: {
      min: Math.min(...volcanoDataPoints.map((d) => Number(d.pValue))) ?? 0,
      max: Math.max(...volcanoDataPoints.map((d) => Number(d.pValue))) ?? 0,
    },
  };

  const volcanoPlotProps: VolcanoPlotProps = {
    data: volcanoDataPoints,
    significanceThreshold: args.significanceThreshold,
    log2FoldChangeThreshold: args.log2FoldChangeThreshold,
    markerBodyOpacity: args.markerBodyOpacity,
    comparisonLabels: args.comparisonLabels,
    rawDataMinMaxValues,
    independentAxisRange: { min: -9, max: 9 },
    dependentAxisRange: { min: 0, max: 9 },
  };

  return (
    <>
      <VolcanoPlot ref={ref} {...volcanoPlotProps} />
      <br></br>
      <h2>
        A partial snapshot of the plot will appear below after two sconds...
      </h2>
      <img src={img} />
    </>
  );
};

export const ToImage = Template.bind({});
ToImage.args = {
  data: data,
  significanceThreshold: 0.05,
  log2FoldChangeThreshold: 2,
  markerBodyOpacity: 0.9,
  comparisonLabels: ['a', 'b'],
};
