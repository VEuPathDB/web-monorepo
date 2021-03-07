/**
 * WARNING: This is quite the beast. Lots of stuff with Typescript generics.
 * This allows us to use a single custom hook for different types of
 * plots, but can be quite the brain trip to read through.
 */
import { Reducer, useReducer } from 'react';

import { isHistogramData, isPiePlotData } from '../types/guards';
import {
  UnionOfPlotDataTypes,
  BarLayoutOptions,
  OrientationOptions,
} from '../types/plots';
import { NumericRange } from '../types/general';

/** Action definitions for the reducer function inside of the hook. */
type ActionType<DataShape> =
  | { type: 'setData'; payload: DataShape }
  | { type: 'setBarLayout'; payload: BarLayoutOptions }
  | { type: 'errors/add'; payload: Error }
  | { type: 'errors/remove'; payload: Error }
  | { type: 'errors/clear' }
  | { type: 'histogram/setBinWidth'; payload: number }
  | { type: 'histogram/setBinWidthRange'; payload: [number, number] }
  | { type: 'histogram/setBinWidthStep'; payload: number }
  | { type: 'setSelectedUnit'; payload: string }
  | { type: 'setOpacity'; payload: number }
  | { type: 'resetOpacity' }
  | { type: 'toggleOrientation' }
  | { type: 'toggleDisplayLegend' }
  | { type: 'toggleLibraryControls' }
  | { type: 'histogram/setSelectedRange'; payload: NumericRange };

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
    case 'histogram/setBinWidthRange':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          binWidthRange: action.payload,
        },
      };
    case 'histogram/setBinWidthStep':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          binWidthStep: action.payload,
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
    case 'toggleLibraryControls': {
      return {
        ...state,
        displayLibraryControls:
          state.displayLibraryControls === true ? false : true,
      };
    }
    case 'toggleOrientation':
      return {
        ...state,
        orientation:
          state.orientation === 'vertical' ? 'horizontal' : 'vertical',
      };
    case 'histogram/setSelectedRange':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          selectedRange: action.payload,
        },
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
  /** Whether or not to display the additionally controls that
   * may be provided by the charting library used to generate the plot.
   * For example, Plot.ly controls.*/
  displayLibraryControls: boolean;
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
  availableUnits?: Array<string>;
  /** The unit currently selected out of the available units. */
  selectedUnit?: string;
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
    selectedRange?: NumericRange;
    //    selectedRangeBounds: NumericRange,
  };
};

/** Parameters that can be passed to the hook for initialization. */
export type usePlotControlsParams<DataShape extends UnionOfPlotDataTypes> = {
  data: DataShape;
  onSelectedUnitChange?: (params: {
    selectedUnit: string;
  }) => Promise<DataShape>;
  histogram?: {
    /** Optional override for binWidthRange that is provided by
     * data backend or calculated. */
    binWidthRange?: [number, number];
    /** Optional override for binWidthStep that is provided by
     * data backend or calculated. */
    binWidthStep?: number;
    onBinWidthChange: (params: {
      binWidth: number;
      selectedUnit?: string;
    }) => Promise<DataShape>;
    selectedRange?: NumericRange;
    onSelectedRangeChange?: (newRange: NumericRange) => void;
  };
};

/**
 * Custom hook to manage and share state between controls and plot components.
 */
export default function usePlotControls<DataShape extends UnionOfPlotDataTypes>(
  params: usePlotControlsParams<DataShape>
) {
  /**
   * Set the initial state managed by the userReducer hook below.
   * Note that some data attributes for specific plot types are
   * initialized here with dummy values. I believe I could get
   * around this with some fancy typescript, but it doesn't seem
   * the added complexity would be worth it.
   */
  const initialState: PlotSharedState<DataShape> = {
    data: params.data,
    errors: [],
    displayLegend: true,
    displayLibraryControls: false,
    opacity: 1,
    orientation: 'vertical',
    barLayout: 'overlay',
    histogram: {
      binWidth: 0,
      binWidthRange: [0, 0],
      binWidthStep: 0,
      selectedRange: { min: 0, max: 0 },
    },
  };

  // Determine if `data` contains information about available/selected units.
  if (isPiePlotData(params.data) || isHistogramData(params.data)) {
    initialState.availableUnits = params.data.availableUnits ?? [];
    initialState.selectedUnit = params.data.selectedUnit ?? '';
  }

  // Additional intialization if data is for a histogram.
  if (isHistogramData(params.data)) {
    /**
     * Build the histogram specific state.
     * */

    let binWidthRange: [number, number];
    if (params.histogram?.binWidthRange) {
      // Case 1: Override is provided by client.
      binWidthRange = [
        params.histogram.binWidthRange[0],
        params.histogram.binWidthRange[1],
      ];
    } else if (params.data.binWidthRange) {
      // Case 2: binWidthRange is specified in `data`

      binWidthRange = [
        params.data.binWidthRange[0],
        params.data.binWidthRange[1],
      ];
    } else {
      // Case 3: Create some reasonable defaults if not provided by client or data.

      let lowBinValue = 0;
      let highBinValue = 0;

      params.data.series.forEach((series) => {
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
      binWidthRange = [rawBinWidthRange / 10, rawBinWidthRange / 2];
    }

    const binWidth = params.data.binWidth ?? binWidthRange[1] / 10;
    const binWidthStep = params.histogram?.binWidthStep
      ? params.histogram.binWidthStep
      : params.data.binWidthStep ?? (binWidthRange[1] - binWidthRange[0]) / 10;

    initialState.histogram = {
      binWidth,
      binWidthRange,
      binWidthStep,
    };

    if (params.histogram?.selectedRange)
      initialState.histogram.selectedRange = params.histogram.selectedRange;
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

  // Toggle Library Specific Controls
  const toggleLibraryControls = () =>
    dispatch({ type: 'toggleLibraryControls' });

  /**
   * Prepare various functions that will be exported from this custom
   * hook that will allow the client to update the state of the
   * nested reducer and/or make async function calls to change
   * data via API requests.
   */
  const onSelectedUnitChange = async (unit: string) => {
    if (params.onSelectedUnitChange) {
      try {
        const newData = await params.onSelectedUnitChange({
          selectedUnit: unit,
        });
        dispatch({ type: 'setData', payload: newData });

        // Additional actions to take if incoming data is for a histogram.
        /**
         * TODO: The ability to change units was decided NOT to be a MVP feature.
         * So, the support here is incomplete. In a future pull request, I will
         * add the ability to generate binWidthRange / binWidthStep from data
         * if not explicitly provided.
         */
        if (isHistogramData(newData)) {
          if (
            newData.binWidth &&
            newData.binWidthRange &&
            newData.binWidthStep
          ) {
            dispatch({
              type: 'histogram/setBinWidthRange',
              payload: newData.binWidthRange,
            });
            dispatch({
              type: 'histogram/setBinWidth',
              payload: newData.binWidth,
            });
            dispatch({
              type: 'histogram/setBinWidthStep',
              payload: newData.binWidthStep,
            });
          } else {
            throw new Error(
              'usePlotControls does not yet support switch units on histogram plots without binWidth/binWidthRange/binWidthStep being specified by backend.'
            );
          }
        }
      } catch (error) {
        dispatch({ type: 'errors/add', payload: error });
      } finally {
        dispatch({ type: 'setSelectedUnit', payload: unit });
      }
    }
  };

  const onBinWidthChange = async (binWidth: number) => {
    if (params.histogram) {
      try {
        const newData = await params.histogram.onBinWidthChange({
          binWidth,
          selectedUnit: reducerState.selectedUnit,
        });
        dispatch({ type: 'setData', payload: newData });
      } catch (error) {
        dispatch({ type: 'errors/add', payload: error });
      } finally {
        dispatch({ type: 'histogram/setBinWidth', payload: binWidth });
      }
    }
  };

  const onSelectedRangeChange = (newRange: NumericRange) => {
    if (params.histogram) {
      //      if (params.histogram.onSelectedRangeChange) params.histogram.onSelectedRangeChange(newRange);
      dispatch({ type: 'histogram/setSelectedRange', payload: newRange });
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
    histogram: {
      ...reducerState.histogram,
      onBinWidthChange,
      onSelectedRangeChange,
    },
    resetOpacity,
    onBarLayoutChange,
    onSelectedUnitChange,
    onOpacityChange,
    toggleDisplayLegend,
    toggleOrientation,
    toggleLibraryControls,
  };
}
