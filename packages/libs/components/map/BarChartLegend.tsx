/*
 * DKDK this is based on Connor's BarChart.tsx but customized for Legend bar chart
 * unnecessary parts for Legend bar chart, e.g., react-highcharts, etc. are not removed yet
 */
import React from 'react';
import Plot from 'react-plotly.js';
import ReactHighcharts from 'react-highcharts';
// import { withKnobs, text, boolean, number, radios } from '@storybook/addon-knobs';   //DKDK comment this out

interface BarChartProps {
  labels: string[],
  values: number[],
  yAxisRange: [number, number] | [] | null,
  width: number,
  height: number,
  type: 'bar' | 'line',
  fillArea?: boolean,
  spline?: boolean,
  lineVisible?: boolean,
  colorMethod: 'discrete' | 'gradient'
  library: 'highcharts' | 'plotly',
  colors?: string[] | null,
  //DKDK perhaps we should send x-/y- axes labels and their font sizes to minimize hard-coded values
  xAxisLabel?: string,
  yAxisLabel?: string,
  axisLabelSize?: number,
  tickLabelSize?: number,
}

// This appears and disappears seemingly randomly. I don't know why.
// let knob_type = radios('Type', {Bar: 'bar', Line: 'line'}, 'Bar');
// console.log(knob_type);

/**
 * A simple, unlabeled bar chart
 *
 * @param props
 */
export default function BarChartLegend(props: BarChartProps) {
  //DKDK need to initialize to avoid ts error
  let element: JSX.Element = <></>

  // Not updating plotly implementation currently
  if (props.library === 'plotly') {
    // console.log('Notice: Plotly implementation not currently being updated!');   //DKDK comment this out
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

    if (!(props.yAxisRange === null || props.yAxisRange === [])) {
      yAxisProps = {
        range: props.yAxisRange,
      }
    }

    //DKDK add type for data
    let data = [
      {
        x: props.labels,
        y: props.values,
        marker: {
          //DKDK change color to be array
          // color: '#7cb5ec',
          color: props.colors,
        },
        ...typeProps
      },
    ];

    //DKDK add margin size
    let marginSize = 30

    let layout = {
      // Temporarily setting width/height through props
      width: props.width,
      height: props.height,
      //DKDK add autosize for better display
      autosize: true,
      xaxis: {
        //DKDK disabling visible, adding title and tickfont
        // visible: false,
        title: {
          text: props.xAxisLabel,
          font: {
            // family: 'Courier New, monospace',
            size: props.axisLabelSize,
            color: 'black'
          }
        },
        tickfont: {
          size: props.tickLabelSize,
        },
        fixedrange: true,   //DKDK disable mouse zooming
      },
      yaxis: {
        //DKDK disabling visible, adding title and tickfont
        title: {
          text: props.yAxisLabel,
          font: {
            // family: 'Courier New, monospace',
            size: props.axisLabelSize,
            color: 'black'
          }
        },
        tickfont: {
          size: props.tickLabelSize,
        },
        fixedrange: true,   //DKDK disable mouse zooming
        ...yAxisProps
      },
      //DKDK change margin as default plot without width/height has large margins
      // margin: {
      //   l: 0,
      //   r: 0,
      //   t: 0,
      //   b: 0,
      // },
      margin: {
        l: marginSize+5,
        r: 0,
        t: marginSize-20,
        b: marginSize,
      },
    };

    let config = {
      //DKDK enabling mouseover event to show values per bar
      // staticPlot: true,      //DKDK disable this property
      displayModeBar: false,  //DKDK add this to disable modebar
    };

    element = <Plot data={data} layout={layout} config={config}></Plot>;
  }

  else if (props.library === 'highcharts') {
    let type;
    let yAxisProps = {};

    if (props.type === 'bar') {
      type = 'column';
    } else {
      if (props.fillArea) {
        if (props.spline) {
          type = 'areaspline'
        } else {
          type = 'area';
        }
      } else {
        if (props.spline) {
          type = 'spline';
        } else {
          type = 'line';
        }
      }
    }

    if (!(props.yAxisRange === null || props.yAxisRange === [])) {
      yAxisProps = {
        min: props.yAxisRange[0],
        max: props.yAxisRange[1],
      }
    }

    // Options dealing with coloring
    let colorProps = {};

    if (props.type === 'bar') {
      colorProps = {
        colorByPoint: true,
        colors: props.colors,
      };
    } else if (props.type === 'line') {
      if (props.colorMethod === 'discrete') {
        colorProps = {
          zoneAxis: 'x',
          zones: props.values.map((value, i) => {
            return {
              value: i + 0.5,
              color: props.colors[i],
            };
          }),
        };
      } else if (props.colorMethod === 'gradient') {
        const gradientObj = {
          linearGradient: {x1: 0, x2: 1, y1: 0, y2: 0},
          stops: [
              [0, '#8cbdff'], // start
              //[0.5, '#ffffff'], // middle
              [1, '#001b52'] // end
          ],
        };
        colorProps = {
          color: gradientObj,
          fillColor: gradientObj,
        };
      }
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
        ...colorProps,
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
          lineWidth: props.fillArea && !props.lineVisible ? 0 : 2,
        },
      },
    }

    element = <ReactHighcharts config={config}></ReactHighcharts>;
  }

  return element;

}
