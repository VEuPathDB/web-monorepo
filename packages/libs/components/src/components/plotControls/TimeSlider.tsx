/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useMemo } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
// add ResizeTriggerAreas type
import { Bounds, ResizeTriggerAreas } from '@visx/brush/lib/types';
import { Group } from '@visx/group';
import { max, extent } from 'd3-array';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { AxisBottom } from '@visx/axis';
import { millisecondTodate } from '../../utils/date-format-change';
import { Bar } from '@visx/shape';
import { debounce } from 'lodash';

export type TimeSliderDataProp = {
  x: string;
  y: number;
};

export type TimeSliderProps = {
  /** Ez time filter data  */
  data: TimeSliderDataProp[];
  /** current state of selectedRange */
  selectedRange: { start: string; end: string } | undefined; // #761 - see appState.ts - maybe also number?
  /** update function selectedRange */
  setSelectedRange: (
    selectedRange: { start: string; end: string } | undefined
  ) => void;
  /** optional xAxisRange - will limit the selection to be within this */
  xAxisRange?: { start: string; end: string }; // #761 or number?
  /** width */
  width?: number;
  /** height */
  height?: number;
  /** color of the 'has data' bars - default is black */
  barColor?: string;
  /** color of the selected range - default is lightblue */
  brushColor?: string;
  /** axis tick and tick label color - default is black */
  axisColor?: string;
  /** opacity of selected brush - default is 0.4 */
  brushOpacity?: number;
  /** debounce rate in millisecond */
  debounceRateMs?: number;
  /** all user-interaction disabled */
  disabled?: boolean;
};

// using forwardRef
function TimeSlider(props: TimeSliderProps) {
  const {
    data,
    // set default width and height
    width = 720,
    height = 100,
    brushColor = 'lightblue',
    barColor = '#333',
    axisColor = '#000',
    brushOpacity = 0.4,
    selectedRange,
    setSelectedRange,
    // set a default debounce time in milliseconds
    debounceRateMs = 500,
    disabled = false,
    xAxisRange,
  } = props;

  const resizeTriggerAreas: ResizeTriggerAreas[] = disabled
    ? []
    : ['left', 'right'];

  // define default values
  const margin = { top: 0, bottom: 10, left: 10, right: 10 };
  const selectedBrushStyle = {
    fill: disabled ? 'lightgray' : brushColor,
    stroke: disabled ? 'lightgray' : brushColor,
    fillOpacity: brushOpacity,
    // need to set this to be 1?
    strokeOpacity: 1,
  };

  // axis props
  const axisBottomTickLabelProps = {
    textAnchor: 'middle' as const,
    fontFamily: 'Arial',
    fontSize: 10,
    fill: axisColor,
  };

  // accessors for data
  const getXData = (d: TimeSliderDataProp) => new Date(d.x); // #761 - don't convert for non-dates
  const getYData = (d: TimeSliderDataProp) => d.y;

  const onBrushChange = useMemo(
    () =>
      debounce((domain: Bounds | null) => {
        if (!domain) return;
        const { x0, x1 } = domain;
        // x0 and x1 are millisecond value
        // #761 only need to convert from milliseconds when the domain is `Date` type
        // #761 but we may need to convert to string? Depends on types in appState.ts
        // #761 (best not to convert to string, because of < and > comparisons below)
        const startDate = millisecondTodate(x0);
        const endDate = millisecondTodate(x1);
        setSelectedRange({
          // don't let range go outside the xAxisRange, if provided
          start: xAxisRange
            ? startDate < xAxisRange.start
              ? xAxisRange.start
              : startDate
            : startDate,
          end: xAxisRange
            ? endDate > xAxisRange.end
              ? xAxisRange.end
              : endDate
            : endDate,
        });
      }, debounceRateMs),
    [setSelectedRange, xAxisRange]
  );

  // Cancel any pending onBrushChange requests when this component is unmounted
  useEffect(() => {
    return () => {
      onBrushChange.cancel();
    };
  }, []);

  // bounds
  const xBrushMax = Math.max(width - margin.left - margin.right, 0);
  // take 70 % of given height considering axis tick/tick labels at the bottom
  const yBrushMax = Math.max(0.7 * height - margin.top - margin.bottom, 0);

  // scaling
  const xBrushScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain:
          data != null ? (extent(data, getXData) as [Date, Date]) : undefined, // #761 don't always cast to Date
      }),
    [data, xBrushMax]
  );

  const yBrushScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(data, getYData) || 1],
        // set zero: false so that it does not include zero line in the middle of y-axis
        // this is useful when all data have zeros
        zero: false,
      }),
    [data, yBrushMax]
  );

  // initial selectedRange position
  const initialBrushPosition = useMemo(
    () =>
      selectedRange != null
        ? {
            // If we reenable the fake controlled behaviour of the <Brush> component using the key prop
            // then we'll need to figure out why both brush handles drift every time you adjust one of them.
            // The issue is something to do with the round-trip conversion of pixel/date/millisecond positions.
            // A good place to start looking is here.
            start: { x: xBrushScale(new Date(selectedRange.start)) }, // #761 don't convert non-dates
            end: { x: xBrushScale(new Date(selectedRange.end)) },
          }
        : undefined,
    [selectedRange, xBrushScale]
  );

  // `brushKey` makes/fakes the brush as a controlled component,
  const brushKey = 'not_fake_controlled';
  //    selectedRange != null
  //      ? selectedRange.start + ':' + selectedRange.end
  //      : 'no_brush';

  return (
    <div
      style={{
        // centering time filter
        textAlign: 'center',
        pointerEvents: disabled ? 'none' : 'all',
      }}
    >
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* use Bar chart */}
          {data.map((d, i) => {
            const barHeight = yBrushMax - yBrushScale(getYData(d));
            const x = xBrushScale(getXData(d));
            // calculate the width using the next bin's date:
            // subtract a constant to create separate bars for each bin
            const barWidth =
              i + 1 >= data.length
                ? 0 // #761 this assumes the final bin is zero width (see `concat` in TimeSliderQuickFilter)
                : xBrushScale(getXData(data[i + 1])) - x - 1;
            return (
              <React.Fragment key={i}>
                <Bar
                  key={`bar-${i.toString()}`}
                  x={x}
                  // In SVG bar chart, y-coordinate increases downward, i.e.,
                  // y-coordinates of the top and bottom of the bars are 0 and yBrushMax, respectively
                  // Also, under current yBrushScale, dataY = 0 -> barHeight = 0; dataY = 1 -> barHeight = 60
                  // Thus, to mimick the bar shape of the ez time filter mockup,
                  // starting y-coordinate for dataY = 1 sets to be 1/4*yBrushMax.
                  // And, the height prop is set to be 1/2*yBrushMax so that
                  // the bottom side of a bar has 1/4*yBrushMax space with respect to the x-axis line
                  y={barHeight === 0 ? yBrushMax : (1 / 4) * yBrushMax}
                  height={(1 / 2) * barHeight}
                  // set the last data's barWidth to be 0 so that it does not overflow to dragging area
                  width={barWidth}
                  fill={barColor}
                />
              </React.Fragment>
            );
          })}
          <AxisBottom
            top={yBrushMax}
            scale={xBrushScale}
            numTicks={width > 520 ? 10 : 5}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={axisBottomTickLabelProps}
          />
          <Brush
            key={brushKey}
            xScale={xBrushScale}
            yScale={yBrushScale}
            width={xBrushMax}
            height={yBrushMax}
            handleSize={8}
            margin={margin /* prevents brushing offset */}
            resizeTriggerAreas={resizeTriggerAreas}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={disabled ? () => {} : () => setSelectedRange(undefined)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
            disableDraggingSelection={disabled}
            renderBrushHandle={(props) => <BrushHandle {...props} />}
          />
        </Group>
      </svg>
    </div>
  );
}

// define brush handle shape and position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill="#f2f2f2"
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: 'ew-resize' }}
      />
    </Group>
  );
}

export default TimeSlider;
