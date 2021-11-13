import { CSSProperties } from 'react';

import { LayoutProps } from './types';

interface Props extends LayoutProps {
  infoRowStyles?: CSSProperties;
}

const defaultContainerStyles: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const defaultInfoRowStyles: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
  margin: '0 1em',
};

const defaultLegendStyles: CSSProperties = {
  marginRight: '2em',
};

const defaultPlotStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

const defaultTableGroupStyles: CSSProperties = {
  display: 'flex',
  gridAutoFlow: 'column',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: '2em',
};

export function FacetedPlotLayout({
  containerStyles,
  infoRowStyles,
  legendNode,
  legendStyles,
  plotNode,
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
      <div style={{ ...defaultInfoRowStyles, ...infoRowStyles }}>
        {legendNode && (
          <div style={{ ...defaultLegendStyles, ...legendStyles }}>
            {legendNode}
          </div>
        )}
        <div style={{ ...defaultTableGroupStyles, ...tableGroupStyles }}>
          {tableGroupNode}
        </div>
      </div>
      <div style={{ ...defaultPlotStyles, ...plotStyles }}>{plotNode}</div>
    </div>
  );
}
