import { CSSProperties } from 'react';
import { FloatingDiv } from '../../../map/analysis/FloatingDiv';
import { RequiredInputsPrompt } from './RequiredInputPrompts';

import { LayoutProps } from './types';

export interface Props extends LayoutProps {
  showRequiredInputsPrompt?: boolean;
  isMosaicPlot?: boolean;
}

const defaultContainerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const defaultPlotStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export function FloatingLayout({
  containerStyles,
  plotNode,
  controlsNode,
  plotStyles,
  showRequiredInputsPrompt,
  isMosaicPlot,
}: Props) {
  return (
    <div style={{ ...defaultContainerStyles, ...containerStyles }}>
      <div style={{ ...defaultPlotStyles, ...plotStyles }}>
        {showRequiredInputsPrompt && (
          <RequiredInputsPrompt isMosaicPlot={isMosaicPlot} />
        )}
        {plotNode}
        {controlsNode}
      </div>
    </div>
  );
}
