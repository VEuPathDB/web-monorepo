import { CSSProperties } from 'react';

import { LayoutProps } from './types';

export interface Props extends LayoutProps {
  showRequiredInputsPrompt?: boolean;
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

const pseudoRelativeContainerStyles: CSSProperties = {
  position: 'relative',
  height: '0',
  width: '0',
};

const requiredInputsHeaderStyles: CSSProperties = {
  position: 'absolute',
  width: 'max-content',
  top: '1.75em',
  left: '1.75em',
  zIndex: '10',
  fontWeight: '500',
  fontStyle: 'normal',
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
}: Props) {
  return (
    <div style={{ ...defaultContainerStyles, ...containerStyles }}>
      <div style={{ ...defaultPlotStyles, ...plotStyles }}>
        {showRequiredInputsPrompt && (
          <div style={pseudoRelativeContainerStyles}>
            <h3 style={requiredInputsHeaderStyles}>
              Please select all{' '}
              <span style={{ color: requiredTextStyles.color }}>
                required
                <span style={requiredTextStyles}>*</span>
              </span>{' '}
              parameters.
            </h3>
          </div>
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
