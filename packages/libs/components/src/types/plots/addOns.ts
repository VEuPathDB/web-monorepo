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
