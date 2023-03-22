import { CSSProperties } from 'react';

import { LayoutProps } from './types';

export type Props = LayoutProps;

const defaultContainerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const defaultLegendStyles: CSSProperties = {
  order: -1,
};

const defaultPlotStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

const defaultTableGroupStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  maxWidth: '100%',
  margin: '1em',
  gap: '2em',
};

export function FacetedPlotLayout({
  containerStyles,
  legendNode,
  legendStyles,
  plotNode,
  controlsNode,
  plotStyles,
  tableGroupNode,
  tableGroupStyles,
}: Props) {
  return (
    <div
      style={{
        ...defaultContainerStyles,
        ...containerStyles,
      }}
    >
      <div style={{ ...defaultTableGroupStyles, ...tableGroupStyles }}>
        {legendNode && (
          <div style={{ ...defaultLegendStyles, ...legendStyles }}>
            {legendNode}
          </div>
        )}
        {tableGroupNode}
      </div>
      <div style={{ ...defaultPlotStyles, ...plotStyles }}>
        {plotNode}
        {controlsNode}
      </div>
    </div>
  );
}
