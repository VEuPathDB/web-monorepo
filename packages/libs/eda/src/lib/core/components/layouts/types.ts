import { CSSProperties, ReactNode } from 'react';

export interface LayoutProps {
  containerStyles?: CSSProperties;
  legendNode?: ReactNode;
  legendStyles?: CSSProperties;
  plotNode: ReactNode;
  controlsNode?: ReactNode;
  plotStyles?: CSSProperties;
  tableGroupNode: ReactNode;
  tableGroupStyles?: CSSProperties;
}

export type StyleProps<P> = Pick<P, keyof P & `${string}Styles`>;

export interface LayoutOptions {
  layoutComponent?: (props: LayoutProps) => JSX.Element;
  hideShowMissingnessToggle?: boolean;
}

export interface TitleOptions {
  getPlotSubtitle?(config: unknown): string | undefined;
}
