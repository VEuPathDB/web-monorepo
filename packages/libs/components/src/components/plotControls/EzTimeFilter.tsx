/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useRef, useEffect, useMemo } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
// add ResizeTriggerAreas type
import { Bounds, ResizeTriggerAreas } from '@visx/brush/lib/types';
import BaseBrush, {
  BaseBrushState,
  UpdateBrush,
} from '@visx/brush/lib/BaseBrush';
import { Group } from '@visx/group';
import { max, extent } from 'd3-array';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { AxisBottom } from '@visx/axis';
import { millisecondTodate } from '../../utils/date-format-change';
import { Bar } from '@visx/shape';
import { debounce } from 'lodash';

export type EZTimeFilterDataProp = {
  x: string;
  y: number;
};

export type EzTimeFilterProps = {
  /** Ez time filter data  */
  data: EZTimeFilterDataProp[];
  /** current state of selectedRange */
  selectedRange: { start: string; end: string };
  /** update function selectedRange */
  setSelectedRange: (selectedRange: EzTimeFilterProps['selectedRange']) => void;
  /** width */
  width?: number;
  /** height */
  height?: number;
  /** color of the selected range */
  brushColor?: string;
  /** axis tick and tick label color */
  axisColor?: string;
  /** opacity of selected brush */
  brushOpacity?: number;
  /** whether movement of Brush should be disabled */
  disableDraggingSelection?: boolean;
  /** disable brush selection */
  resizeTriggerAreas?: ResizeTriggerAreas[];
  /** debounce rate in millisecond */
  debounceRateMs?: number;
};

// using forwardRef
function EzTimeFilter(props: EzTimeFilterProps) {
  const {
    data,
    // set default width and height
    width = 720,
    height = 125,
    brushColor = 'lightblue',
    axisColor = '#000',
    brushOpacity = 0.4,
    selectedRange,
    setSelectedRange,
    disableDraggingSelection = false,
    resizeTriggerAreas = ['left', 'right'],
    // set a default debounce time in milliseconds
    debounceRateMs = 500,
  } = props;

  const brushRef = useRef<BaseBrush | null>(null);

  // define default values
  const margin = { top: 10, bottom: 10, left: 10, right: 10 };
  const selectedBrushStyle = {
    fill: brushColor,
    stroke: brushColor,
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
  const getXData = (d: EZTimeFilterDataProp) => new Date(d.x);
  const getYData = (d: EZTimeFilterDataProp) => d.y;

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;

    const { x0, x1 } = domain;

    const selectedDomain = {
      // x0 and x1 are millisecond value
      start: millisecondTodate(x0),
      end: millisecondTodate(x1),
    };

    setSelectedRange(selectedDomain);
  };

  // bounds
  const xBrushMax = Math.max(width - margin.left - margin.right, 0);
  // take 80 % of given height considering axis tick/tick labels at the bottom
  const yBrushMax = Math.max(0.8 * height - margin.top - margin.bottom, 0);

  // scaling
  const xBrushScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain:
          data != null ? (extent(data, getXData) as [Date, Date]) : undefined,
      }),
    [data, xBrushMax]
  );

  const yBrushScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(data, getYData) || 0],
        nice: true,
      }),
    [data, yBrushMax]
  );

  // initial selectedRange position
  const initialBrushPosition = useMemo(
    () => ({
      start: { x: xBrushScale(getXData(data[0])) },
      end: { x: xBrushScale(getXData(data[data.length - 1])) },
    }),
    [data, xBrushScale]
  );

  // compute bar width manually as scaleTime is used for Bar chart
  const barWidth = xBrushMax / data.length;

  // after dragging ends
  const onBrushEnd = () => {
    //TO-DO a sort of submitting action for a filtered range later is required here
    console.log('brush dragging ends!!!');
  };

  // debounce function for onBrushEnd: will be used for submitting filtered range later
  const debouncedOnBrushEnd = useMemo(
    () => debounce(onBrushEnd, debounceRateMs),
    [onBrushEnd]
  );

  const defaultColor = '#333';

  // Cancel pending onBrushEnd request when this component is unmounted
  useEffect(() => {
    return () => {
      debouncedOnBrushEnd.cancel();
    };
  }, []);

  return (
    <div
      style={{
        // centering time filter
        textAlign: 'center',
      }}
    >
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* use Bar chart */}
          {data.map((d, i) => {
            const barHeight = yBrushMax - yBrushScale(getYData(d));
            return (
              <React.Fragment key={i}>
                <Bar
                  key={`bar-${i.toString()}`}
                  x={xBrushScale(getXData(d))}
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
                  width={i === data.length - 1 ? 0 : barWidth}
                  fill={defaultColor}
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
            xScale={xBrushScale}
            yScale={yBrushScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={margin}
            handleSize={8}
            innerRef={brushRef}
            // resize
            resizeTriggerAreas={resizeTriggerAreas}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
            disableDraggingSelection={disableDraggingSelection}
            onBrushEnd={debouncedOnBrushEnd}
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

export default EzTimeFilter;
