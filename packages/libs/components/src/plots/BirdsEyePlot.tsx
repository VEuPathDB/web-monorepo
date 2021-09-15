import { CSSProperties, ReactNode, useMemo, useState } from 'react';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { BirdsEyePlotData } from '../types/plots';
import { PlotParams } from 'react-plotly.js';
import { Layout, Shape } from 'plotly.js';

// in this example, the main variable is 'country'
export interface BirdsEyePlotProps extends PlotProps<BirdsEyePlotData> {
  /** Label for dependent axis. Defaults to '' */
  dependentAxisLabel?: string;
  /** bracket line width, default is 2 */
  bracketLineWidth?: number;
  /** bracket head size, default is 0.15 */
  bracketHeadSize?: number;
}

const EmptyBirdsEyePlotData: BirdsEyePlotData = { brackets: [], bars: [] };

const defaultCountBoxStyle = {
  background: 'transparent',
  border: '1px solid #bfbfbf',
  padding: '5px',
  fontSize: '90%',
  maxWidth: '25%',
};

/** A Plotly-based Barplot component. */
export default function BirdsEyePlot({
  data = EmptyBirdsEyePlotData,
  dependentAxisLabel = '',
  bracketLineWidth = 2,
  bracketHeadSize = 0.15,
  containerStyles,
  ...restProps
}: BirdsEyePlotProps) {
  const [focused, setFocused] = useState(false);

  // Transform `data.bars` into a Plot.ly friendly format.
  const plotlyFriendlyData: PlotParams['data'] = useMemo(
    () =>
      data.bars.map((bar) => {
        // check data exist
        if (bar.label && bar.value) {
          return {
            x: bar.value,
            y: bar.label,
            name: bar.name, // legend name
            orientation: 'h',
            type: 'bar',
            marker: {
              opacity: 1,
              ...(bar.color ? { color: bar.color } : {}),
            },
            showlegend: false,
          };
        } else {
          return {};
        }
      }),
    [data.bars]
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

  const numCountBoxes = data.bars.length + data.brackets.length;
  const fullCounts: ReactNode[] = useMemo(() => {
    const bracketCounts = data.brackets.map(({ label, value }) =>
      CountBox({ label, value, focused })
    );
    const barCounts = data.bars.map((bar) =>
      CountBox({
        label: bar.name,
        value: bar.value[0] ?? 0,
        color: bar.color,
        focused,
      })
    );
    return [...[...bracketCounts].reverse(), ...[...barCounts].reverse()];
  }, [data, focused]);

  const weHaveData = numCountBoxes > 0;
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
    },
    barmode: 'overlay',
    shapes: plotlyShapes,
    hovermode: 'closest',
  };

  return (
    <div style={{ ...containerStyles, cursor: 'pointer' }}>
      <div
        onMouseOver={() => setFocused(true)}
        onMouseOut={() => setFocused(false)}
      >
        <PlotlyPlot
          data={plotlyFriendlyData}
          layout={layout}
          containerStyles={{ height: '100px' }}
          {...restProps}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          minHeight: '5em',
        }}
      >
        {fullCounts.length
          ? fullCounts
          : [CountBox({ label: 'placeholder', value: 0, focused: false })]}
      </div>
    </div>
  );
}

function indexToY(index: number, bracketHeadSize: number) {
  return 0.5 + bracketHeadSize + (index + bracketHeadSize) / 2;
}

type CountBoxProps = {
  label: string;
  value: number;
  focused: boolean;
  color?: string;
};

function CountBox({ label, value, color, focused }: CountBoxProps) {
  const countBoxStyle: CSSProperties = {
    ...defaultCountBoxStyle,
    ...(color ? { background: color } : {}),
    visibility: focused ? 'visible' : 'hidden',
  };

  return (
    <div style={countBoxStyle} key={label}>
      <b>{label}:</b> {Number(value).toLocaleString()}
    </div>
  );
}
