/**
 * WARNING: This is quite the beast. Lots of stuff with Typescript generics.
 * This allows us to use a single custom hook for different types of
 * plots, but can be quite the brain trip to read through.
 */
import { Reducer, useReducer } from 'react';

import { isHistogram } from '../types/guards';
import {
  UnionOfPlotDataTypes,
  BarLayoutOptions,
  OrientationOptions,
} from '../types/plots';

/** Action definitions for the reducer function inside of the hook. */
type ActionType<DataShape> =
  | { type: 'setData'; payload: DataShape }
  | { type: 'setBarLayout'; payload: BarLayoutOptions }
  | { type: 'histogram/setBinWidth'; payload: number }
  | { type: 'setSelectedUnit'; payload: string }
  | { type: 'setOpacity'; payload: number }
  | { type: 'resetOpacity' }
  | { type: 'toggleOrientation' };

/** Reducer that is used inside the hook. */
function reducer<DataShape extends UnionOfPlotDataTypes>(
  state: PlotSharedState<DataShape>,
  action: ActionType<DataShape>
): PlotSharedState<DataShape> {
  // console.log(action);
  switch (action.type) {
    case 'setData':
      return { ...state, data: action.payload };
    case 'setBarLayout':
      return { ...state, barLayout: action.payload };
    case 'histogram/setBinWidth':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          binWidth:
            action.payload > 0 ? action.payload : state.histogram.binWidth,
        },
      };
    case 'setOpacity':
      return { ...state, opacity: action.payload };
    case 'resetOpacity':
      return { ...state, opacity: 1 };
    case 'setSelectedUnit':
      return { ...state, selectedUnit: action.payload };
    case 'toggleOrientation':
      return {
        ...state,
        orientation:
          state.orientation === 'vertical' ? 'horizontal' : 'vertical',
      };
    default:
      throw new Error();
  }
}

/**
 * Type definition for the data managed by the custom hook.
 *
 * Generally speaking, common attributes exist at the top
 * level. If there are a set of attributes that belong only
 * to a specific plot type this are grouped together under
 * the plot name. For example, see `histogram` here.
 *
 * FUTURE MAINTAINERS: Make sure to include the data type
 * definitions for new plot components in UnionOfPlotDataTypes
 * in order to be able to this hook with them.
 * */
type PlotSharedState<DataShape extends UnionOfPlotDataTypes> = {
  /** The data of the plot. */
  data: DataShape;
  /** The opacity of the plot. A number between 0 and 1. */
  opacity: number;
  /** The orientation of the plot. Defaults to 'vertical'. */
  orientation: OrientationOptions;
  /** Layout options for bar charts. Defaults to 'overlay'. */
  barLayout: BarLayoutOptions;
  /** Different units that can be selected that will cause
   * backend data recalculation. For example, for a series
   * of chronological data: years, months, days.
   */
  availableUnits: Array<string>;
  /** The unit currently selected out of the available units. */
  selectedUnit: string;
  histogram: {
    /** Histogram: The width of bins. */
    binWidth: number;
    /** Histogram: Range of bin width values. */
    binWidthRange: [number, number];
    /** Increment for increasing/decrease bin width. */
    binWidthStep: number;
  };
};

/** Parameters that can be passed to the hook for initialization. */
type usePlotControlsParams<DataShape extends UnionOfPlotDataTypes> = {
  data: DataShape;
  availableUnits?: Array<string>;
  initialSelectedUnit?: string;
  onSelectedUnitChange?: (unit: string) => Promise<DataShape>;
  histogram?: {
    initialBinWidth?: number;
    binWidthRange?: [number, number];
    binWidthStep?: number;
    onBinWidthChange: (width: number) => Promise<DataShape>;
  };
};

/**
 * Custom hook to manage and share state between controls and plot components.
 */
export default function usePlotControls<DataShape extends UnionOfPlotDataTypes>(
  params: usePlotControlsParams<DataShape>
) {
  // Set the initial state managed by the userReducer hook below.
  const initialState: PlotSharedState<DataShape> = {
    data: params.data,
    opacity: 1,
    orientation: 'vertical',
    barLayout: 'overlay',
    availableUnits: params.availableUnits ?? [],
    selectedUnit: params.initialSelectedUnit ?? '',
    histogram: {
      binWidth: 0,
      binWidthRange: [0, 0],
      binWidthStep: 0,
    },
  };

  // Additional intialization if data is for a histogram.
  if (isHistogram(params.data)) {
    // Determine binWidthRange
    if (params.histogram?.binWidthRange) {
      initialState.histogram.binWidthRange = [
        params.histogram.binWidthRange[0],
        params.histogram.binWidthRange[1],
      ];
    } else {
      // Create some reasonable defaults if not provided by client.
      let lowBinValue = 0;
      let highBinValue = 0;

      params.data.forEach((series) => {
        series.bins.forEach((bin) => {
          if (typeof bin.binStart === 'string') {
            console.error('String Bin Start Values are not yet supported.');
          } else if (bin.binStart < lowBinValue) {
            lowBinValue = bin.binStart;
          } else if (bin.binStart > highBinValue) {
            highBinValue = bin.binStart;
          }
        });
      });

      const rawBinWidthRange = highBinValue - lowBinValue;
      initialState.histogram.binWidthRange = [
        rawBinWidthRange / 10,
        rawBinWidthRange / 2,
      ];
    }

    // Calculate initial binWidth
    initialState.histogram.binWidth = params.histogram?.initialBinWidth
      ? params.histogram.initialBinWidth
      : initialState.histogram.binWidthRange[1] / 10;

    // Calculate initial binWidthStep
    initialState.histogram.binWidthStep = params.histogram?.binWidthStep
      ? params.histogram.binWidthStep
      : 1;
  }

  const [
    { data, barLayout, histogram, opacity, orientation, selectedUnit },
    dispatch,
  ] = useReducer<Reducer<PlotSharedState<DataShape>, ActionType<DataShape>>>(
    reducer,
    initialState
  );

  /**
   * Prepare various functions that will be exported from this custom
   * hook that will allow the client to update the state of the
   * nested reducer and/or make async function calls to change
   * data via API requests.
   */

  // Update Bin Width w/ potential async call.
  const setBinWidth = async (binWidth: number) => {
    if (params.histogram) {
      const newData = await params.histogram.onBinWidthChange(binWidth);
      dispatch({ type: 'setData', payload: newData });
    }

    dispatch({ type: 'histogram/setBinWidth', payload: binWidth });
  };

  // Update Bar Layout
  const setBarLayout = (layout: BarLayoutOptions) =>
    dispatch({ type: 'setBarLayout', payload: layout });

  // Update Selected Unit w/ potential async call.
  const setSelectedUnit = async (unit: string) => {
    params.onSelectedUnitChange && (await params.onSelectedUnitChange(unit));
    dispatch({ type: 'setSelectedUnit', payload: unit });
  };

  // Update and Reset Opacity
  const setOpacity = (opacity: number) =>
    dispatch({ type: 'setOpacity', payload: opacity });
  const resetOpacity = () => dispatch({ type: 'resetOpacity' });

  // Toggle Plot Orientation
  const toggleOrientation = () => dispatch({ type: 'toggleOrientation' });

  return {
    data,
    availableUnits: params.availableUnits,
    histogram: { ...histogram, setBinWidth },
    barLayout,
    setBarLayout,
    selectedUnit,
    setSelectedUnit,
    opacity,
    setOpacity,
    resetOpacity,
    orientation,
    toggleOrientation,
  };
}
