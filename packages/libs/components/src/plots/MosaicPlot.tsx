import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData } from 'plotly.js';

interface Props {
  // N columns/exposure, M rows/outcome
  data: Array<Array<number>>; // MxN (M = outerLength; N = innerLength)
  exposureValues: Array<string>; // N
  outcomeValues: Array<string>; // M
  exposureLabel: string;
  outcomeLabel: string;
  widths: Array<number>; // N
  colors?: Array<string>; // M
}

// {
//   data: [
//     [ 40, 15 ],
//     [ 10, 35 ]
//   ],
//   exposureValues: [‘Men’, ‘Women’ ],
//   outcomeValues: [ ‘Died’, ‘Survived’ ],
//   exposureLabel: ‘Sex’,
//   outcomeLabel: ‘Status’,
//   widths: [ 40, 10 ]
//   colors: [ ‘red’, ‘yellow’ ]
// }

export default function MosaicPlot(props: Props) {
  const layout = {
    xaxis: {
      title: props.exposureLabel,
    },
    yaxis: {
      title: props.outcomeLabel,
    },
    barmode: 'stack',
  } as const;

  const data = props.data.map(d => ({ ...d, type: 'bar' } as const));

  return (
    <PlotlyPlot data={data} layout={layout}/>
  );
}
