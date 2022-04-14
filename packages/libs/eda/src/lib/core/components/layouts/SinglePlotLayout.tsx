import { CSSProperties } from 'react';

import { LayoutProps } from './types';

export type Props = LayoutProps;

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
  plotStyles,
  tableGroupNode,
  tableGroupStyles,
}: Props) {
  return (
    <div style={{ ...defaultContainerStyles, ...containerStyles }}>
      <div style={{ ...defaultPlotStyles, ...plotStyles }}>{plotNode}</div>
      <div style={{ ...defaultTableGroupStyles, ...tableGroupStyles }}>
        {legendNode && <div style={{ ...legendStyles }}>{legendNode}</div>}
        {tableGroupNode}
      </div>
    </div>
  );
}
