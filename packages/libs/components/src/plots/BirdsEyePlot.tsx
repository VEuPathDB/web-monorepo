import { useMemo } from 'react';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { BirdsEyePlotData } from '../types/plots';
import { PlotParams } from 'react-plotly.js';
import { Layout, Shape, PlotData } from 'plotly.js';
import { CSSProperties } from '@emotion/serialize';

// in this example, the main variable is 'country'
export interface BirdsEyePlotProps extends PlotProps<BirdsEyePlotData> {
  /** Label for dependent axis. Defaults to '' */
  dependentAxisLabel?: string;
  /** bracket line width, default is 2 */
  bracketLineWidth?: number;
  /** bracket head size, default is 0.15 */
  bracketHeadSize?: number;
  /** specifies the background color of the actual graph/plot, default is white */
  plotBgColor?: CSSProperties['backgroundColor'];
  /** specifies the background color of the container for all parts of the graph/plot, including the axes and labels;
   *  defaults to white
   */
  paperBgColor?: CSSProperties['backgroundColor'];
}

const EmptyBirdsEyePlotData: BirdsEyePlotData = { brackets: [], bars: [] };

/** A Plotly-based Barplot component. */
export default function BirdsEyePlot({
  data = EmptyBirdsEyePlotData,
  dependentAxisLabel = '',
  bracketLineWidth = 2,
  bracketHeadSize = 0.15,
  plotBgColor = 'white',
  paperBgColor = 'white',
  ...restProps
}: BirdsEyePlotProps) {
  // Transform `data.bars` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.bars
        .map((bar): Partial<PlotData> => {
          // check data exist
          if (bar.label && bar.value != null) {
            return {
              x: [bar.value],
              y: [''],
              name: bar.label, // legend name
              orientation: 'h',
              type: 'bar',
              marker: {
                opacity: 1,
                ...(bar.color ? { color: bar.color } : {}),
              },
              showlegend: true,
            };
          } else {
            return {};
          }
        })
        .concat(
          // make some invisible traces for the brackets
          // so that we get mouseover functionality
          // (using scatter/lines to get the popup legend to show them as
          // lines - I'm not sure how they ended up being invisible -
          // maybe because a line needs more than one point?)
          data.brackets.map((bracket): Partial<PlotData> => {
            if (bracket.value != null) {
              return {
                x: [bracket.value],
                y: [''],
                type: 'scatter',
                mode: 'lines',
                name: bracket.label,
                orientation: 'h',
                showlegend: false,
                marker: {
                  color: 'black',
                },
              };
            } else {
              return {};
            }
          })
        ),
    [data]
  );

  // now transform `data.brackets` into line drawings
  const plotlyShapes: Partial<Shape>[] = useMemo(
    () =>
      data.brackets
        .map((bracket, index) => {
          return [
            {
              // the main line
              type: 'line',
              xref: 'x',
              yref: 'y',
              x0: 0,
              y0: indexToY(index, bracketHeadSize),
              x1: bracket.value,
              y1: indexToY(index, bracketHeadSize),
              line: {
                color: 'black',
                width: bracketLineWidth,
              },
            },
            {
              // the top of the 'T'
              type: 'line',
              xref: 'x',
              yref: 'y',
              x0: bracket.value,
              y0: indexToY(index, bracketHeadSize) + bracketHeadSize,
              x1: bracket.value,
              y1: indexToY(index, bracketHeadSize) - bracketHeadSize,
              line: {
                color: 'black',
                width: bracketLineWidth,
              },
            },
          ] as Partial<Shape>[]; // TO DO: can we get rid of this?
        })
        .flat(),
    [data.brackets, bracketLineWidth, bracketHeadSize]
  );

  const weHaveData = data.brackets.length > 0 || data.bars.length > 0;
  const layout: Partial<Layout> = {
    xaxis: {
      automargin: weHaveData, // this avoids a console warning about too many auto-margin redraws that occur with empty data
      showgrid: false,
      title: {
        text: weHaveData ? dependentAxisLabel : undefined,
      },
      zeroline: false,
      tickfont: weHaveData ? {} : { color: 'transparent' },
      ticks: weHaveData ? 'inside' : undefined,
      showline: false, // data.bars.length > 0 || data.brackets.length > 0,
      tickformat: ',',
    },
    yaxis: {
      automargin: weHaveData,
      showgrid: false,
      zeroline: false,
      showline: weHaveData,
      title: {},
      tickfont: weHaveData ? {} : { color: 'transparent' },
      tickmode: 'array',
      tickvals: data.brackets.map((_, index) =>
        indexToY(index, bracketHeadSize)
      ),
      ticktext: data.brackets.map((bracket) => bracket.label),
      showspikes: false, // this stops the dotted line showing with the unified hover label
    },
    legend: {
      orientation: 'v',

      // these x,y adjustments are likely dependent on the lengths of the bracket labels
      // and so in future the positioning may have to be delegated to the calling component
      // (so the { x, y } legend location would need to be added as a prop)
      x: -0.33 - 0.01 * data.brackets.length,
      y: 0.05 - 0.1 * data.brackets.length,

      bgcolor: 'transparent',
      traceorder: 'reversed',
    },
    barmode: 'overlay',
    shapes: plotlyShapes,
    hovermode: false,
    hoverdistance: 1000,
    hoverlabel: {
      namelength: -1, // this should disable ellipsis truncation, but it still does... :(
      font: {
        size: 13, // for some reason, size: 14 causes some intermittent placement problems...
      },
    },
    paper_bgcolor: paperBgColor,
    plot_bgcolor: plotBgColor,
  };

  const barLabels = data.bars.map((bar) => bar.label);

  return (
    <PlotlyPlot
      data={plotlyFriendlyData}
      layout={layout}
      {...restProps}
      checkedLegendItems={barLabels}
    />
  );
}

function indexToY(index: number, bracketHeadSize: number) {
  return 0.5 + bracketHeadSize + (index + bracketHeadSize) / 2;
}
