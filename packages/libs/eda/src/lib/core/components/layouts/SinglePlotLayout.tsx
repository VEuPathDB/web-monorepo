import { CSSProperties } from 'react';

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

const requiredInputsContainerStyles: CSSProperties = {
  position: 'relative',
  height: '0',
  width: '0',
};

const requiredInputsHeaderStyles: CSSProperties = {
  position: 'absolute',
  width: 'max-content',
  left: '4.25em',
  zIndex: '1000',
  fontWeight: '500',
  fontStyle: 'normal',
  backgroundColor: '#fff',
  padding: '0.5em',
};

const requiredTextStyles: CSSProperties = {
  color: '#dd314e',
  position: 'relative',
  top: '-2px',
  paddingLeft: '1px',
};

export function SinglePlotLayout({
  containerStyles,
  legendNode,
  legendStyles,
  plotNode,
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
      </div>
      <div style={{ ...defaultTableGroupStyles, ...tableGroupStyles }}>
        {legendNode && <div style={{ ...legendStyles }}>{legendNode}</div>}
        {tableGroupNode}
      </div>
    </div>
  );
}

interface RequiredPromptProps {
  isMosaicPlot: boolean | undefined;
}

function RequiredInputsPrompt({ isMosaicPlot }: RequiredPromptProps) {
  return (
    <div style={requiredInputsContainerStyles}>
      <h3
        style={{
          ...requiredInputsHeaderStyles,
          top: isMosaicPlot ? '4em' : '0.5em',
        }}
      >
        Please select all{' '}
        <span style={{ color: requiredTextStyles.color }}>
          required
          <span style={requiredTextStyles}>*</span>
        </span>{' '}
        parameters.
      </h3>
    </div>
  );
}
