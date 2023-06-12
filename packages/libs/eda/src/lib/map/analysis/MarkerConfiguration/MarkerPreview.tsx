import Barplot from '@veupathdb/components/lib/plots/Barplot';
import PiePlot from '@veupathdb/components/lib/plots/PiePlot';
import { OverlayConfig } from '../../../core';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';

type Props = {
  data: OverlayConfig | undefined;
  markerType: 'barplot' | 'pie';
};

export function MarkerPreview({ data, markerType }: Props) {
  if (!data) return <></>;
  if (data.overlayType === 'categorical') {
    const { overlayValues, allValuesSorted } = data;
    const allOtherValuesCount = allValuesSorted.reduce(
      (prev, curr) =>
        prev + (overlayValues.includes(curr.label) ? 0 : curr.count),
      0
    );
    if (markerType === 'barplot') {
      const barplotData = {
        name: '',
        color: ColorPaletteDefault.slice(0, data?.overlayValues.length),
        value: overlayValues.map((val) =>
          val === '__UNSELECTED__'
            ? allOtherValuesCount
            : allValuesSorted.find((v) => v.label === val)?.count ?? 0
        ),
        label: overlayValues.map((val) =>
          val === '__UNSELECTED__' ? 'All other values' : val
        ),
      };
      return (
        <div>
          <span style={{ fontWeight: 'bold' }}>Marker Preview:</span>
          <Barplot
            data={{ series: [barplotData] }}
            dependentAxisLabel="Count (filtered data)"
            barLayout="overlay"
            showValues={true}
          />
        </div>
      );
    } else if (markerType === 'pie') {
      const pieplotData = overlayValues.map((val, index) => ({
        label: val,
        color: ColorPaletteDefault[index],
        value:
          val === '__UNSELECTED__'
            ? allOtherValuesCount
            : allValuesSorted.find((v) => v.label === val)?.count ?? 0,
      }));
      return (
        <div>
          <span style={{ fontWeight: 'bold' }}>Marker Preview:</span>
          <PiePlot
            data={{ slices: pieplotData }}
            donutOptions={{
              size: 0.5,
            }}
            textOptions={{
              displayPosition: 'none',
            }}
            displayLegend={false}
          />
        </div>
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
}
