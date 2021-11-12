import { CSSProperties } from 'react';

import { LayoutProps as Props } from './types';

const defaultContainerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const defaultLegendStyles: CSSProperties = {
  marginLeft: '2em',
};

const defaultPlotStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const defaultTableGroupStyles: CSSProperties = {
  display: 'grid',
  gridAutoFlow: 'row',
  gap: '0.75em',
  marginLeft: '3em',
  marginTop: '1.5em',
};

export function SinglePlotLayout({
  containerStyles,
  legendNode,
  legendStyles,
  plotNode,
  plotStyles,
  tableGroupNode,
  tableGroupStyles,
}: Props) {
  return (
    <div style={{ ...defaultContainerStyles, ...containerStyles }}>
      <div style={{ ...defaultPlotStyles, ...plotStyles }}>{plotNode}</div>
      {legendNode && (
        <div style={{ ...defaultLegendStyles, ...legendStyles }}>
          {legendNode}
        </div>
      )}
      <div style={{ ...defaultTableGroupStyles, ...tableGroupStyles }}>
        {tableGroupNode}
      </div>
    </div>
  );
}
