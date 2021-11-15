import { CSSProperties, ReactNode } from 'react';

export interface LayoutProps {
  containerStyles?: CSSProperties;
  legendNode?: ReactNode;
  legendStyles?: CSSProperties;
  plotNode: ReactNode;
  plotStyles?: CSSProperties;
  tableGroupNode: ReactNode;
  tableGroupStyles?: CSSProperties;
}

export type StyleProps<P> = Pick<P, keyof P & `${string}Styles`>;
