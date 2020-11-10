import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import { Grid } from '@visx/grid';
import { LIGHT_GRAY, MEDIUM_GRAY } from '../constants/colors';
import { Text } from '@visx/text';

/**
 * Steps
 * 1. Come up with a reasonable representation of pre-binned data.
 * Ideally this would be able to drop into a bar chart.
 */

const verticalMargin = 120;

export type HistogramData<T> = Array<{
  seriesName: string;
  seriesColor: string;
  data: HistogramBin<T>[];
}>;

type HistogramBin<T> = {
  binStart: T;
  binEnd: T;
  count: number;
};

type FlattenedBin = {
  start: number;
  end?: number;
  count: number;
  series: string;
  color: string;
};

// accessors
const binLabel = (bin: FlattenedBin) =>
  bin.end ? `${bin.start} - ${bin.end}` : `${bin.start}`;

export type HistogramProps = {
  /** Data for the plot */
  data: HistogramData<number>;
  /** The width of the plot in pixels. */
  width: number;
  /** The height of the plot in pixels. */
  height: number;
  /** Title of plot. */
  title?: string;
  /** Fill color of the title. */
  titleColor?: string;
  /** Opacity of bars. Range is a decimal between 0 and 1. Defaults to 1
   * if there is only one data series, or .5 if there is more than one.
   */
  barOpacity?: number;
  /** Color of Axis and Tick Labels. Defaults to a medium gray. */
  axisColor?: string;
  /** Whether to display a grid in the background of the plot. */
  displayGrid?: boolean;

  /** Control of background color. Defaults to LIGHT_GRAY.  */
  backgroundColor?: string;

  /** Specifies that a linear gradient should be used as the background. */
  backgroundGradientColors?: [string, string];

  events?: boolean;
};

export default function Histogram({
  data,
  width,
  height,
  title,
  titleColor = MEDIUM_GRAY,
  barOpacity,
  axisColor = MEDIUM_GRAY,
  backgroundColor = LIGHT_GRAY,
  backgroundGradientColors,
  displayGrid = false,
  events = false,
}: HistogramProps) {
  // bounds
  const xMax = width;
  const yMax = height - verticalMargin;

  const calculatedBarOpacity = barOpacity
    ? barOpacity
    : data.length === 1
    ? 1
    : 0.75;

  /**
   * Transform Bins
   */
  const flattenedBins = useMemo<Array<FlattenedBin>>(() => {
    const flattenedBins = data.reduce(
      (aggregatedValue: FlattenedBin[], currentSeries) => {
        const seriesBins = currentSeries.data.map<FlattenedBin>((bin) => ({
          start: bin.binStart,
          end: bin.binEnd,
          color: currentSeries.seriesColor,
          series: currentSeries.seriesName,
          count: bin.count,
        }));

        return [...aggregatedValue, ...seriesBins];
      },
      []
    );

    return flattenedBins.sort((binA, binB) => binA.start - binB.start);
  }, [data]);

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: flattenedBins.map(binLabel),
        padding: 0.2,
      }),
    [xMax, flattenedBins]
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...flattenedBins.map((bin) => bin.count))],
      }),
    [yMax, flattenedBins]
  );

  return (
    <svg width={width} height={height}>
      {/* <GradientTealBlue id='teal' /> */}
      {backgroundGradientColors && (
        <LinearGradient
          from={backgroundGradientColors[0]}
          to={backgroundGradientColors[1]}
          id='backgroundGradient'
        />
      )}
      {/* <rect width={plotWidth} height={plotHeight} fill='url(#teal)' rx={14} /> */}
      <rect
        width={width}
        height={height}
        fill={
          backgroundGradientColors
            ? 'url(#backgroundGradient)'
            : backgroundColor
        }
        rx={14}
      />
      {title && (
        <Text
          scaleToFit={true}
          fontFamily='Arial, Helvetica, sans-serif'
          fontSize={18}
          fill={titleColor}
          x={25}
          y={verticalMargin / 4}
          verticalAnchor='middle'
        >
          {title}
        </Text>
      )}
      {displayGrid && (
        <Grid
          top={verticalMargin / 2}
          left={0}
          xScale={xScale}
          yScale={yScale}
          width={xMax}
          height={yMax}
          stroke='black'
          strokeOpacity={0.1}
          xOffset={xScale.bandwidth() / 2}
        />
      )}
      <Group top={verticalMargin / 2}>
        {flattenedBins.map((bin, index) => {
          const barWidth = xScale.bandwidth();
          const barX = xScale(binLabel(bin));
          const barHeight = yMax - yScale(bin.count);
          const barY = yMax - barHeight;

          return (
            <Bar
              key={`bar-${index}`}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill={bin.color}
              opacity={calculatedBarOpacity}
              onClick={() => {
                if (events)
                  alert(`clicked: ${JSON.stringify(Object.values(bin))}`);
              }}
            />
          );
        })}
      </Group>
      <AxisBottom
        top={yMax + verticalMargin / 2}
        scale={xScale}
        //   tickFormat={formatDate}
        stroke={axisColor}
        tickStroke={axisColor}
        tickLabelProps={() => ({
          fill: axisColor,
          fontSize: 12,
          fontFamily: 'Arial, Helvetica, sans-serif',
          textAnchor: 'middle',
          transform: 'translate(0, 5)',
        })}
      />
    </svg>
  );
}

// type SupportedDataTypes = 'number' | 'date';
// type UserDataTypeToNativeType<T extends SupportedDataTypes> = T extends 'number'
//   ? number
//   : T extends 'date'
//   ? string
//   : never;

// interface Props<T extends 'number' | 'date'> {
//   // This can be used by the component if special logic is required based on type
//   // E.g., if `date`, will need `layout.xaxis.type = date`
//   dataType: T;

//   // Data, as an array. See `props.layout` for display options
//   data: Array<{
//     series: Array<{
//       binStart: UserDataTypeToNativeType<T>;
//       // defaults to something like "{binStart} - {binStart + binWidth}"
//       binLabel?: string;
//     }>;
//     color?: string;
//   }>;

//   // stacked bars vs overlayed plots
//   layout: 'stack' | 'overlay';

//   // If this is not provided, it should be inferred from the data. We can just let plotly figure this out.
//   //   defaultYAxisRange?: [T, T];
//   //   onYAxisRangeChange: (range: [T, T]) => void;

//   // Controls direction of bars
//   defaultOrientation?: 'vertical' | 'horizontal';

//   // Controls opacity of bars, gobally
//   defaultOpacity?: number;

//   // ----------------
//   // BACKEND CONTROLS
//   // ----------------
//   //
//   // component consumer is responsible for updating the data based on the settings

//   // bin width related props
//   binWidth: UserDataTypeToNativeType<T>;
//   //   onBinWidthChange: (width: UserDataTypeToNativeType<T>) => void;

//   // units related props
//   //   units: string[];
//   //   selectedUnits: string;
//   //   onUnitsChange: (units: string) => void;

//   // barSize related props
//   //   barSize: 'absolute' | 'proportional';
//   //   onBarSizeChange: (barSize: 'absolute' | 'proportional') => void;
// }

// function Histogram<T extends SupportedDataTypes>(props: Props<T>) {
//   props.dataType;

//   return <div></div>;
// }

// Histogram<'number'>({
//   dataType: 'number',
//   binWidth: 123,
//   data: [],
//   layout: 'overlay',
// });

// export default Histogram;
