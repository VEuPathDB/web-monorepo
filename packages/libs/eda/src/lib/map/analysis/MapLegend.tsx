import Spinner from '@veupathdb/components/lib/components/Spinner';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';

interface Props {
  legendItems: LegendItemsProps[];
  isLoading: boolean;
  showCheckbox?: boolean;
}

export function MapLegend(props: Props) {
  const { legendItems, isLoading, showCheckbox } = props;

  return isLoading ? (
    <div style={{ marginTop: '1em', height: 50, position: 'relative' }}>
      <Spinner size={20} />
    </div>
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
  );
}
