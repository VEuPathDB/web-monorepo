//DKDK sample legend
import React from 'react';
//DKDK import legend css for positioning
import './legend-style.css'
//DKDK housing square icon case
import LegendListGeneral from './LegendListGeneral';
//DKDK legend radio button for histogram marker
import LegendListRadioButton from './LegendListRadioButton';
//DKDK legend tutorial info
import LegendListInfo from "./LegendListInfo"

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
  tickLabelsVisible?: boolean,

  onShowFilter? : () => {},  // callback to open up filter panel
  onShowVariableChooser? : () => {}, // callback to open up variable selector

  //DKDK send state for legend radio button
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
  selectedOption?: string,
}

//DKDK make legend at the map without using L.Control: perhaps send props to make circle or square?
// For now, just use different component for square
const MapVeuLegendSampleList = (props: LegendProps) => {
  //DKDK simplifying
  let legendIconClass = ''
  if (props.legendType === 'categorical') {
    legendIconClass = 'legend-contents'
  } else {
    legendIconClass = 'legend-contents-numeric'
  }

  //DKDK compute sum of data.value: need to check whether the data array exists and not empty
  let sumValue: number = 0
  if (Array.isArray(props.data) && props.data.length) {
    //DKDK with current data and default viewport, sum = 23056
    sumValue = props.data.map(o => o.value).reduce((a, c) => { return a + c })
  }

  return (
    //DKDK add below divs for benefeting from pre-existing CSS (vb-popbio-maps.css)
    <div className="info legend">
      <div className={legendIconClass}>
        {/* DKDK legend list  */}
        <LegendListGeneral
          // legendType={legendTypeValue}
          data={props.data}
          // divElement={div}
          //DKDK add legendType props for handling icons
          legendType={props.legendType}
        />
        {/* DKDK add radio button component here */}
        <LegendListRadioButton
          legendType={props.legendType}
          onChange={props.onChange}
          selectedOption={props.selectedOption}
          sumValue={sumValue}
        />
        {/* DKDK add tutorial info component here */}
        <LegendListInfo
        //DKDK for now, let's use image
          legendType={props.legendType}
        />
      </div>
    </div>
  )

};

export default MapVeuLegendSampleList;
