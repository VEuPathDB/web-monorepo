import React from "react";
import { Marker, Tooltip } from "react-leaflet";
import { MarkerProps } from './Types';

//DKDK leaflet
import L from "leaflet";

//DKDK ts definition for HistogramMarkerSVGProps: need some adjustment but for now, just use Donut marker one
interface HistogramMarkerSVGProps extends MarkerProps {
  labels: Array<string>, // the labels (not likely to be shown at normal marker size)
  values: Array<number>, // the counts or totals to be shown in the donut
  colors?: Array<string> | null, // bar colors: set to be optional with array or null type
  // isAtomic?: boolean,      // add a special thumbtack icon if this is true (it's a marker that won't disaggregate if zoomed in further)
  yAxisRange?: Array<number> | null, // y-axis range for setting global max
  onClick?: (event: L.LeafletMouseEvent) => void | undefined,
  onMouseOver?: (event: L.LeafletMouseEvent) => void | undefined,
  onMouseOut?: (event: L.LeafletMouseEvent) => void | undefined,
}

/**
 * DKDK this is a SVG histogram marker icon
 */
export default function RealHistogramMarkerSVG(props: HistogramMarkerSVGProps) {
//   console.log('at DonutMarkerSVG.tsx')
  /**
   * DKDK icon with demo data: mroe realistic example can be found at dk-donut1 branch
   */
  let fullStat = []
  //DKDK set defaultColor to be skyblue (#7cb5ec) if props.colors does not exist
  let defaultColor: string = ''
  let defaultLineColor: string = ''
  //DKDK need to make a temporary stats array of objects to show marker colors - only works for demo data, not real solr data
  for (let i = 0; i < props.values.length; i++) {
    if (props.colors) {
      defaultColor = props.colors[i]
      defaultLineColor = 'grey'
    } else {
      defaultColor = '#7cb5ec'
      defaultLineColor = '#7cb5ec'
    }
    fullStat.push({
      // color: props.colors[i],
      color: defaultColor,
      label: props.labels[i],
      value: props.values[i],
    })
  }

  /**
   * DKDK: please note that currently mouseover event may not work properly because svg width and height are set larger value than actual marker icon size
   * such a large size of svg (not icon size) is for implementing icon's drop shadow
   * At the same time, those increase size may confuse user to place a proper location of mouse pointer for mouseover event
   */

  //DKDK construct histogram marker icon
  const size = 50   //DKDK histogram marker icon size: note that popbio/mapveu donut marker icons = 40
  const xSize = 55  //DKDK make the histogram width a bit larger considering the total number space in the bottom of histogram
  const ySize = 65  //DKDK set height differently
  let svgHTML: string = ''  //DKDK divIcon HTML contents

  // //DKDK testing shadow
  // svgHTML += '<svg width="' + (xSize) + '" height="' + (ySize) + '">'   //DKDK initiate svg marker icon
  //DKDK shadow version
  svgHTML += '<svg width="' + (size+50) + '" height="' + (ySize+50) + '">'   //DKDK initiate svg marker icon
  svgHTML += '<defs><filter id="svgShadow" x="0" y="0" width="200%" height="200%"><feOffset result="offOut" in="SourceAlpha" dx="7" dy="7" /><feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" /><feBlend in="SourceGraphic" in2="blurOut" mode="normal" /></filter></defs>'


  let count = fullStat.length
  let sumValues: number = fullStat.map(o => o.value).reduce((a, c) => { return a + c })     //DKDK summation of fullStat.value per marker icon
  var maxValues: number = Math.max(...fullStat.map(o=>o.value));                            //DKDK max of fullStat.value per marker icon
  //DKDK for local max, need to check the case wherer all values are zeros that lead to maxValues equals to 0 -> "divided by 0" can happen
  if (maxValues == 0) {
    maxValues = 1   //DKDK this doesn't matter as all values are zeros
  }

  const roundX = 10     //DKDK round corner in pixel
  const roundY = 10     //DKDK round corner in pixel
  const marginX = 5     //DKDK margin to start drawing bars in left and right ends of svg marker: plot area = (size - 2*marginX)
  const marginY = 5     //DKDK margin to start drawing bars in Y

  // //DKDK thin line: drawing outer box with round corners: changed border color (stroke)
  svgHTML += '<rect x="0" y="0" rx=' + roundX + ' ry=' + roundY + ' width=' + xSize + ' height=' + ySize + ' fill="white" stroke="' + defaultLineColor +'" stroke-width="1" opacity="1.0" />'

  //DKDK below drop shadow, inner border, dashed line are functional by simply uncommenting each line
  // // DKDK drop shadow version
  // svgHTML += '<rect x="0" y="0" rx=' + roundX + ' ry=' + roundY + ' width=' + xSize + ' height=' + ySize + ' fill="white" stroke="' + defaultLineColor +'" stroke-width="1" opacity="1.0" filter="url(#svgShadow)" />'

  // //DKDK add inner border (thicker line) to avoid the issue of clipped border in svg
  // svgHTML += '<rect x=1 y=1 rx="8" ry="8" width="53" height="63" fill="white" opacity="0.5" stroke="black" stroke-width="2"/>'

  // //DKDK dashed line
  // svgHTML += '<rect x=1 y=1 rx="8" ry="8" width="53" height="63" fill="white" opacity="0.5" stroke="black" stroke-width="2" stroke-dasharray="4"/>'

  //DKDK set globalMaxValue non-zero if props.yAxisRange exists
  let globalMaxValue: number = 0
  if (props.yAxisRange) {
    globalMaxValue = props.yAxisRange[1]-props.yAxisRange[0];
  }

  //DKDK initialize variables for using at if-else
  let barWidth: number, startingX: number, barHeight: number, startingY: number

  if (globalMaxValue) {
    fullStat.forEach(function (el: {color: string, label: string, value: number}, index) {
      // console.log('global approach')
      //DKDK for the case of y-axis range input: a global approach that take global max = icon height
      barWidth = (xSize-2*marginX)/count               //DKDK bar width
      // startingX = marginX + barWidth*iter             //DKDK x in <react> tag: note that (0,0) is top left of the marker icon
      startingX = marginX + barWidth*index             //DKDK x in <react> tag: note that (0,0) is top left of the marker icon
      barHeight = el.value/globalMaxValue*(size-2*marginY) //DKDK bar height: used 2*marginY to have margins at both top and bottom
      startingY = (size-marginY)-barHeight            //DKDK y in <react> tag: note that (0,0) is top left of the marker icon
      //DKDK making the last bar, noData, have line
      if(fullStat.length -1 == index) {
        svgHTML += '<rect x=' + startingX + ' y=' + startingY + ' width=' + barWidth + ' height=' + barHeight + ' fill=' + el.color + ' stroke="grey" stroke-width="1" />'
      } else {
        svgHTML += '<rect x=' + startingX + ' y=' + startingY + ' width=' + barWidth + ' height=' + barHeight + ' fill=' + el.color + ' />'
      }
    })
  } else {
    fullStat.forEach(function (el: {color: string, label: string, value: number}, index) {
      //DKDK for the case of auto-scale y-axis: a local approach that take local max = icon height
      barWidth = (xSize-2*marginX)/count               //DKDK bar width
      // startingX = marginX + barWidth*iter             //DKDK x in <react> tag: note that (0,0) is top left of the marker icon
      startingX = marginX + barWidth*index             //DKDK x in <react> tag: note that (0,0) is top left of the marker icon
      barHeight = el.value/maxValues*(size-2*marginY) //DKDK bar height: used 2*marginY to have margins at both top and bottom
      startingY = (size-marginY)-barHeight            //DKDK y in <react> tag: note that (0,0) is top left of the marker icon

      if(fullStat.length -1 == index) {
        svgHTML += '<rect x=' + startingX + ' y=' + startingY + ' width=' + (barWidth-2) + ' height=' + barHeight + ' fill=' + el.color + ' stroke="grey" stroke-width="1" />'
      } else {
        svgHTML += '<rect x=' + startingX + ' y=' + startingY + ' width=' + (barWidth-2) + ' height=' + barHeight + ' fill=' + el.color + ' />'
      }
    })
  }
  //DKDK add horizontal line
  svgHTML += '<line x1="0" y1="' + (size-1) + '" x2="' + xSize + '" y2="' + (size-1) + '" style="stroke:grey;stroke-width:1" />'

  // //DKDK a test to add text (here, total sum) at the center of the marker icon: please uncomment for testing - this may not be used in the end though
  // svgHTML += '<text x="50%" y="88%" dominant-baseline="middle" text-anchor="middle" opacity="1">' + sumValues + '</text>'
  //DKDK shadow version
  svgHTML += '<text x="29%" y="50%" dominant-baseline="middle" text-anchor="middle" opacity="1">' + sumValues + '</text>'

  // DKDK closing svg tag
  svgHTML += '</svg>'

  //DKDK set icon
  let HistogramIcon: any = L.divIcon({
    className: 'leaflet-canvas-icon',        //DKDK need to change this className but just leave it as it for now
    iconSize: new L.Point(0, 0),             //DKDKset iconSize = 0
    iconAnchor: new L.Point(size/2,size/2),  //DKDK location of topleft corner: this is used for centering of the icon like transform/translate in CSS
    html: svgHTML                            //DKDK divIcon HTML svg code generated above
  });

  return (
    <Marker {...props} icon={HistogramIcon}>
      {/* DKDK Below Tooltip also works but we may simply use title attribute as well */}
      {/* However, Connor found coordinates issue and I realized that somehow "title" did not update coordinates correctly */}
      {/* But both Popup and Tooltip do not have such an issue */}
      {/* <Popup>{props.position.toString()}</Popup> */}
      {/* <Tooltip>{props.position.toString()}</Tooltip> */}
      {/* <Tooltip>
        labels: {props.labels.join(" ")} <br/>
	      values: {props.values.join(" ")} <br />
        latlong: {props.position.toString()}
      </Tooltip> */}
    </Marker>
  );
}
