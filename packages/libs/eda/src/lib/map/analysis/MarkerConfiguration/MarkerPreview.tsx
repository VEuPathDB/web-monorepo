import Barplot from '@veupathdb/components/lib/plots/Barplot';
import PiePlot from '@veupathdb/components/lib/plots/PiePlot';
import { OverlayConfig } from '../../../core';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
import { ChartMarkerStandalone } from '@veupathdb/components/lib/map/ChartMarker';
import { DonutMarkerStandalone } from '@veupathdb/components/lib/map/DonutMarker';

type Props = {
  data: OverlayConfig | undefined;
  mapType: 'barplot' | 'pie';
};

export const sharedStandaloneMarkerProperties = {
  markerScale: 3,
  containerStyles: {
    width: 'fit-content',
    height: 'fit-content',
    margin: 'auto',
  },
};

export function MarkerPreview({ data, mapType }: Props) {
  if (!data) return <></>;
  if (data.overlayType === 'categorical') {
    const { overlayValues, allValues } = data;
    const allOtherValuesCount = allValues.reduce(
      (prev, curr) =>
        prev + (overlayValues.includes(curr.label) ? 0 : curr.count),
      0
    );
    const plotData = overlayValues.map((val, index) => ({
      label: val,
      color: ColorPaletteDefault[index],
      value:
        val === '__UNSELECTED__'
          ? allOtherValuesCount
          : allValues.find((v) => v.label === val)?.count ?? 0,
    }));
    if (mapType === 'barplot') {
      return (
        <ChartMarkerStandalone
          data={plotData}
          {...sharedStandaloneMarkerProperties}
        />
      );
    } else if (mapType === 'pie') {
      return (
        <DonutMarkerStandalone
          data={plotData}
          {...sharedStandaloneMarkerProperties}
        />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
}
