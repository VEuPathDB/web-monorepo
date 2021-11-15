import { ReactNode } from 'react';

import {
  FacetedPlotLayout,
  Props as FacetedPlotLayoutProps,
} from './FacetedPlotLayout';
import {
  Props as SinglePlotLayoutProps,
  SinglePlotLayout,
} from './SinglePlotLayout';

import { StyleProps } from './types';

interface Props {
  isFaceted: boolean;
  legendNode?: ReactNode;
  plotNode: ReactNode;
  tableGroupNode: ReactNode;
  singlePlotStyles?: StyleProps<SinglePlotLayoutProps>;
  facetedPlotStyles?: StyleProps<FacetedPlotLayoutProps>;
}

export function PlotLayout({
  isFaceted,
  legendNode,
  plotNode,
  tableGroupNode,
  singlePlotStyles,
  facetedPlotStyles,
}: Props) {
  return isFaceted ? (
    <FacetedPlotLayout
      legendNode={legendNode}
      plotNode={plotNode}
      tableGroupNode={tableGroupNode}
      {...facetedPlotStyles}
    />
  ) : (
    <SinglePlotLayout
      legendNode={legendNode}
      plotNode={plotNode}
      tableGroupNode={tableGroupNode}
      {...singlePlotStyles}
    />
  );
}
