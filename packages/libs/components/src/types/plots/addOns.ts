/** Additional controls for legend layout / appearance. */
export type PlotLegendAddon = {
  /** Are legend items presented horizontally or vertically? */
  orientation: 'vertical' | 'horizontal';
  /** General horizontal position of the legend. */
  horizontalPosition: 'auto' | 'left' | 'center' | 'right';
  /** Positive numbers will adjust legend to the right, negative to the left. */
  horizontalPaddingAdjustment?: number;
  /** General vertical position of the legend. */
  verticalPosition: 'auto' | 'top' | 'middle' | 'bottom';
  /** Positive numbers will adjust legend to down, negative numbers will adjust up. */
  verticalPaddingAdjustment?: number;
  font?: {
    family: string;
    size: number;
    color: string;
  };
};

/** Specification to control plot margins and padding. */
export type PlotSpacingAddon = {
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  padding?: number;
};
