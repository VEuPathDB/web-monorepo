import React from 'react';
import Plot from 'react-plotly.js';
import ReactHighcharts from 'react-highcharts';

interface BarChartProps {
  labels: string[],
  values: number[],
  yRange: [number, number] | [] | null,
  width: number,
  height: number,
  type: 'bar' | 'line',
  library: 'highcharts' | 'plotly',
  colors: string[] | null,
}

/**
 * A simple, unlabeled bar chart
 * 
 * @param props
 */
export default function BarChart(props: BarChartProps) {
  let element: JSX.Element;

  // Not updating plotly implementation currently
  if (props.library === 'plotly') {
    console.log('Notice: Plotly implementation not currently being updated!');
    let typeProps;
    let yAxisProps = {};

    if (props.type === 'bar') {
      typeProps = {
        type: 'bar',
      };
    }
    else if (props.type === 'line') {
      typeProps = {
        type: 'scatter',
        mode: 'lines',
        line: {shape: 'spline'},
        fill: 'tozeroy',
      };
    }

    if (!(props.yRange === null || props.yRange === [])) {
      yAxisProps = {
        range: props.yRange,
      }
    }

    let data = [
      {
        x: props.labels,
        y: props.values,
        marker: {
          color: '#7cb5ec',
        },
        ...typeProps
      },
    ];

    let layout = {
      // Temporarily setting width/height through props
      width: props.width,
      height: props.height,
      xaxis: {
        visible: false,
      },
      yaxis: {
        visible: false,
        ...yAxisProps
      },
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0,
      },
    };
  
    let config = {
      staticPlot: true
    };
  
    element = <Plot data={data} layout={layout} config={config}></Plot>;
  }

  else if (props.library === 'highcharts') {
    let type;
    let yAxisProps = {};

    if (props.type === 'bar') {
      type = 'column';
    } else {
      type = 'areaspline';
    }

    if (!(props.yRange === null || props.yRange === [])) {
      yAxisProps = {
        min: props.yRange[0],
        max: props.yRange[1],
      }
    }

    // Construct the objects that deal with color
    let zones;
    let gradient;

    if (props.colors !== null) {
      zones = props.values.map((value, i) => {
        return {
          value: value,
          color: props.colors[i],
          fillColor: props.colors[i],
        };
      });
      gradient = null;
    } else {
      zones = null;
      gradient = {
        linearGradient: {x1: 0, x2: 1, y1: 0, y2: 0},
        stops: [
            [0, '#8cbdff'], // start
            //[0.5, '#ffffff'], // middle
            [1, '#001b52'] // end
        ],
      };
    }

    let config = {
      chart: {
        type: type,
        width: props.width,
        height: props.height,
        margin: 0,
      },
      title: {
        text: undefined,
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        enabled: false,
      },
      xAxis: {
        categories: props.labels,
        visible: false,
      },
      yAxis: {
        visible: false,
        ...yAxisProps
      },
      series: [{
        data: props.values,
        zones: zones,
        //lineWidth: 0,
        fillColor: gradient,
      }],
      credits: {
        enabled: false,
      },
      plotOptions: {
        column: {
            groupPadding: 0.025,
        },
        series: {
          animation: false,
          marker: {
            enabled: false,
          },
          enableMouseTracking: false,
          lineWidth: 0,
          zoneAxis: 'x',
          zones: zones,
        },
        // area: {
        //   fillColor: gradient,
        // },
      },
    }

    element = <ReactHighcharts config={config}></ReactHighcharts>;
  }

  return element;
}
