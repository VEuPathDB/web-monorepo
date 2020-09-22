import React, { useEffect } from "react";
import ReactDOM from 'react-dom';
import L from "leaflet";
import { Marker } from "react-leaflet";
import BarChart from './BarChart';
import { MarkerProps } from './Types';
import './BarMarker.css';

export interface BarMarkerProps extends MarkerProps {
  id: string,
  labels: string[],
  values: number[],
  yAxisRange: [number, number] | [] | null,
  type: 'bar' | 'line',
  library: 'highcharts' | 'plotly',
  colors: string[],
}
/**
 * A marker containing a small bar chart
 * 
 * @param props
 */
export default function BarMarker(props: BarMarkerProps) {
  // Create the divIcon to pass to the Leaflet marker
  // Give it an ID so we can know which plot goes in which marker
  const divIcon = L.divIcon({
    html: `<div class="chart-marker-icon ${props.type}-marker-icon"><div id=${props.id} class="chart-marker-chart ${props.type}-marker-chart"></div></div>`,
  });

  // Render the chart after the marker is rendered
  useEffect(() => {
    ReactDOM.render(
      <BarChart
        labels={props.labels}
        values={props.values}
        yAxisRange={props.yAxisRange}
        width={40}
        height={40}
        type={props.type}
        library={props.library}
        colors={props.colors}
      ></BarChart>,
      document.getElementById(props.id)
    );

    // Deconstruct the chart on marker derender
    return () => {
      const el = document.getElementById(props.id);
	  if (el) ReactDOM.unmountComponentAtNode(el);
    }
  });

  return (
    <Marker position={props.position} icon={divIcon}></Marker>
  );
}
