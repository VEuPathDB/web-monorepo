/* DKDK a test component for tab home content
*/

import React from "react";

//DKDK import pie/donut chart
import PiePlot from '../plots/PiePlot';

//DKDK props
interface SidebarPieChartProps {
  id: string;
  header: string;
  pieChartData?: Array<{color: string, label: string, value: number}>;
  //DKDK add showLegend to hide/show legend
  showLegend?: boolean;
}

//DKDK props are not decided so just use any for now
export default function TabPieChartConent(props: SidebarPieChartProps) {

  //DKDK summation of fullStat.value per marker icon
  let sumValues: number | null
  if (props.pieChartData) {
    sumValues = props.pieChartData.map(o => o.value).reduce((a, c) => { return a + c })
  } else {
    sumValues = null
  }

  //DKDK width, height, margin - legend.y is the bottom of legend list, which makes things difficult to adjust
  let width = 300
  //DKDK dynamically change height per the number of legend
  let numberLegend = (props.pieChartData) ? props.pieChartData.length : 0
  let height = 300 + numberLegend*30
  let margin = {
    l: 0,
    r: 0,
    b: 0,
    t: 30,
    pad: 0,
  }
  let legend = {
    // x: 0.1,
    // y: -0.4,
    // y: -1,
    orientation: 'h',
  }

  return (
    <>
      <PiePlot
        //DKDK set props.pieChartData not to be undefined
        data={(props.pieChartData) ? props.pieChartData : []}
        interior={{
          heightPercentage: 0.4,
          text: sumValues?.toString(),
          textColor: 'black',
          fontSize: 20,
        }}
        //DKDK set layout
        width={width}
        height={height}
        margin={margin}
        legend={legend}
        showLegend={(props.showLegend !== undefined) ? props.showLegend : true}
      />
    </>
  );
}

