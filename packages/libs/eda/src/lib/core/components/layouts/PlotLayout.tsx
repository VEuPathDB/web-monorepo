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

export interface PlotLayoutProps {
  isFaceted: boolean;
  legendNode?: ReactNode;
  plotNode: ReactNode;
  tableGroupNode: ReactNode;
  singlePlotStyles?: StyleProps<SinglePlotLayoutProps>;
  facetedPlotStyles?: StyleProps<FacetedPlotLayoutProps>;
  showRequiredInputsPrompt?: boolean;
  /**
   * the mosaic plot's layout uses the TabbedDisplay component, which affects how
   * the requiredInputsPrompt displays on the plot; this prop allows for conditionally
   * setting the top offset accordingly
   */
  isMosaicPlot?: boolean;
}

export function PlotLayout({
  isFaceted,
  legendNode,
  plotNode,
  tableGroupNode,
  singlePlotStyles,
  facetedPlotStyles,
  showRequiredInputsPrompt,
  isMosaicPlot,
}: PlotLayoutProps) {
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
      showRequiredInputsPrompt={showRequiredInputsPrompt}
      isMosaicPlot={isMosaicPlot}
      {...singlePlotStyles}
    />
  );
}
