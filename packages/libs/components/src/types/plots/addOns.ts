/**
 * Additional reusable modules to extend PlotProps and PlotData props
 */

import { CSSProperties } from 'react';
import { BarLayoutOptions, OrientationOptions } from '.';
import { scaleLinear } from 'd3-scale';
import { interpolateLab, extent, range } from 'd3';
import { rgb, lab } from 'd3-color';

/** PlotProps addons */

/** Additional controls for legend layout & appearance. */
export type PlotLegendAddon = {
  /** Are legend items presented horizontally or vertically? */
  orientation: 'vertical' | 'horizontal';
  /** General horizontal position of the legend. */
  horizontalPosition: 'auto' | 'left' | 'center' | 'right';
  /** Positive numbers will adjust legend to the right, negative to the left. */
  horizontalPaddingAdjustment?: number;
  /** General vertical position of the legend. */
  verticalPosition: 'auto' | 'top' | 'middle' | 'bottom';
  /** Positive numbers will adjust legend up, negative numbers will adjust it down. */
  verticalPaddingAdjustment?: number;
  font?: {
    family: string;
    size: number;
    color: string;
  };
  /** legend traceorder (for histogram filter) */
  traceorder?: 'reversed' | 'grouped' | 'normal' | undefined;
};

/** Specification to control plot margins and padding. */
export type PlotSpacingAddon = {
  /** The margin between the top edge of the container and the plot. */
  marginTop?: number;
  /** The margin between the right edge of the container and the plot. */
  marginRight?: number;
  /** The margin between the bottom edge of the container and the plot. */
  marginBottom?: number;
  /** The margin between the left edge of the container and the plot. */
  marginLeft?: number;
  /** Padding, applied equally on all sides. */
  padding?: number;
};
export const PlotSpacingDefault: Required<PlotSpacingAddon> = {
  marginTop: 100,
  marginRight: 80,
  marginBottom: 80,
  marginLeft: 80,
  padding: 0,
};

export type OrientationAddon = {
  /** Orientation of plot - default is vertical (e.g. independent axis at bottom) */
  orientation?: OrientationOptions;
};
export const OrientationDefault: OrientationOptions = 'vertical';

export type OpacityAddon = {
  /** Opacity of markers that require opacity (e.g. outliers, overlaid bars).
   * Number 0 to 1 (default 0.5) */
  opacity?: number;
};
export const OpacityDefault: number = 0.5;

export type independentAxisLogScaleAddon = {
  /** Use a log scale for independent axis. Default is false */
  independentAxisLogScale?: boolean;
};
export const independentAxisLogScaleDefault: boolean = false;

export type DependentAxisLogScaleAddon = {
  /** Use a log scale for dependent axis. Default is false */
  dependentAxisLogScale?: boolean;
};
export const DependentAxisLogScaleDefault: boolean = false;

/** BarLayout - options and default differ depending on usage */
export type BarLayoutAddon<O extends BarLayoutOptions> = {
  /** How bars are displayed when there are multiple series. */
  barLayout?: O;
};

/** valueType for when components or widgets take number or date types  */
export type ValueTypeAddon = {
  /** Type of variable 'number' or 'date' */
  valueType?: 'number' | 'date';
};

/** simple string label prop */
export type LabelAddon = {
  /** Label for component or widget */
  label?: string;
};

/** container styling */
export type ContainerStylesAddon = {
  /** Additional styles for component's container. Optional */
  containerStyles?: CSSProperties;
};

/** PlotData addons */
export type AvailableUnitsAddon =
  | {
      /** What units does the backend support switching between? */
      availableUnits: Array<string>;
      /** Currently selected unit. */
      selectedUnit: string;
    }
  | {
      /** What units does the backend support switching between? */
      availableUnits?: never;
      /** Currently selected unit. */
      selectedUnit?: never;
    };

/** Marker scale addon
 * default value of 1 is regular size
 */
export type MarkerScaleAddon = {
  markerScale?: number;
};
// capitalisation ought to be `markerScaleDefault` or `defaultMarkerScale` but
// here we stick with the convention I (Bob) started a long time ago before I knew better :)
export const MarkerScaleDefault: number = 1;

/** Color palette addon */
export type ColorPaletteAddon = {
  colorPalette?: string[];
};
/** Based on [Tol's muted colormap](https://personal.sron.nl/~pault/) */
export const ColorPaletteDefault: string[] = [
  'rgb(136,34,85)',
  'rgb(136,204,238)',
  'rgb(153,153,51)',
  'rgb(51,34,136)',
  'rgb(68,170,153)',
  'rgb(221,204,119)',
  'rgb(204,102,119)',
  'rgb(17,119,51)',
];

/** Darker color palette, useful for overlay traces, such as smoothed mean in scatter plots */
export const ColorPaletteDark: string[] = [
  'rgb(115, 28, 72)',
  'rgb(113, 194, 234)',
  'rgb(133, 133, 44)',
  'rgb(43, 28, 115)',
  'rgb(60, 151, 136)',
  'rgb(215, 196, 98)',
  'rgb(197, 82, 102)',
  'rgb(13, 96, 41)',
];

/** Based on [Tol's muted colormap](https://personal.sron.nl/~pault/) */
/** Needs work - this is a draft for purposes of discussion and choosing a new colormap */
export const ColorPaletteOrdinal: string[] = [
  'rgb(136,34,85)',
  'rgb(204,102,119)',
  'rgb(153,153,51)',
  'rgb(221,204,119)',
  'rgb(68,170,153)',
  'rgb(17,119,51)',
  'rgb(136,204,238)',
  'rgb(51,34,136)',
];

/** Sequential gradient colorscale. Useful for coloring based on a continuous variable that is always positive, for example. */
/** Using oslo from https://www.fabiocrameri.ch/colourmaps/, copied from https://github.com/empet/scientific-colorscales/blob/master/scicolorscales.py */
export const SequentialGradientColorscale: string[] = [
  // 'rgb(255, 255, 255)',  Removing final, lightest, color for best visibility
  'rgb(215, 215, 216)',
  'rgb(176, 185, 200)',
  'rgb(144, 166, 201)',
  'rgb(111, 146, 202)',
  'rgb(78, 125, 199)',
  'rgb(46, 98, 160)',
  'rgb(27, 73, 117)',
  'rgb(17, 48, 77)',
  'rgb(11, 25, 39)',
  'rgb(0, 1, 0)',
];

// ANN Add opacity slider

/** Diverging gradient colorscale. Useful for coloring a continuous variable that has values above and below a midpoint (usually 0) */
/** Using vik from https://www.fabiocrameri.ch/colourmaps/, copied from https://github.com/empet/scientific-colorscales/blob/master/scicolorscales.py */
/** MUST have ODD number of colors! Assume the middle color maps to the midpoint */
// TEST vik (current)
const Vik: string[] = [
  'rgb(1, 18, 97)',
  'rgb(2, 37, 109)',
  'rgb(2, 57, 122)',
  'rgb(3, 78, 135)',
  'rgb(16, 100, 150)',
  'rgb(47, 125, 166)',
  'rgb(83, 149, 183)',
  'rgb(125, 176, 201)',
  'rgb(166, 201, 218)',
  'rgb(207, 225, 234)',
  'rgb(235, 237, 233)', // midpoint
  'rgb(234, 225, 206)',
  'rgb(220, 203, 168)',
  'rgb(205, 181, 131)',
  'rgb(190, 159, 95)',
  'rgb(174, 136, 60)',
  'rgb(159, 113, 28)',
  'rgb(141, 87, 4)',
  'rgb(126, 63, 1)',
  'rgb(111, 41, 1)',
  'rgb(97, 18, 0)',
];

// Roma TEST
const Roma: string[] = [
  'rgb(126, 26, 1)',
  'rgb(141, 57, 11)',
  'rgb(155, 85, 23)',
  'rgb(168, 111, 34)',
  'rgb(181, 138, 45)',
  'rgb(194, 166, 59)',
  'rgb(208, 193, 81)',
  'rgb(222, 217, 117)',
  'rgb(230, 230, 152)',
  'rgb(227, 236, 180)',
  'rgb(209, 237, 202)',
  'rgb(180, 234, 213)',
  'rgb(141, 222, 218)',
  'rgb(105, 202, 215)',
  'rgb(84, 178, 207)',
  'rgb(72, 154, 197)',
  'rgb(63, 133, 188)',
  'rgb(54, 111, 179)',
  'rgb(45, 90, 170)',
  'rgb(36, 70, 161)',
  'rgb(27, 51, 153)',
];

// Berlin TEST
const Berlin = [
  'rgb(158, 176, 255)',
  'rgb(130, 173, 242)',
  'rgb(98, 166, 224)',
  'rgb(68, 151, 198)',
  'rgb(50, 128, 166)',
  'rgb(40, 104, 134)',
  'rgb(32, 82, 106)',
  'rgb(23, 60, 77)',
  'rgb(17, 39, 50)',
  'rgb(17, 22, 27)',
  'rgb(25, 12, 9)',
  'rgb(38, 13, 1)',
  'rgb(55, 16, 0)',
  'rgb(74, 21, 2)',
  'rgb(97, 32, 11)',
  'rgb(125, 52, 30)',
  'rgb(150, 74, 54)',
  'rgb(176, 98, 83)',
  'rgb(202, 123, 113)',
  'rgb(229, 149, 144)',
  'rgb(255, 173, 173)',
];

const Tofino = [
  'rgb(222, 217, 255)',
  'rgb(190, 194, 241)',
  'rgb(155, 170, 226)',
  'rgb(121, 145, 209)',
  'rgb(87, 119, 186)',
  'rgb(62, 94, 154)',
  'rgb(48, 74, 123)',
  'rgb(35, 55, 91)',
  'rgb(25, 37, 61)',
  'rgb(17, 24, 35)',
  'rgb(13, 22, 19)',
  'rgb(17, 32, 19)',
  'rgb(24, 50, 26)',
  'rgb(33, 71, 37)',
  'rgb(44, 93, 48)',
  'rgb(56, 117, 61)',
  'rgb(74, 141, 75)',
  'rgb(106, 168, 95)',
  'rgb(145, 190, 116)',
  'rgb(183, 211, 137)',
  'rgb(219, 230, 155)',
];

const Broc = [
  'rgb(44, 26, 76)',
  'rgb(43, 44, 95)',
  'rgb(41, 64, 115)',
  'rgb(45, 86, 136)',
  'rgb(65, 109, 154)',
  'rgb(94, 132, 170)',
  'rgb(122, 154, 185)',
  'rgb(153, 178, 202)',
  'rgb(185, 202, 218)',
  'rgb(217, 226, 234)',
  'rgb(239, 241, 237)',
  'rgb(237, 238, 217)',
  'rgb(225, 224, 187)',
  'rgb(208, 208, 155)',
  'rgb(184, 184, 125)',
  'rgb(157, 157, 100)',
  'rgb(132, 132, 79)',
  'rgb(106, 106, 57)',
  'rgb(81, 81, 37)',
  'rgb(58, 58, 18)',
  'rgb(38, 39, 1)',
];

// Lisbon TEST
const Lisbon = [
  'rgb(230, 229, 255)',
  'rgb(197, 206, 236)',
  'rgb(163, 181, 215)',
  'rgb(129, 156, 195)',
  'rgb(96, 131, 174)',
  'rgb(65, 106, 151)',
  'rgb(42, 83, 125)',
  'rgb(26, 61, 95)',
  'rgb(19, 42, 66)',
  'rgb(17, 28, 40)',
  'rgb(23, 25, 25)',
  'rgb(36, 35, 25)',
  'rgb(56, 53, 34)',
  'rgb(79, 75, 47)',
  'rgb(104, 97, 62)',
  'rgb(129, 122, 78)',
  'rgb(154, 145, 96)',
  'rgb(181, 173, 121)',
  'rgb(207, 201, 152)',
  'rgb(232, 229, 185)',
  'rgb(255, 255, 217)',
];

// Cork TEST
const Cork = [
  'rgb(44, 26, 76)',
  'rgb(43, 44, 94)',
  'rgb(41, 64, 115)',
  'rgb(44, 86, 135)',
  'rgb(64, 108, 153)',
  'rgb(92, 131, 169)',
  'rgb(120, 152, 184)',
  'rgb(150, 176, 200)',
  'rgb(182, 199, 217)',
  'rgb(213, 223, 233)',
  'rgb(231, 239, 237)',
  'rgb(216, 232, 218)',
  'rgb(188, 216, 191)',
  'rgb(160, 200, 164)',
  'rgb(133, 183, 137)',
  'rgb(106, 167, 111)',
  'rgb(82, 151, 85)',
  'rgb(65, 130, 58)',
  'rgb(64, 110, 36)',
  'rgb(65, 92, 18)',
  'rgb(67, 77, 2)',
];

export const DivergingGradientColorscale = Berlin.map((color) =>
  rgb(lab(color).darker(-1)).toString()
);
console.log(DivergingGradientColorscale);

// Create colorscale for series. Maps [0, 1] to gradient colorscale using Lab interpolation
export const gradientSequentialColorscaleMap = scaleLinear<string>()
  .domain(
    range(SequentialGradientColorscale.length).map(
      (a: number) => a / (SequentialGradientColorscale.length - 1)
    )
  )
  .range(SequentialGradientColorscale)
  .interpolate(interpolateLab);

// Create diverging colorscale. Maps [-1, 1] to gradient colorscale using Lab interpolation
const divergingColorscaleSteps = Math.floor(
  DivergingGradientColorscale.length / 2
);
export const gradientDivergingColorscaleMap = scaleLinear<string>()
  .domain(
    range(-divergingColorscaleSteps, divergingColorscaleSteps + 1).map(
      (a: number) => a / divergingColorscaleSteps
    )
  )
  .range(DivergingGradientColorscale)
  .interpolate(interpolateLab);

/** truncated axis flags */
export type AxisTruncationAddon = {
  /** truncation config (flags) to show truncated axis (true) or not (false) */
  axisTruncationConfig?: AxisTruncationConfig;
};

export type AxisTruncationConfig = {
  independentAxis?: {
    min?: boolean;
    max?: boolean;
  };
  dependentAxis?: {
    min?: boolean;
    max?: boolean;
  };
};
