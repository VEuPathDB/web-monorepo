/**
 * WARNING: This is quite the beast. Lots of stuff with Typescript generics.
 * This allows us to use a single custom hook for different types of
 * plots, but can be quite the brain trip to read through.
 */
import { Reducer, useReducer } from 'react';

import { isHistogramData } from '../types/guards';
import {
  UnionOfPlotDataTypes,
  BarLayoutOptions,
  OrientationOptions,
} from '../types/plots';

/** Action definitions for the reducer function inside of the hook. */
type ActionType<DataShape> =
  | { type: 'setData'; payload: DataShape }
  | { type: 'setBarLayout'; payload: BarLayoutOptions }
  | { type: 'errors/add'; payload: Error }
  | { type: 'errors/remove'; payload: Error }
  | { type: 'errors/clear' }
  | { type: 'histogram/setBinWidth'; payload: number }
  | { type: 'setSelectedUnit'; payload: string }
  | { type: 'setOpacity'; payload: number }
  | { type: 'resetOpacity' }
  | { type: 'toggleOrientation' }
  | { type: 'toggleDisplayLegend' };

/** Reducer that is used inside the hook. */
function reducer<DataShape extends UnionOfPlotDataTypes>(
  state: PlotSharedState<DataShape>,
  action: ActionType<DataShape>
): PlotSharedState<DataShape> {
  switch (action.type) {
    case 'errors/add': {
      return { ...state, errors: [...state.errors, action.payload] };
    }
    case 'errors/remove':
      return {
        ...state,
        errors: state.errors.filter(
          (error) => error.message !== action.payload.message
        ),
      };
    case 'errors/clear': {
      return { ...state, errors: [] };
    }
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
    case 'toggleDisplayLegend': {
      return {
        ...state,
        displayLegend: state.displayLegend === true ? false : true,
      };
    }
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
  /** Whether or not to display the plot legend. Defaults to true. */
  displayLegend: boolean;
  /** The opacity of the plot. A number between 0 and 1. */
  opacity: number;
  /** The orientation of the plot. Defaults to 'vertical'. */
  orientation: OrientationOptions;
  /** Layout options for bar charts. Defaults to 'overlay'. */
  barLayout: BarLayoutOptions;
  /** Different units that can be selected. Will cause
   * backend data recalculation. For example, for a series
   * of chronological data: years, months, days.
   */
  availableUnits: Array<string>;
  /** The unit currently selected out of the available units. */
  selectedUnit: string;
  /** Storage for errors that we may want to display to the user. */
  errors: Array<Error>;
  /** Histogram specific attributes. */
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
export type usePlotControlsParams<DataShape extends UnionOfPlotDataTypes> = {
  data: DataShape;
  availableUnits?: Array<string>;
  initialSelectedUnit?: string;
  onSelectedUnitChange?: (
    selectedUnit: string,
    binWidth: number
  ) => Promise<DataShape>;
  histogram?: {
    initialBinWidth?: number;
    binWidthRange?: [number, number];
    binWidthStep?: number;
    onBinWidthChange: (
      binWidth: number,
      selectedUnit: string
    ) => Promise<DataShape>;
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
    errors: [],
    displayLegend: true,
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
  if (isHistogramData(params.data)) {
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

  const [reducerState, dispatch] = useReducer<
    Reducer<PlotSharedState<DataShape>, ActionType<DataShape>>
  >(reducer, initialState);

  /**
   * Convenience Methods for Synchronous Actions
   * */
  const onBarLayoutChange = (layout: BarLayoutOptions) =>
    dispatch({ type: 'setBarLayout', payload: layout });
  // Update and Reset Opacity
  const onOpacityChange = (opacity: number) =>
    dispatch({ type: 'setOpacity', payload: opacity });
  const resetOpacity = () => dispatch({ type: 'resetOpacity' });

  // Toggle Plot Orientation
  const toggleOrientation = () => dispatch({ type: 'toggleOrientation' });

  // Toggle Legend
  const toggleDisplayLegend = () => dispatch({ type: 'toggleDisplayLegend' });

  /**
   * Prepare various functions that will be exported from this custom
   * hook that will allow the client to update the state of the
   * nested reducer and/or make async function calls to change
   * data via API requests.
   */
  const onBinWidthChange = async (binWidth: number) => {
    if (params.histogram) {
      try {
        const newData = await params.histogram.onBinWidthChange(
          binWidth,
          reducerState.selectedUnit
        );
        dispatch({ type: 'setData', payload: newData });
      } catch (error) {
        dispatch({ type: 'errors/add', payload: error });
      } finally {
        dispatch({ type: 'histogram/setBinWidth', payload: binWidth });
      }
    }
  };

  const onSelectedUnitChange = async (unit: string) => {
    if (params.onSelectedUnitChange) {
      try {
        const newData = await params.onSelectedUnitChange(
          unit,
          reducerState.histogram.binWidth
        );
        dispatch({ type: 'setData', payload: newData });
      } catch (error) {
        dispatch({ type: 'errors/add', payload: error });
      } finally {
        dispatch({ type: 'setSelectedUnit', payload: unit });
      }
    }
  };

  /**
   * Separate errors attribute from the rest of the reducer state.
   * This is so we can control the shape of the object returned
   * from this hook in a way that minimizes cognitive load
   * for users of the hook.
   *
   * Complexity here, simplicity there.
   */
  const { errors, ...rest } = reducerState;

  return {
    ...rest,
    errorManagement: {
      errors: errors,
      addError: (error: Error) =>
        dispatch({ type: 'errors/add', payload: error }),
      removeError: (error: Error) =>
        dispatch({ type: 'errors/remove', payload: error }),
      clearAllErrors: () => dispatch({ type: 'errors/clear' }),
    },
    availableUnits: params.availableUnits,
    histogram: { ...reducerState.histogram, onBinWidthChange },
    resetOpacity,
    onBarLayoutChange,
    onSelectedUnitChange,
    onOpacityChange,
    toggleDisplayLegend,
    toggleOrientation,
  };
}
