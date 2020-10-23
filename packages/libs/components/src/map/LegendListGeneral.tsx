//DKDK sample legend
import React from 'react';
// import ReactDOM from 'react-dom';
// import { useLeaflet } from "react-leaflet";
// import L from "leaflet";
// import { useEffect } from "react";
//DKDK use react-html-parser
import ReactHtmlParser from 'react-html-parser';
//DKDK define prototype truncate function
import './custom.d.ts'

//DKDK type def for legend: some are set to optional for now
//perhaps this goes to Types.ts to avoid duplicate and legendProps can be an extension
interface legendListProps {
  // className: string
  data : {
    label : string, // categorical e.g. "Anopheles gambiae"
                    // numeric e.g. "10-20"
    value : number,
    color : string,
  }[],
  //DKDK add this
  legendType: string,
}

// truncate any string longer than *max* and append *add* at the end (three ellipses by default)
//DKDK to avoid type error on this custom function, truncate, it needs to be defined at custom.d.ts
String.prototype.truncate = function (max: number, add: string) {
  add = add || '...';
  return (this.length > max ? this.substring(0, max) + add : this);
}

//DKDK add commas
function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function LegendListSquare(props: legendListProps) {
  let labels = []
  let maxList: number = 10     //DKDK maximum number of list = 10

  //DKDK add a class to handle circle or square in the list
  let legendIconClass = ''
  if (props.legendType === 'numeric') {
    legendIconClass = ' legend-square-icon'
  }

    //DKDK check if number of data is larger than maxList
  if (props.data.length <= maxList) {
    maxList = props.data.length
  }

  //DKDDK add text: for now, static, not props
  labels.push(
    '<div class="legend-field-text"> #Collections</div>'
  )

  //DKDK i = 0 - 9 at best
  for (let i = 0; i < maxList; i++) {
    labels.push(
      '<div class="active-legend-area' + legendIconClass + '"><div class="active-legend" title="' + props.data[i].label + '">' +   //DKDK add tooltip
      // '<div class="">' +
      '<i style="background:' +
        props.data[i].color +
        '"></i> ' +
        '<em>' + props.data[i].label.truncate(22) + '</em>' +     //DKDK 23 characters in max
      '</div></div>' +
      '<div class="legend-count">' + numberWithCommas(props.data[i].value) +
      '</div>'
    );
  }

  //DKDK calculate total number of Others and add Others in the end of the list
  if (props.data.length > maxList) {
    //DKDK compute total number of others
    let othersSum = 0
    for (let i = 10; i < props.data.length; i++) {
      othersSum = othersSum + props.data[i].value
    }
    //DKDK add Others in the list
    labels.push(
      '<div class="active-legend-area"><div class="active-legend" title="' + 'Others' + '">' +
      '<i style="background:' +
        'silver' +
        '"></i> ' +
        '<em>' + 'Others' + '</em>' +
      '</div></div>' +
      '<div class="legend-count">' + numberWithCommas(othersSum) +
      '</div>'
    );
  }     //DKDK add Others list

  //DKDK let's join labels array
  let SingleLabels = labels.join("<br>")

  //DKDK use react-html-parser for converting html string to element
  //Do we need to use DOMPurify before using react-html-parser?
  return (
    <React.Fragment>
      {ReactHtmlParser (SingleLabels)}
    </React.Fragment>
    // SingleLabels
  )
}

