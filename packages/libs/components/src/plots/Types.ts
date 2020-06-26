import { CSSProperties } from "react";
import { PlotData } from "plotly.js";

// Typescript types that generically describe a plot's options

/**
 * React Props that are passed to a Plot Component.
 * @typeParam T required `PlotData` keys
 * @typeParam S optional `PlotData` keys
 */
export interface PlotComponentProps<T extends keyof PlotData> {
  /** The data to be plotted */
  // TODO Support optional keys
  data: Pick<PlotData, T>[];
  /** Style to be applied to container div element */
  style?: CSSProperties;
  /** Callback function to handle selection */
  onSelection?: (range: [ number, number ]) => void;
  /** Callback function to handle plot state change */
  onPlotUpdate?: (plotState: unknown) => void;
}
