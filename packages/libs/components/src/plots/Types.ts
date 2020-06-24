import { CSSProperties } from "react";
import { PlotData } from "plotly.js";

// Typescript types that generically describe a plot's options

/**
 * React Props that are passed to a Plot Component.
 * @typeParam T required `PlotData` keys
 * @typeParam S optional `PlotData` keys
 */
export interface PlotComponentProps<T extends keyof PlotData, S extends keyof PlotData = never> {
  /** The data to be plotted */
  data: (Pick<PlotData, T> & Pick<Partial<PlotData>, S>)[];
  /** Style to be applied to container div element */
  style?: CSSProperties;
  /** Callback function to handle selection */
  onSelection?: (range: [ number, number ]) => void;
  /** Callback function to handle plot state change */
  onPlotUpdate?: (plotState: unknown) => void;
}
