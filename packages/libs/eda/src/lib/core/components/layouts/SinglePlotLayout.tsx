import { CSSProperties } from 'react';
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

const defaultTableGroupStyles: CSSProperties = {
  margin: '0em 1.5em',
  display: 'grid',
  gridAutoFlow: 'row',
  gap: '1.5em',
};

export function SinglePlotLayout({
  containerStyles,
  legendNode,
  legendStyles,
  plotNode,
  controlsNode,
  plotStyles,
  tableGroupNode,
  tableGroupStyles,
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
      <div style={{ ...defaultTableGroupStyles, ...tableGroupStyles }}>
        {legendNode && <div style={{ ...legendStyles }}>{legendNode}</div>}
        {tableGroupNode}
      </div>
    </div>
  );
}
