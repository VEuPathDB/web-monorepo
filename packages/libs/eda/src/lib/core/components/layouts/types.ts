import { CSSProperties, ReactNode } from 'react';

export interface LayoutProps {
  containerStyles?: CSSProperties;
  legendNode?: ReactNode;
  legendStyles?: CSSProperties;
  // inputVariablesNode?: ReactNode;
  plotNode: ReactNode;
  controlsNode?: ReactNode;
  plotStyles?: CSSProperties;
  tableGroupNode: ReactNode;
  tableGroupStyles?: CSSProperties;
  hideControls?: boolean;
}

export type StyleProps<P> = Pick<P, keyof P & `${string}Styles`>;

export interface LayoutOptions {
  layoutComponent?: (props: LayoutProps) => JSX.Element;
  hideShowMissingnessToggle?: boolean;
  hideFacetInputs?: boolean;
  // considering marginal histogram
  showMarginalHistogram?: boolean;
  // hideInputsAndControls?: boolean;
}

export interface TitleOptions {
  getPlotSubtitle?(config: unknown): string | undefined;
}
