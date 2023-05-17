import React, { useEffect, useState } from 'react';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  legendItems: LegendItemsProps[];
  isLoading: boolean;
  title?: string;
  showCheckbox?: boolean;
}

export function MapLegend(props: Props) {
  const { legendItems, isLoading, title = 'Legend', showCheckbox } = props;

  return (
    <>
      <div>
        <strong>{title}</strong>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <PlotLegend
          type="list"
          legendItems={legendItems}
          showOverlayLegend
          containerStyles={{
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            width: 'auto',
            maxWidth: 400,
          }}
          showCheckbox={showCheckbox}
        />
      )}
    </>
  );
}
