/**
 * WARNING: This is quite the beast. Lots of stuff with Typescript generics.
 * This allows us to use a single custom hook for different types of
 * plots, but can be quite the brain trip to read through.
 */
import { Reducer, useMemo, useReducer } from 'react';
import debounce from 'debounce-promise';

import { isHistogramData, isPiePlotData, isDate } from '../types/guards';
import {
  UnionOfPlotDataTypes,
  BarLayoutOptions,
  OrientationOptions,
} from '../types/plots';
import {
  NumberOrDate,
  NumberOrDateRange,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
  NumberRange,
} from '../types/general';
import * as DateMath from 'date-arithmetic';
import { orderBy } from 'lodash';

/** Action definitions for the reducer function inside of the hook. */
type ActionType<DataShape> =
  | { type: 'setData'; payload: DataShape }
  | { type: 'setBarLayout'; payload: BarLayoutOptions }
  | { type: 'errors/add'; payload: Error }
  | { type: 'errors/remove'; payload: Error }
  | { type: 'errors/clear' }
  | { type: 'histogram/setBinWidth'; payload: NumberOrTimeDelta }
  | { type: 'histogram/setBinWidthRange'; payload: NumberOrTimeDeltaRange }
  | { type: 'histogram/setBinWidthStep'; payload: number }
  | { type: 'setSelectedUnit'; payload: string }
  | { type: 'setOpacity'; payload: number }
  | { type: 'resetOpacity' }
  | { type: 'toggleOrientation' }
  | { type: 'toggleDisplayLegend' }
  | { type: 'toggleLibraryControls' }
  | { type: 'histogram/setSelectedRange'; payload?: NumberOrDateRange }
  // add y-axis/dependent axis controls
  | { type: 'histogram/toggleDependentAxisLogScale' }
  | {
      type: 'histogram/onDependentAxisRangeChange';
      payload?: NumberRange;
    }
  | { type: 'histogram/onDependentAxisModeChange' }
  | { type: 'histogram/onDependentAxisRangeReset' }
  // add x-axis/independent axis controls: axis range and range reset
  | {
      type: 'histogram/onIndependentAxisRangeChange';
      payload?: NumberOrDateRange;
    }
  | { type: 'histogram/onIndependentAxisRangeReset' }
  // add reset all
  | { type: 'onResetAll' }
  // add valueSpec for ScatterPlotControls
  | { type: 'ScatterPlot/onValueSpecChange'; payload: string };

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
          binWidth: action.payload, //  > 0 ? action.payload : state.histogram.binWidth,
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
    // add y-axis controls
    case 'histogram/toggleDependentAxisLogScale':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          dependentAxisLogScale:
            state?.histogram?.dependentAxisLogScale === true ? false : true,
        },
      };
    case 'histogram/onDependentAxisRangeChange':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          dependentAxisRange: action.payload,
        },
      };
    case 'histogram/onDependentAxisModeChange':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          dependentAxisMode:
            state?.histogram?.dependentAxisMode === 'absolute'
              ? 'relative'
              : 'absolute',
        },
      };
    // add x-axis/independent axis controls: axis range and range reset
    case 'histogram/onIndependentAxisRangeChange':
      return {
        ...state,
        histogram: {
          ...state.histogram,
          independentAxisRange: action.payload,
        },
      };
    case 'histogram/onDependentAxisRangeReset':
      return {
        ...state,
        histogram: {
          ...state.histogram,
        },
      };
    case 'histogram/onIndependentAxisRangeReset':
      return {
        ...state,
        histogram: {
          ...state.histogram,
        },
      };
    // add reset all: nothing here but perhaps it would eventually be a function to set all params to default
    case 'onResetAll':
      return { ...state };
    // add valueSpec for ScatterPlotControls
    case 'ScatterPlot/onValueSpecChange':
      return {
        ...state,
        ScatterPlot: {
          ...state.ScatterPlot,
          valueSpec: action.payload,
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
  /** reset all to default. Type may be an array of object? */
  onResetAll?: () => void;
  /** Histogram specific attributes. */
  histogram: {
    /** Histogram: The width of bins. */
    binWidth: NumberOrTimeDelta;
    /** Histogram: Range of bin width values. */
    binWidthRange: NumberOrTimeDeltaRange;
    /** Increment for increasing/decrease bin width. */
    binWidthStep: number;
    /** The currently selected range along the x-axis */
    selectedRange?: NumberOrDateRange;
    /** The min/max allowed values for the range controls */
    selectedRangeBounds?: NumberOrDateRange;
    /** A switch to show/hide the range controls  */
    displaySelectedRangeControls: boolean;
    /** Type of x-variable 'number' or 'date' */
    valueType?: 'number' | 'date';
    // add y-axis controls
    /** Histogram: Type of y-axis log scale */
    dependentAxisLogScale?: boolean;
    /** Histogram: Range of y-axis min/max values */
    dependentAxisRange?: NumberRange;
    /** Histogram: Toggle absolute and relative.*/
    dependentAxisMode?: 'absolute' | 'relative';
    /** Histogram: dependent axis range reset */
    onDependentAxisSettingsReset?: () => void;
    /** Histogram: Range of x-axis min/max values */
    independentAxisRange?: NumberOrDateRange;
    /** Histogram: independent axis range reset */
    onIndependentAxisRangeReset?: () => void;
  };
  // valueSpecChange for ScatterPlotControls
  ScatterPlot?: {
    /** ScatterPlot: valueSpec */
    valueSpec?: string;
    /** ScatterPlot: valueSpec */
    onValueSpecChange?: () => void;
  };
};

/** Parameters that can be passed to the hook for initialization. */
export type usePlotControlsParams<DataShape extends UnionOfPlotDataTypes> = {
  data: DataShape;
  onSelectedUnitChange?: (newUnit: string) => Promise<DataShape>;
  histogram?: {
    /** Optional override for binWidthRange that is provided by
     * data backend or calculated. */
    binWidthRange?: NumberOrTimeDeltaRange;
    /** Optional override for binWidthStep that is provided by
     * data backend or calculated. */
    binWidthStep?: number;
    onBinWidthChange: (binWidth: NumberOrTimeDelta) => Promise<DataShape>;
    selectedRange?: NumberOrDateRange;
    /** A switch to show/hide the range controls  */
    displaySelectedRangeControls?: boolean;
    /** Type of x-variable 'number' or 'date' */
    valueType?: 'number' | 'date';
    // add y-axis controls
    dependentAxisLogScale?: boolean;
    dependentAxisRange?: NumberOrDateRange;
    dependentAxisMode?: 'absolute' | 'relative';
    // add x-axis range
    independentAxisRange?: NumberOrDateRange;
  };
  // valueSpec for ScatterPlotControls
  ScatterPlot?: {
    valueSpec?: string;
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
      binWidthRange: { min: 0, max: 0 },
      binWidthStep: 0,
      displaySelectedRangeControls: false,
      // add y-axis controls
      dependentAxisLogScale: false,
      dependentAxisMode: 'absolute',
    },
    ScatterPlot: {
      valueSpec: 'Raw',
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

    let binWidthRange: NumberOrTimeDeltaRange;
    if (params.histogram?.binWidthRange) {
      // Case 1: Override is provided by client.
      binWidthRange = params.histogram.binWidthRange;
    } else if (params.data.binWidthSlider?.binWidthRange) {
      // Case 2: binWidthRange is specified in `data`
      binWidthRange = params.data.binWidthSlider.binWidthRange;
    } else {
      // Case 3: Create some reasonable defaults if not provided by client or data.

      let lowBinValue: NumberOrDate | null = null;
      let highBinValue: NumberOrDate | null = null;

      params.data.series.forEach((series) => {
        series.bins.forEach((bin) => {
          if (lowBinValue === null || bin.binStart < lowBinValue) {
            lowBinValue = bin.binStart;
          } else if (highBinValue === null || bin.binEnd > highBinValue) {
            highBinValue = bin.binEnd;
          }
        });
      });
      if (typeof highBinValue === 'number' && typeof lowBinValue === 'number') {
        const rawBinWidthRange = highBinValue - lowBinValue;
        binWidthRange = {
          min: rawBinWidthRange / 10,
          max: rawBinWidthRange / 2,
        };
      } else if (
        highBinValue &&
        isDate(highBinValue) &&
        lowBinValue &&
        isDate(lowBinValue)
      ) {
        const rawBinWidthRange = DateMath.diff(
          new Date(highBinValue),
          new Date(lowBinValue),
          'day',
          true
        );
        binWidthRange = {
          min: rawBinWidthRange / 10,
          max: rawBinWidthRange / 2,
          unit: 'day',
        };
      } else {
        // high or lowBinValue were null - which means there was no data...
        binWidthRange = { min: 1, max: 1 };
      }
    }
    const binWidth =
      params.data.binWidthSlider?.binWidth ??
      ('unit' in binWidthRange
        ? ({
            value: binWidthRange.max / 10,
            unit: binWidthRange.unit,
          } as TimeDelta)
        : binWidthRange.max / 10);

    const binWidthStep =
      params.histogram?.binWidthStep ??
      params.data.binWidthSlider?.binWidthStep ??
      (binWidthRange.max - binWidthRange.min) / 10;

    initialState.histogram = {
      ...initialState.histogram,
      binWidth,
      binWidthRange,
      binWidthStep,
      valueType: params.histogram?.valueType,
    };

    if (params?.histogram?.displaySelectedRangeControls) {
      // calculate min and max limits for the selected range controls from the data
      const allBins = params.data.series.flatMap((series) => series.bins);
      const min: NumberOrDate =
        params.histogram?.selectedRange?.min ??
        orderBy(allBins, [(bin) => bin.binStart], ['asc'])[0].binStart;
      const max: NumberOrDate = orderBy(
        allBins,
        [(bin) => bin.binEnd],
        ['desc']
      )[0].binEnd;

      initialState.histogram = {
        ...initialState.histogram,
        selectedRangeBounds: { min, max } as NumberOrDateRange,
        displaySelectedRangeControls: true,
      };
    }
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
  const onSelectedUnitChange = async (newUnit: string) => {
    if (params.onSelectedUnitChange) {
      try {
        const newData = await params.onSelectedUnitChange(newUnit);
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
            newData.binWidthSlider?.binWidth &&
            newData.binWidthSlider?.binWidthRange &&
            newData.binWidthSlider?.binWidthStep
          ) {
            dispatch({
              type: 'histogram/setBinWidthRange',
              payload: newData.binWidthSlider?.binWidthRange,
            });
            dispatch({
              type: 'histogram/setBinWidth',
              payload: newData.binWidthSlider?.binWidth,
            });
            dispatch({
              type: 'histogram/setBinWidthStep',
              payload: newData.binWidthSlider?.binWidthStep,
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
        dispatch({ type: 'setSelectedUnit', payload: newUnit });
      }
    }
  };

  // Use debounce to defer execution while slider is updating.
  const debouncedBinWidthHandler = useMemo(
    () =>
      params.histogram?.onBinWidthChange &&
      debounce(params.histogram?.onBinWidthChange, 300),
    [params.histogram?.onBinWidthChange]
  );

  const onBinWidthChange = (binWidth: NumberOrTimeDelta) => {
    if (params.histogram) {
      // immediately update binWidth so the ui is consistent
      dispatch({ type: 'histogram/setBinWidth', payload: binWidth });
      if (debouncedBinWidthHandler) {
        debouncedBinWidthHandler(binWidth).then(
          (newData) => dispatch({ type: 'setData', payload: newData }),
          (error) => dispatch({ type: 'errors/add', payload: error })
        );
      }
    }
  };

  const onSelectedRangeChange = (newRange?: NumberOrDateRange) => {
    if (params.histogram) {
      dispatch({ type: 'histogram/setSelectedRange', payload: newRange });
    }
  };

  // Toggle y-axis logScale
  const toggleDependentAxisLogScale = () =>
    dispatch({ type: 'histogram/toggleDependentAxisLogScale' });
  // on y-axis dependentAxisRange
  const onDependentAxisRangeChange = (newRange?: NumberRange) => {
    if (params.histogram) {
      dispatch({
        type: 'histogram/onDependentAxisRangeChange',
        payload: newRange,
      });
    }
  };
  // on y-axis absoluteRelative
  const onDependentAxisModeChange = () =>
    dispatch({ type: 'histogram/onDependentAxisModeChange' });
  // on dependent axis range reset
  const onDependentAxisRangeReset = () =>
    dispatch({ type: 'histogram/onDependentAxisRangeReset' });
  // on independent axis range change
  const onIndependentAxisRangeChange = (newRange?: NumberOrDateRange) => {
    if (params.histogram) {
      dispatch({
        type: 'histogram/onIndependentAxisRangeChange',
        payload: newRange,
      });
    }
  };
  // on independent axis range reset
  const onIndependentAxisRangeReset = () =>
    dispatch({ type: 'histogram/onIndependentAxisRangeReset' });

  // reset all
  const onResetAll = () => dispatch({ type: 'onResetAll' });

  // onValueSpecChange for ScatterPlotControls
  const onValueSpecChange = (value: string) =>
    dispatch({ type: 'ScatterPlot/onValueSpecChange', payload: value });

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
      // add y-axis controls
      toggleDependentAxisLogScale,
      onDependentAxisRangeChange,
      onDependentAxisModeChange,
      onDependentAxisRangeReset,
      // add x-axis/independent axis controls: axis range and range reset
      onIndependentAxisRangeChange,
      onIndependentAxisRangeReset,
    },
    resetOpacity,
    onBarLayoutChange,
    onSelectedUnitChange,
    onOpacityChange,
    toggleDisplayLegend,
    toggleOrientation,
    toggleLibraryControls,
    // add reset all
    onResetAll,
    // onValueSpecChange for ScatterPlotControls
    ScatterPlot: {
      // need to add reducerState here for ScatterPlotControls
      ...reducerState.ScatterPlot,
      onValueSpecChange,
    },
  };
}
