import React, { useMemo } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { LegendOrdinal } from '@visx/legend';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { localPoint } from '@visx/event';
import { Grid } from '@visx/grid';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';
import { Text } from '@visx/text';

import { LIGHT_GRAY, MEDIUM_GRAY } from '../constants/colors';
import TooltipContent from '../components/TooltipContent';

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
  /** The orientation of the plot. Defaults to `vertical` */
  orientation: 'vertical' | 'horizontal';
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
  /** Whether to display the series legend. */
  displayLegend: boolean;
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
  orientation = 'vertical',
  title,
  titleColor = MEDIUM_GRAY,
  barOpacity,
  axisColor = MEDIUM_GRAY,
  backgroundColor = LIGHT_GRAY,
  backgroundGradientColors,
  displayGrid = false,
  displayLegend = false,
  events = false,
}: HistogramProps) {
  // Determine maximum width/height for the parent SVG element.
  const xMax = displayLegend ? width * 0.8 : width;
  const yMax = height - verticalMargin;

  // Determine bar opacity.
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
  const categoricalScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, orientation === 'vertical' ? xMax : yMax],
        round: true,
        domain: flattenedBins.map(binLabel),
        padding: 0.2,
      }),
    [xMax, yMax, orientation, flattenedBins]
  );
  const linearScale = useMemo(
    () =>
      scaleLinear<number>({
        range: orientation === 'vertical' ? [yMax, 0] : [0, xMax - 125],
        round: true,
        domain: [0, Math.max(...flattenedBins.map((bin) => bin.count))],
      }),
    [xMax, yMax, orientation, flattenedBins]
  );

  const legendScale = useMemo(
    () =>
      scaleOrdinal({
        domain: data.map((series) => series.seriesName),
        range: data.map((series) => series.seriesColor),
      }),
    data
  );

  // Prep Tooltip
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<FlattenedBin>();

  const handleBarMouseOver = (
    event: React.MouseEvent<SVGRectElement, MouseEvent>,
    datum: any
  ) => {
    console.log(datum);

    // @ts-ignore
    const coords = localPoint(event.target.ownerSVGElement, event);
    showTooltip({
      tooltipLeft: coords!.x,
      tooltipTop: coords!.y,
      tooltipData: datum,
    });
  };

  const grid = () =>
    displayGrid && (
      <Grid
        top={verticalMargin / 2}
        left={orientation === 'vertical' ? 0 : 75}
        xScale={orientation === 'vertical' ? categoricalScale : linearScale}
        yScale={orientation === 'vertical' ? linearScale : categoricalScale}
        width={orientation === 'vertical' ? xMax : xMax - 125}
        height={yMax}
        stroke='black'
        strokeOpacity={0.1}
        xOffset={
          orientation === 'vertical' ? categoricalScale.bandwidth() / 2 : 0
        }
        yOffset={
          orientation === 'horizontal' ? categoricalScale.bandwidth() / 2 : 0
        }
      />
    );

  const axes = () =>
    orientation === 'vertical' ? (
      <AxisBottom
        top={yMax + verticalMargin / 2}
        scale={categoricalScale}
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
    ) : (
      <AxisLeft
        top={verticalMargin / 2}
        scale={categoricalScale}
        left={75}
        hideTicks={true}
        stroke={axisColor}
        tickStroke={axisColor}
        tickLabelProps={() => ({
          fill: axisColor,
          fontSize: 12,
          fontFamily: 'Arial, Helvetica, sans-serif',
          textAnchor: 'end',
          transform: 'translate(0, 5)',
        })}
      />
    );

  const legend = () =>
    displayLegend && (
      <LegendOrdinal
        style={{
          flexBasis: width * 0.2,
          display: 'flex',
          justifyContent: 'flex-end',
          paddingBottom: verticalMargin / 2,
          paddingLeft: '25px',
          fontSize: '14px',
          fontFamily: 'Arial, Helvetica, san-serif',
          color: MEDIUM_GRAY,
        }}
        scale={legendScale}
        itemMargin='10px 0 0 0'
      />
    );

  return (
    <div
      style={{ position: 'relative', display: 'flex', flexDirection: 'row' }}
    >
      <svg width={xMax} height={height}>
        {backgroundGradientColors && (
          <LinearGradient
            from={backgroundGradientColors[0]}
            to={backgroundGradientColors[1]}
            id='backgroundGradient'
          />
        )}
        <rect
          width={xMax}
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
        {grid()}
        <Group top={verticalMargin / 2}>
          {flattenedBins.map((bin, index) => {
            const barWidth =
              orientation === 'vertical'
                ? categoricalScale.bandwidth()
                : linearScale(bin.count);
            const barHeight =
              orientation === 'vertical'
                ? yMax - linearScale(bin.count)
                : categoricalScale.bandwidth();

            const barX =
              orientation === 'vertical' ? categoricalScale(binLabel(bin)) : 75;
            const barY =
              orientation === 'vertical'
                ? yMax - barHeight
                : categoricalScale(binLabel(bin));

            return (
              <Bar
                key={`bar-${index}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={bin.color}
                opacity={calculatedBarOpacity}
                onMouseOver={(event) => handleBarMouseOver(event, bin)}
                onMouseOut={hideTooltip}
                onClick={() => {
                  if (events)
                    alert(`clicked: ${JSON.stringify(Object.values(bin))}`);
                }}
              />
            );
          })}
        </Group>
        {axes()}
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <TooltipContent
            data={{ Bin: binLabel(tooltipData), Count: tooltipData.count }}
            colorSwatch={tooltipData.color}
          />
        </TooltipWithBounds>
      )}
      {legend()}
    </div>
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
