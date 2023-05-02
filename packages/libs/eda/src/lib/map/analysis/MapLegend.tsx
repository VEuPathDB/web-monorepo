import React from 'react';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';

interface Props {
  legendItems: LegendItemsProps[];
  title?: string;
  showCheckbox?: boolean;
}

export function MapLegend(props: Props) {
  const { legendItems, title = 'Legend', showCheckbox } = props;
  return (
    <>
      <div>
        <strong>{title}</strong>
      </div>
      <PlotLegend
        type="list"
        legendItems={legendItems}
        showOverlayLegend
        containerStyles={{
          border: 'none',
          boxShadow: 'none',
          padding: 0,
          width: 'auto',
        }}
        showCheckbox={showCheckbox}
      />
    </>
  );
}
