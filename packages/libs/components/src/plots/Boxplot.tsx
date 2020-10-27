import React from "react";
import PlotlyPlot from "./PlotlyPlot";
import { PlotData } from 'plotly.js';


export interface Props {
  data: {
    lowerFence : number,
    q1 : number,
    median : number,
    q3 : number,
    upperFence : number,
    label : string,
    rawData? : number[],
    outliers : number[]
  }[];
}

export default function Boxplot({ data }: Props) {

//  let pData = {
//    lowerfence : [],
//    q1 : [],
//    median : [],
//    q3 : [],
//    upperfence : [],
//    type : 'box'
//  };
//
//  data.reduce((acc, d) => {
//    acc.lowerfence.push(d.lowerFence);
//    acc.q1.push(d.q1);
//    acc.median.push(d.median);
//    acc.q3.push(d.q3);
//    acc.upperfence.push(d.upperFence);
//    return acc;
//  }, pData);
//
//  console.log(pData);

  const pData = data.map((d) => ( { ...d, upperfence: d.upperFence, lowerfence: d.lowerFence, type: 'box' } as const ));
console.log(pData);

//  const tData = [ {
//    median: [12, 19],
//    q1: [3, 11],
//    q3: [19, 32],
//    lowerfence: [1, 5],
//    upperfence: [25, 55],
//    name: 'miaow',
//    type: "box" as const
//  }];
  const tData = [ {
    median: [12],
    q1: [3],
    q3: [19],
    lowerfence: [1],
    upperfence: [25],
    name: 'hello',
    type: "box" as const,
    x0: 1
  },
  {
    median: [22],
    q1: [13],
    q3: [29],
    lowerfence: [11],
    upperfence: [35],
    name: 'goodbye',
    type: "box" as const,
    x0: 2
  }
  ];
  return <PlotlyPlot data={tData} layout={{}} />
}
