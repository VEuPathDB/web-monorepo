//DKDK sample legend
import React from 'react';
// import ReactDOM, { render } from 'react-dom';
// import { useLeaflet } from "react-leaflet";
// // import L from "leaflet";
// import { useState, useEffect } from "react";
//DKDK import legend css for positioning
import './legend-style.css'
//DKDK import LegendList
import LegendList from './LegendList';

//DKDK type def for legend: some are set to optional for now
interface legendProps {
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
const MapVeuLegendSample = (props: legendProps) => {
  //DKDK simplifying
  if (props.legendType === 'categorical') {
    return (
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
      //DKDK placeholder for bar chart: will start doing soon
    return (
      null
    )
  }

};

export default MapVeuLegendSample;
