import React from 'react';

import PiePlot from '../plots/PiePlot';
import { PiePlotData } from '../types/plots';

interface SidebarPieChartProps {
  id: string;
  header: string;
  pieChartData?: PiePlotData;
  //add showLegend to hide/show legend
  showLegend?: boolean;
}

export default function TabPieChartContent(props: SidebarPieChartProps) {
  //summation of fullStat.value per marker icon
  let sumValues: number | null;
  if (props.pieChartData) {
    sumValues = props.pieChartData
      .map((o) => o.value)
      .reduce((a, c) => {
        return a + c;
      });
  } else {
    sumValues = null;
  }

  //width, height, margin - legend.y is the bottom of legend list, which makes things difficult to adjust
  let width = 300;
  //dynamically change height per the number of legend
  let numberLegend = props.pieChartData ? props.pieChartData.length : 0;
  let height = 300 + numberLegend * 30;

  return (
    <PiePlot
      data={props.pieChartData ?? []}
      donutOptions={{
        size: 0.4,
        text: sumValues?.toString(),
        fontSize: 20,
      }}
      width={width}
      height={height}
      spacingOptions={{
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 10,
        marginRight: 20,
        padding: 0,
      }}
      legendOptions={{
        orientation: 'horizontal',
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
        verticalPaddingAdjustment: -0.5,
      }}
      displayLegend={props.showLegend !== undefined ? props.showLegend : true}
      display3rdPartyControls={false}
    />
  );
}
