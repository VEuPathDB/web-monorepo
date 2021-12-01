/**
 * Additional reusable modules to extend PlotProps and PlotData props
 */

import { CSSProperties } from 'react';
import { BarLayoutOptions, OrientationOptions } from '.';

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

/** Sequential gradient colormap. Useful for coloring based on a continuous variable that is always positive, for example. */
/** Using oslo from https://www.fabiocrameri.ch/colourmaps/, copied from https://github.com/empet/scientific-colorscales/blob/master/scicolorscales.py */
export const SequentialGradientColormap: string[] = [
  'rgb(0, 1, 0)',
  'rgb(11, 25, 39)',
  'rgb(17, 48, 77)',
  'rgb(27, 73, 117)',
  'rgb(46, 98, 160)',
  'rgb(78, 125, 199)',
  'rgb(111, 146, 202)',
  'rgb(144, 166, 201)',
  'rgb(176, 185, 200)',
  'rgb(215, 215, 216)',
  // 'rgb(255, 255, 255)',  Removing final, lightest, color for best visibility
];

/** Diverging gradient colormap. Useful for coloring a continuous variable that has values above and below a midpoint (usually 0) */
/** Using cork from https://www.fabiocrameri.ch/colourmaps/, copied from https://github.com/empet/scientific-colorscales/blob/master/scicolorscales.py */
/** MUST have ODD number of colors! Assume the middle color maps to the midpoint */
export const DivergingGradientColormap: string[] = [
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
  'rgb(231, 239, 237)', // midpoint
  'rgb(216, 232, 218)',
  'rgb(188, 216, 191)',
  'rgb(160, 200, 164)',
  'rgb(133, 183, 137)',
  'rgb(106, 167, 111)',
  'rgb(82, 151, 85)',
  'rgb(65, 130, 58)',
  'rgb(64, 110, 36)',
  'rgb(65, 92, 18)',
  'rgb(67 77, 2)',
];

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
