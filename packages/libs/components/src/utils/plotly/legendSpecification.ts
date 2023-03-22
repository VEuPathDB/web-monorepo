import { Legend } from 'plotly.js';
import { PlotLegendAddon } from '../../types/plots/addOns';

/**
 * Return a Plot.ly legend specification.
 *
 * Legend layout is gross and painful in Plot.ly.
 * To ease the mental burden here a bit, we do calculations
 * on this sparately here.
 *
 * */
export default (args: PlotLegendAddon): Partial<Legend> => {
  let xPosition: number;
  switch (args.horizontalPosition) {
    case 'left':
      xPosition = 0.0 + (args.horizontalPaddingAdjustment ?? 0);
      break;

    case 'center':
      xPosition = 0.5 + (args.horizontalPaddingAdjustment ?? 0);
      break;

    case 'right':
      xPosition = 1 + (args.horizontalPaddingAdjustment ?? 0);
      break;

    default:
      xPosition = 1 + (args.horizontalPaddingAdjustment ?? 0);
      break;
  }

  let yPosition: number;
  switch (args.verticalPosition) {
    case 'bottom':
      yPosition = 0 + (args.verticalPaddingAdjustment ?? 0);
      break;

    case 'middle':
      yPosition = 0.5 + (args.verticalPaddingAdjustment ?? 0);
      break;

    case 'top':
      yPosition = 1 + (args.verticalPaddingAdjustment ?? 0);
      break;

    default:
      yPosition = 0.5 + (args.verticalPaddingAdjustment ?? 0);
      break;
  }

  return {
    orientation: args.orientation[0] as 'h' | 'v',
    x: xPosition,
    xanchor: 'auto',
    y: yPosition,
    yanchor: 'auto',
    font: args.font,
    // define traceorder
    traceorder: args.traceorder,
  };
};
