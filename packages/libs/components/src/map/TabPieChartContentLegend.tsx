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
  showLegend?: boolean,
}

//DKDK props are not decided so just use any for now
export default function TabPieChartConentLegend(props: SidebarPieChartProps) {

  //DKDK summation of fullStat.value per marker icon
  let sumValues: number | null
  if (props.pieChartData) {
    sumValues = props.pieChartData.map(o => o.value).reduce((a, c) => { return a + c })
  } else {
    sumValues = null
  }

  //DKDK width, height, margin - legend.y is the bottom of legend list, which makes things difficult to adjust
  let width = 350
  let height = 350
  let margin = {
    l: 0,
    r: 0,
    b: 0,
    t: 30,
    pad: 0,
  }
  // let legend = {
  //   x: 0.1,
  //   y: -0.4,
  //   orientation: "h"
  // }

  //DKDK legend list example
  let legendList: React.ReactNode = ''
  if ((props.showLegend !== undefined) && !props.showLegend && props.pieChartData) {
    legendList = props.pieChartData.map((list, index) => (
        <li key={'legendList' + index}>
          <svg width="12" height="12">
            <rect x="0" y="0" width="12" height="12" style={{fill: list.color, stroke: 'none', strokeWidth: 0, fillOpacity: 1, strokeOpacity: 1}} />
          </svg>
          &nbsp;{list.label}
        </li>
    ))
  }

  return (
    <>
      <PiePlot
        //DKDK set props.pieChartData not to be undefined
        data={(props.pieChartData) ? props.pieChartData : []}
        // data={props.pieChartData}
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
        // legend={legend}
        showLegend={(props.showLegend !== undefined) ? props.showLegend : true}
      />
      <br />
      <ul className='SidebarPieLegendList' style={{listStyleType: 'none'}}>{legendList}</ul>
    </>
  );
}

