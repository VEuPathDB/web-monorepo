//DKDK sample legend
import React from 'react';
import ReactDOM from 'react-dom';
import { useLeaflet } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";


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

// truncate any string longer than *max* and append *add* at the end (three ellipses by default)
String.prototype.truncate = function (max: number, add: string) {
  add = add || '...';
  return (this.length > max ? this.substring(0, max) + add : this);
}

//DKDK add commas
function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const MapVeuLegendSample = (props: legendProps) => {
  const { map } = useLeaflet();
  // console.log(map);

  useEffect(() => {
    //DKDK make legend control at the map
    const legend = new L.Control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      let labels = [];
      let maxList: number = 10     //DKDK maximum number of list = 10

      //DKDK open legend-contents div following mapveu v1
      labels.push('<div class="legend-contents">')

      //DKDK check legend type
      if (props.legendType === 'categorical') {
        //DKDK check if number of data is larger than maxList
        if (props.data.length <= maxList) {
          maxList = props.data.length
        }

        //DKDK i = 0 - 9 at best
        for (let i = 0; i < maxList; i++) {
          labels.push(
            '<div class="active-legend-area"><div class="active-legend" title="' + props.data[i].label + '">' +   //DKDK add tooltip
            '<i style="background:' +
              props.data[i].color +
              '"></i> ' +
              '<em>' + props.data[i].label.truncate(23) + '</em>' +     //DKDK 23 characters in max
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
            '<div class="legend-count">' + othersSum +
            '</div>'
          );
        }     //DKDK add Others list

        //DKDK close legend-contents div
        labels.push('</div>')

        //DKDK add labels to div
        div.innerHTML = labels.join("<br>");

      } else {    //DKDK cases other than 'categorical'
        //DKDK to-do
      }

      return div;

    };

    //DKDK below if-condition is required to avoid typescript error regarding undefiled 'map'
    if (!map) return;

    legend.addTo(map);

  }, [map]);   //DKDK added [map] here not to make legend multiple times
  return null;
};

export default MapVeuLegendSample;
