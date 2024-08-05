import {
  // AllValuesDefinition,
  Filter,
  // OverlayConfig,
  StudyEntity,
} from '../../../core';
// import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots';
// import {
//   ChartMarkerStandalone,
//   getChartMarkerDependentAxisRange,
// } from '@veupathdb/components/lib/map/ChartMarker';
// import { DonutMarkerStandalone } from '@veupathdb/components/lib/map/DonutMarker';
// import { UNSELECTED_TOKEN } from '../../constants';
// import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  kFormatter,
  mFormatter,
} from '../../../core/utils/big-number-formatters';
// import { MAXIMUM_ALLOWABLE_VALUES } from './CategoricalMarkerConfigurationTable';
// import { PieMarkerConfiguration } from './PieMarkerConfigurationMenu';
import { useDistributionOverlayConfig } from '../mapTypes/shared';
// import { useMarkerData } from '../mapTypes/plugins/DonutMarkerMapType';
import { GeoConfig } from '../../../core/types/geoConfig';
import { sharedStandaloneMarkerProperties } from './CategoricalMarkerPreview';
import { MarkerDataProps } from '../mapTypes/plugins/BarMarkerMapType';
import { NumberRange } from '../../../core/types/general';
import { getChartMarkerDependentAxisRange } from '@veupathdb/components/lib/map/ChartMarker';

// type Props = {
//   overlayConfiguration: OverlayConfig | undefined;
//   mapType: 'barplot' | 'pie';
//   numberSelected: number;
//   allFilteredCategoricalValues: AllValuesDefinition[] | undefined;
//   isDependentAxisLogScaleActive?: boolean;
// };

// export const sharedStandaloneMarkerProperties = {
//   markerScale: 2.5,
//   containerStyles: {
//     width: 'fit-content',
//     height: 'fit-content',
//     margin: 'auto',
//   },
// };

type SharedStandaloneMarkerProps = typeof sharedStandaloneMarkerProperties;

interface StandaloneMarkerProps extends SharedStandaloneMarkerProps {
  data: any;
  markerLabel: string;
  dependentAxisRange?: NumberRange | null;
  dependentAxisLogScale?: boolean;
}

type ContinuousMarkerPreviewProps = {
  configuration: any;
  studyId: string;
  filters: Filter[] | undefined;
  studyEntities: StudyEntity[];
  geoConfigs: GeoConfig[];
  useMarkerData: (props: MarkerDataProps) => any;
  valueSpec: 'count' | 'proportion';
  StandaloneMarkerComponent: (props: StandaloneMarkerProps) => JSX.Element;
  numberFormat?: 'k' | 'm';
  useCountAsValue?: boolean;
};

export function ContinuousMarkerPreview({
  configuration,
  studyId,
  filters,
  studyEntities,
  geoConfigs,
  useMarkerData,
  valueSpec,
  StandaloneMarkerComponent,
  numberFormat = 'k',
  useCountAsValue = false,
}: ContinuousMarkerPreviewProps) {
  const {
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
  } = configuration;

  const overlayConfigQueryResult = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

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
    (data: any) => ({
      label: data.label,
      value: 0,
      count: 0,
      ...(data.color ? { color: data.color } : {}),
    })
  );

  const finalData = previewMarkerResult.markerProps.reduce(
    (prevData: any, currData: any) =>
      currData.data.map((data: any, index: any) => ({
        label: data.label,
        value: !useCountAsValue
          ? data.value + prevData[index].value
          : data.count + prevData[index].count,
        count: data.count + prevData[index].count,
        ...('color' in prevData[index]
          ? { color: prevData[index].color }
          : 'color' in data
          ? { color: data.color }
          : {}),
      })),
    initialDataObject
  );

  const numberFormatter = numberFormat === 'm' ? mFormatter : kFormatter;

  return (
    // Might need to just return the data instead of the standalone marker component
    <StandaloneMarkerComponent
      data={finalData}
      markerLabel={numberFormatter(
        finalData.reduce(
          (p: any, c: any) => p + (!useCountAsValue ? c.value : c.count),
          0
        )
      )}
      dependentAxisLogScale={dependentAxisLogScale}
      dependentAxisRange={
        dependentAxisLogScale &&
        getChartMarkerDependentAxisRange(finalData, dependentAxisLogScale)
      }
      {...sharedStandaloneMarkerProperties}
    />
  );
}
