import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { OverlayConfig } from '../../../core';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';

type Props = {
  data: OverlayConfig | undefined;
};

export function MarkerPreview({ data }: Props) {
  if (!data) return <></>;
  if (data.overlayType === 'categorical') {
    const { overlayValues, allValuesSorted } = data;
    const allOtherValuesCount = allValuesSorted.reduce(
      (prev, curr) =>
        prev + (overlayValues.includes(curr.label) ? 0 : curr.count),
      0
    );
    const barplotData = {
      name: 'Location',
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
          dependentAxisLabel="Count (visible data)"
          barLayout="overlay"
          showValues={true}
        />
      </div>
    );
  } else {
    return <>Hi, you must be continuous. I'm Jeremy.</>;
  }
}
