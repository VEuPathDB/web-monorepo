import { Filter, StudyEntity } from '../../../core';
import {
  kFormatter,
  mFormatter,
} from '../../../core/utils/big-number-formatters';
import { useDistributionOverlayConfig } from '../mapTypes/shared';
import { GeoConfig } from '../../../core/types/geoConfig';
import { sharedStandaloneMarkerProperties } from './CategoricalMarkerPreview';
import { useMarkerData as useDonutMarkerData } from '../mapTypes/plugins/DonutMarkerMapType';
import { useMarkerData as useBarMarkerData } from '../mapTypes/plugins/BarMarkerMapType';
import {
  ChartMarkerStandalone,
  getChartMarkerDependentAxisRange,
} from '@veupathdb/components/lib/map/ChartMarker';
import { PieMarkerConfiguration } from './PieMarkerConfigurationMenu';
import { BarPlotMarkerConfiguration } from './BarPlotMarkerConfigurationMenu';
import { DonutMarkerStandalone } from '@veupathdb/components/lib/map/DonutMarker';

type Props = {
  configuration: PieMarkerConfiguration | BarPlotMarkerConfiguration;
  mapType: 'barplot' | 'pie';
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
};

export function ContinuousMarkerPreview({
  configuration,
  mapType,
  studyId,
  filters,
  studyEntities,
  geoConfigs,
}: Props) {
  const { selectedVariable, selectedValues, binningMethod } = configuration;

  const dependentAxisLogScale =
    'dependentAxisLogScale' in configuration
      ? configuration.dependentAxisLogScale
      : undefined;

  const overlayConfigQueryResult = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

  const useMarkerData =
    mapType === 'pie' ? useDonutMarkerData : useBarMarkerData;
  const valueSpec =
    mapType === 'pie'
      ? 'count'
      : (configuration as BarPlotMarkerConfiguration).selectedPlotMode;

  const previewMarkerResult = useMarkerData({
    studyId,
    filters, // no extra little filters; should reflect whole map and all time
    studyEntities,
    geoConfigs,
    selectedVariable: configuration.selectedVariable,
    binningMethod: configuration.binningMethod,
    selectedValues: configuration.selectedValues,
    valueSpec,
    overlayConfigQueryResult,
  });

  if (
    !previewMarkerResult ||
    !previewMarkerResult.markerProps?.length ||
    !Array.isArray(previewMarkerResult.markerProps[0].data)
  )
    return null;

  const initialDataObject = previewMarkerResult.markerProps[0].data.map(
    (data) => ({
      label: data.label,
      value: 0,
      count: 0,
      ...(data.color ? { color: data.color } : {}),
    })
  );

  /**
   * In the chart marker's proportion mode, the values are pre-calculated proportion values. Using these pre-calculated proportion values results
   * in an erroneous totalCount summation and some off visualizations in the marker previews. Since no axes/numbers are displayed in the marker
   * previews, let's just overwrite the value property with the count property.
   *
   * NOTE: the donut preview doesn't have proportion mode and was working just fine, but now it's going to receive count data that it neither
   * needs nor consumes.
   */
  const finalData = previewMarkerResult.markerProps.reduce(
    (prevData, currData) =>
      currData.data.map((data, index) => ({
        label: data.label,
        value:
          mapType === 'barplot'
            ? (data.count ?? 0) + prevData[index].count
            : data.value + prevData[index].value,
        count: (data.count ?? 0) + prevData[index].count,
        ...('color' in prevData[index]
          ? { color: prevData[index].color }
          : 'color' in data
          ? { color: data.color }
          : {}),
      })),
    initialDataObject
  );

  return mapType === 'pie' ? (
    <DonutMarkerStandalone
      data={finalData}
      markerLabel={kFormatter(finalData.reduce((p, c) => p + c.value, 0))}
      {...sharedStandaloneMarkerProperties}
    />
  ) : (
    <ChartMarkerStandalone
      data={finalData}
      markerLabel={mFormatter(finalData.reduce((p, c) => p + c.count, 0))}
      dependentAxisLogScale={dependentAxisLogScale}
      dependentAxisRange={
        dependentAxisLogScale
          ? getChartMarkerDependentAxisRange(finalData, dependentAxisLogScale)
          : undefined
      }
      {...sharedStandaloneMarkerProperties}
    />
  );
}
