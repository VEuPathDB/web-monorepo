import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { PlotRef } from '../../types/plots';
import { range } from 'lodash';
import { VolcanoPlotData } from '../../types/plots/volcanoplot';
import { getNormallyDistributedRandomNumber } from './ScatterPlot.storyData';

export default {
  title: 'Plots/VolcanoPlot',
  component: VolcanoPlot,
};

// Fake data
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

export function ToImage() {
  const ref = useRef<any>(null);
  const [img, setImg] = useState('');
  useEffect(() => {
    ref.current
      ?.toImage({ format: 'jpeg', height: 300, width: 300 })
      // @ts-ignore
      .then((src) => setImg(src));
  }, []);

  const volcanoDataPoints: VolcanoPlotData =
    data.volcanoplot.log2foldChange.map((l2fc, index) => {
      return {
        log2foldChange: l2fc,
        pValue: data.volcanoplot.pValue[index],
        adjustedPValue: data.volcanoplot.adjustedPValue[index],
        pointID: data.volcanoplot.pointID[index],
      };
    });
  const volcanoPlotProps: VolcanoPlotProps = {
    data: volcanoDataPoints,
    significanceThreshold: 0.05,
    log2FoldChangeThreshold: 2,
    markerBodyOpacity: 0.9,
    comparisonLabels: ['a', 'b'],
  };
  return (
    <>
      <VolcanoPlot ref={ref} {...volcanoPlotProps} />
      <img src={img} />
    </>
  );
}
