//DKDK sample legend
import React from 'react';
//DKDK import legend css for positioning
import './legend-style.css'
//DKDK import LegendList
import LegendList from './LegendList';
//DKDK import BarChart
import BarChartLegend from './BarChartLegend';

//DKDK type def for legend: some are set to optional for now
export interface LegendProps {
  // className: string
  legendType : string,    //'categorical' | 'numeric' | 'date',
  data : {
    label : string, // categorical e.g. "Anopheles gambiae"
                    // numeric e.g. "10-20"
    value : number,
    color : string,
  }[],
  variableLabel? : string, // e.g. Species or Age
  quantityLabel? : string, // ** comment below

  onShowFilter? : () => {},  // callback to open up filter panel
  onShowVariableChooser? : () => {}, // callback to open up variable selector
}

//DKDK make legend at the map without using L.Control
const MapVeuLegendSample = (props: LegendProps) => {
  //DKDK simplifying
  if (props.legendType === 'categorical') {
    return (
      //DKDK add below divs for benefeting from pre-existing CSS (vb-popbio-maps.css)
      <div className="info legend">
        <div className="legend-contents">
          <LegendList
            // legendType={legendTypeValue}
            data={props.data}
            // divElement={div}
          />
        </div>
      </div>
    )
  } else {
    //DKDK for bar chart
    const plotType = 'bar'
    const plotLibrary = 'plotly'
    const colorMethod = 'discrete'
    //DKDK perhaps we should send x-/y-axes labels too
    const xAxisLabel = props.variableLabel
    const yAxisLabel = props.quantityLabel
    //DKDK width and height are set to 250 for now
    const plotSize = 250
    //DKDK we may also need to consider other props such as font sizes for x-/y-axes labels, tick labels, etc.
    const axisLabelSize = 12
    const tickLabelSize = 10

    //DKDK currently BarChart requires array data, e.g., labels: string[], etc., so need to make arrays
    let labels: string[] = [];
    let values: number[] = [];
    let colors: string[] = [];
    props.data.forEach((data) => {
      labels.push(data.label)
      values.push(data.value)
      colors.push(data.color)
    })

    return (
      //DKDK add below div for benefeting from pre-existing CSS (vb-popbio-maps.css)
      <div className="info legend">
        <BarChartLegend
          labels={labels}
          values={values}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          axisLabelSize={axisLabelSize}
          tickLabelSize={tickLabelSize}
          yAxisRange={null}
          width={plotSize}
          height={plotSize}
          type={plotType}
          library={plotLibrary}
          colors={colors}
          colorMethod={colorMethod}
        />
      </div>
    )
  }
};

export default MapVeuLegendSample;
