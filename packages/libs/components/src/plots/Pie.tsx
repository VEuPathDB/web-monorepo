import React from "react";
import PlotlyPlot from "./PlotlyPlot";

type Value = number | Date;

type PiePlotDatum = {
  value: Value;
  label: string;
  color?: string;
};

type PiePlotData = PiePlotDatum[];

interface PieProps {
  data: PiePlotData;
  interior?: {
    heightPercentage: number;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string|number;
  };
}

export default function Pie(props: PieProps) {
  const { data, interior = null } = props;

  // Preprocess data for PlotlyPlot
  const reducer = (accumulatorObj: {values: Value[], labels: string[]}, currObj: PiePlotDatum) => {
    accumulatorObj.values.push(currObj.value);
    accumulatorObj.labels.push(currObj.label);
    return accumulatorObj;
  };
  const newData = [data.reduce(reducer, {values: [], labels: []})];

  return <PlotlyPlot<'values'> data={newData} type="pie"/>
}
