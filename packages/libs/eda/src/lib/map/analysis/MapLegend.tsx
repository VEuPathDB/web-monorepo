import Spinner from '@veupathdb/components/lib/components/Spinner';
import PlotLegend, {
  PlotLegendProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';

interface Props {
  plotLegendProps: PlotLegendProps;
  isLoading: boolean;
  showCheckbox?: boolean;
}

export function MapLegend(props: Props) {
  const { plotLegendProps, isLoading, showCheckbox } = props;

  return isLoading ? (
    <div style={{ marginTop: '1em', height: 50, position: 'relative' }}>
      <Spinner size={20} />
    </div>
  ) : (
    <PlotLegend
      {...(plotLegendProps.type !== 'colorscale'
        ? { showOverlayLegend: true, showCheckbox: showCheckbox }
        : undefined)}
      containerStyles={{
        border: 'none',
        boxShadow: 'none',
        padding: 0,
        width: 'auto',
        maxWidth: 400,
      }}
      {...plotLegendProps}
    />
  );
}
