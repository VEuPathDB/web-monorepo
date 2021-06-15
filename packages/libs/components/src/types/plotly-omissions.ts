/**
 * General type definitions that don't fit into a more specialized category.
 * Or, at least, haven't found a more specific home yet.
 */

// extend legend type: somehow plotly.js did not define legend.title type
// see https://plotly.com/javascript/reference/layout/#layout-legend-title
// export interface layoutLegend extends Partial<Legend> {
export interface LayoutLegendTitle {
  legend?: {
    title?: {
      text?: string;
      font?: {
        family?: string;
        size?: number;
        color?: string;
      };
      side?: 'top' | 'left' | 'top left';
    };
  };
}
