declare module "plotly.js/src/components/color/attributes" {
  export const defaults: string[];
}

// declare module 'plotly.js' {
//   export interface PlotData extends Omit<PlotData, 'hoverinfo'> {
//     hoverinfo: PlotData['hoverinfo'] | PlotData['textinfo'],
//     sort: boolean;
//   }

//   export type Data = Partial<PlotData>;
// }

// declare module 'react-plotly.js' {
//   export interface PlotParams extends Omit<PlotParams, 'data'>{
//     data: Data[];
//   }

//   export class Plot extends React.PureComponent<PlotParams> {}
// }
