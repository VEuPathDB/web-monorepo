/* a test component for tab home content
 */

import React from 'react';

//import pie/donut chart
import PiePlot from '../plots/PiePlot';

//props
interface SidebarPieChartProps {
  id: string;
  header: string;
  pieChartData?: Array<{ color: string; label: string; value: number }>;
  //add showLegend to hide/show legend
  showLegend?: boolean;
}

//set props for legend position
type legendProp = {
  x?: number;
  y?: number;
  //xanchor is for positioning legend inside plot
  xanchor?: 'auto' | 'center' | 'left' | 'right';
  orientation?: 'h' | 'v' | undefined;
};

//props are not decided so just use any for now
export default function TabPieChartConent(props: SidebarPieChartProps) {
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
  let margin = {
    l: 0,
    r: 0,
    b: 0,
    t: 30,
    pad: 0,
  };
  let legend: legendProp = {
    // x: 0.1,
    // y: -0.4,
    // y: -1,
    orientation: 'h',
  };

  return (
    <>
      <PiePlot
        //set props.pieChartData not to be undefined
        data={props.pieChartData ? props.pieChartData : []}
        interior={{
          heightPercentage: 0.4,
          text: sumValues?.toString(),
          textColor: 'black',
          fontSize: 20,
        }}
        //set layout
        width={width}
        height={height}
        margin={margin}
        legend={legend}
        showLegend={props.showLegend !== undefined ? props.showLegend : true}
      />
    </>
  );
}
