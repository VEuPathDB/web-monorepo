/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef,
  ForwardedRef,
} from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import appleStock, { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush, {
  BaseBrushState,
  UpdateBrush,
} from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { Group } from '@visx/group';
import { max, extent } from 'd3-array';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { AreaClosed } from '@visx/shape';
import { AxisBottom } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { millisecondTodate } from '../../utils/date-format-change';

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
  /** line color of the selected range */
  accentColor?: string;
  /** axis tick and tick label color */
  axisColor?: string;
};

// using forwardRef
function EzTimeFilter(
  props: EzTimeFilterProps,
  ref: ForwardedRef<{ handleResetClick: () => void }>
) {
  const {
    data,
    // set default width and height
    width = 720,
    height = 125,
    accentColor = '#4A6BD6',
    axisColor = '#000',
    selectedRange,
    setSelectedRange,
  } = props;

  const brushRef = useRef<BaseBrush | null>(null);

  // define default values
  const margin = { top: 10, bottom: 10, left: 10, right: 10 };
  const PATTERN_ID = 'brush_pattern';
  const selectedBrushStyle = {
    fill: `url(#${PATTERN_ID})`,
    stroke: accentColor,
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

  // reset brush position to be initial one
  const handleResetClick = () => {
    if (brushRef?.current) {
      const updater: UpdateBrush = (prevBrush) => {
        const newExtent = brushRef.current!.getExtent(
          initialBrushPosition.start,
          initialBrushPosition.end
        );

        const newState: BaseBrushState = {
          ...prevBrush,
          start: { y: newExtent.y0, x: newExtent.x0 },
          end: { y: newExtent.y1, x: newExtent.x1 },
          extent: newExtent,
        };

        return newState;
      };

      brushRef.current.updateBrush(updater);
    }
  };

  // forwardRef: handleResetClick function to be used at the parent component
  useImperativeHandle(
    ref,
    () => ({
      handleResetClick,
    }),
    []
  );

  return (
    <div
      style={{
        // centering time filter
        textAlign: 'center',
      }}
    >
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <AreaClosed
            data={data}
            x={(d) => xBrushScale(getXData(d)) || 0}
            y={(d) => yBrushScale(getYData(d)) || 0}
            yScale={yBrushScale}
            strokeWidth={1}
            fill="lightgray"
            curve={curveMonotoneX}
          />
          <AxisBottom
            top={yBrushMax}
            scale={xBrushScale}
            numTicks={width > 520 ? 10 : 5}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={axisBottomTickLabelProps}
          />
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={xBrushScale}
            yScale={yBrushScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={margin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={handleResetClick}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
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

// forwardRef
export default forwardRef(EzTimeFilter);
