import React, { useCallback, useMemo } from 'react';
import { Variable } from '../../../../core/types/study';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
import {
  BarPlotMarkerConfiguration,
  BarPlotMarkerConfigurationMenu,
} from '../../MarkerConfiguration/BarPlotMarkerConfigurationMenu';
import {
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../types';
import {
  OverlayConfig,
  StandaloneMapMarkersResponse,
} from '../../../../core/api/DataClient/types';
import { getDefaultAxisRange } from '../../../../core/utils/computeDefaultAxisRange';
import { NumberRange } from '@veupathdb/components/lib/types/general';
import { mFormatter } from '../../../../core/utils/big-number-formatters';
import ChartMarker, {
  ChartMarkerStandalone,
  getChartMarkerDependentAxisRange,
} from '@veupathdb/components/lib/map/ChartMarker';
import {
  defaultAnimationDuration,
  defaultViewport,
} from '@veupathdb/components/lib/map/config/map';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../../constants';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import {
  DistributionMarkerDataProps,
  defaultAnimation,
  isApproxSameViewport,
  useCategoricalValues,
  useDistributionMarkerData,
  useDistributionOverlayConfig,
} from '../shared';
import {
  useFindEntityAndVariable,
  useSubsettingClient,
} from '../../../../core/hooks/workspace';
import { DraggableLegendPanel } from '../../DraggableLegendPanel';
import { MapLegend } from '../../MapLegend';
import { filtersFromBoundingBox } from '../../../../core/utils/visualization';
import { sharedStandaloneMarkerProperties } from '../../MarkerConfiguration/CategoricalMarkerPreview';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import DraggableVisualization from '../../DraggableVisualization';
import { useStandaloneVizPlugins } from '../../hooks/standaloneVizPlugins';
import {
  MapTypeConfigurationMenu,
  MarkerConfigurationOption,
} from '../../MarkerConfiguration/MapTypeConfigurationMenu';
import { BarPlotMarkerIcon } from '../../MarkerConfiguration/icons';
import { TabbedDisplayProps } from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';
import MapVizManagement from '../../MapVizManagement';
import Spinner from '@veupathdb/components/lib/components/Spinner';
import { MapFloatingErrorDiv } from '../../MapFloatingErrorDiv';
import { MapTypeHeaderCounts } from '../MapTypeHeaderCounts';
import { ChartMarkerPropsWithCounts } from '../../hooks/standaloneMapMarkers';

const displayName = 'Bar plots';

export const plugin: MapTypePlugin = {
  displayName,
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
  MapTypeHeaderDetails,
};

function ConfigPanelComponent(props: MapTypeConfigPanelProps) {
  const {
    apps,
    analysisState,
    appState,
    geoConfigs,
    updateConfiguration,
    studyId,
    studyEntities,
    filters,
  } = props;

  const geoConfig = geoConfigs[0];
  const subsettingClient = useSubsettingClient();
  const configuration = props.configuration as BarPlotMarkerConfiguration;
  const {
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
    selectedPlotMode,
  } = configuration;

  const { entity: overlayEntity, variable: overlayVariable } =
    findEntityAndVariable(studyEntities, selectedVariable) ?? {};

  if (
    overlayEntity == null ||
    overlayVariable == null ||
    !Variable.is(overlayVariable)
  ) {
    throw new Error(
      'Could not find overlay variable: ' + JSON.stringify(selectedVariable)
    );
  }

  const filtersIncludingViewport = useMemo(() => {
    const viewportFilters = appState.boundsZoomLevel
      ? filtersFromBoundingBox(
          appState.boundsZoomLevel.bounds,
          {
            variableId: geoConfig.latitudeVariableId,
            entityId: geoConfig.entity.id,
          },
          {
            variableId: geoConfig.longitudeVariableId,
            entityId: geoConfig.entity.id,
          }
        )
      : [];
    return [...(filters ?? []), ...viewportFilters];
  }, [
    appState.boundsZoomLevel,
    geoConfig.entity.id,
    geoConfig.latitudeVariableId,
    geoConfig.longitudeVariableId,
    filters,
  ]);

  const allFilteredCategoricalValues = useCategoricalValues({
    overlayEntity,
    studyId,
    overlayVariable,
    filters,
  });

  const allVisibleCategoricalValues = useCategoricalValues({
    overlayEntity,
    studyId,
    overlayVariable,
    filters: filtersIncludingViewport,
    enabled: configuration.selectedCountsOption === 'visible',
  });

  const previewMarkerData = useMarkerData({
    studyId,
    filters,
    studyEntities,
    geoConfigs,
    boundsZoomLevel: appState.boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
    valueSpec: selectedPlotMode,
  });

  const continuousMarkerPreview = useMemo(() => {
    if (
      !previewMarkerData ||
      !previewMarkerData.markerProps?.length ||
      !Array.isArray(previewMarkerData.markerProps[0].data)
    )
      return;
    const initialDataObject = previewMarkerData.markerProps[0].data.map(
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
    const finalData = previewMarkerData.markerProps.reduce(
      (prevData, currData) =>
        currData.data.map((data, index) => ({
          label: data.label,
          // here's the overwrite mentioned in the above comment
          value: data.count + prevData[index].count,
          count: data.count + prevData[index].count,
          ...('color' in prevData[index]
            ? { color: prevData[index].color }
            : 'color' in data
            ? { color: data.color }
            : {}),
        })),
      initialDataObject
    );
    return (
      <ChartMarkerStandalone
        data={finalData}
        markerLabel={mFormatter(finalData.reduce((p, c) => p + c.count, 0))}
        dependentAxisLogScale={dependentAxisLogScale}
        dependentAxisRange={getChartMarkerDependentAxisRange(
          finalData,
          dependentAxisLogScale
        )}
        {...sharedStandaloneMarkerProperties}
      />
    );
  }, [dependentAxisLogScale, previewMarkerData]);

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const overlayConfiguration = useDistributionOverlayConfig({
    studyId,
    filters,
    binningMethod,
    overlayVariableDescriptor: selectedVariable,
    selectedValues,
  });

  const markerVariableConstraints = apps
    .find((app) => app.name === 'standalone-map')
    ?.visualizations.find(
      (viz) => viz.name === 'map-markers'
    )?.dataElementConstraints;

  const configurationMenu = (
    <BarPlotMarkerConfigurationMenu
      onChange={updateConfiguration}
      configuration={configuration as BarPlotMarkerConfiguration}
      constraints={markerVariableConstraints}
      overlayConfiguration={overlayConfiguration.data}
      overlayVariable={overlayVariable}
      subsettingClient={subsettingClient}
      studyId={studyId}
      filters={filters}
      continuousMarkerPreview={continuousMarkerPreview}
      allFilteredCategoricalValues={allFilteredCategoricalValues.data}
      allVisibleCategoricalValues={allVisibleCategoricalValues.data}
      inputs={[{ name: 'overlayVariable', label: 'Overlay' }]}
      entities={studyEntities}
      starredVariables={
        analysisState.analysis?.descriptor.starredVariables ?? []
      }
      toggleStarredVariable={toggleStarredVariable}
    />
  );

  const markerConfigurationOption: MarkerConfigurationOption = {
    type: 'bubble',
    displayName,
    icon: (
      <BarPlotMarkerIcon style={{ height: '1.5em', marginLeft: '0.25em' }} />
    ),
    configurationMenu,
  };

  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      if (configuration == null) return;
      updateConfiguration({
        ...configuration,
        activeVisualizationId,
      });
    },
    [configuration, updateConfiguration]
  );

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: overlayConfiguration.data,
  });

  const mapTypeConfigurationMenuTabs: TabbedDisplayProps<
    'markers' | 'plots'
  >['tabs'] = [
    {
      key: 'markers',
      displayName: 'Markers',
      content: configurationMenu,
    },
    {
      key: 'plots',
      displayName: 'Supporting Plots',
      content: (
        <MapVizManagement
          analysisState={analysisState}
          setActiveVisualizationId={setActiveVisualizationId}
          apps={apps}
          activeVisualizationId={configuration.activeVisualizationId}
          plugins={plugins}
          geoConfigs={geoConfigs}
          mapType="barplot"
          setHideVizInputsAndControls={props.setHideVizInputsAndControls}
        />
      ),
    },
  ];

  return (
    <div
      style={{
        padding: '1em',
        maxWidth: '1500px',
      }}
    >
      <MapTypeConfigurationMenu
        markerConfiguration={markerConfigurationOption}
        mapTypeConfigurationMenuTabs={mapTypeConfigurationMenuTabs}
      />
    </div>
  );
}

function MapLayerComponent(props: MapTypeMapLayerProps) {
  const {
    studyEntities,
    studyId,
    filters,
    geoConfigs,
    appState: { boundsZoomLevel },
  } = props;
  const {
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
    selectedPlotMode,
  } = props.configuration as BarPlotMarkerConfiguration;
  const markerData = useMarkerData({
    studyEntities,
    studyId,
    filters,
    geoConfigs,
    boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
    valueSpec: selectedPlotMode,
  });

  if (markerData.error) return <MapFloatingErrorDiv error={markerData.error} />;

  const markers = markerData.markerProps?.map((markerProps) => (
    <ChartMarker {...markerProps} />
  ));

  return (
    <>
      {markerData.isFetching && <Spinner />}
      {markers && (
        <SemanticMarkers
          markers={markers}
          animation={defaultAnimation}
          flyToMarkers={
            !markerData.isFetching &&
            isApproxSameViewport(props.appState.viewport, defaultViewport)
          }
          flyToMarkersDelay={2000}
        />
      )}
    </>
  );
}

function MapOverlayComponent(props: MapTypeMapLayerProps) {
  const {
    studyEntities,
    studyId,
    filters,
    geoConfigs,
    appState: { boundsZoomLevel },
    updateConfiguration,
  } = props;
  const configuration = props.configuration as BarPlotMarkerConfiguration;
  const findEntityAndVariable = useFindEntityAndVariable();
  const { variable: overlayVariable } =
    findEntityAndVariable(configuration.selectedVariable) ?? {};

  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      updateConfiguration({
        ...configuration,
        activeVisualizationId,
      });
    },
    [configuration, updateConfiguration]
  );

  const markerData = useMarkerData({
    studyEntities,
    studyId,
    filters,
    geoConfigs,
    boundsZoomLevel,
    selectedVariable: configuration.selectedVariable,
    binningMethod: configuration.binningMethod,
    dependentAxisLogScale: configuration.dependentAxisLogScale,
    selectedValues: configuration.selectedValues,
    valueSpec: configuration.selectedPlotMode,
  });

  const legendItems = markerData.legendItems;

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: markerData.overlayConfig,
  });

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  return (
    <>
      <DraggableLegendPanel
        panelTitle={overlayVariable?.displayName}
        zIndex={3}
      >
        <div style={{ padding: '5px 10px' }}>
          <MapLegend
            isLoading={legendItems === null}
            plotLegendProps={{ type: 'list', legendItems: legendItems ?? [] }}
            showCheckbox={false}
          />
        </div>
      </DraggableLegendPanel>
      <DraggableVisualization
        analysisState={props.analysisState}
        visualizationId={configuration.activeVisualizationId}
        setActiveVisualizationId={setActiveVisualizationId}
        apps={props.apps}
        plugins={plugins}
        geoConfigs={props.geoConfigs}
        totalCounts={props.totalCounts}
        filteredCounts={props.filteredCounts}
        toggleStarredVariable={toggleStarredVariable}
        filters={props.filtersIncludingViewport}
        // onTouch={moveVizToTop}
        zIndexForStackingContext={2}
        hideInputsAndControls={props.hideVizInputsAndControls}
        setHideInputsAndControls={props.setHideVizInputsAndControls}
      />
    </>
  );
}

function MapTypeHeaderDetails(props: MapTypeMapLayerProps) {
  const {
    selectedVariable,
    binningMethod,
    selectedValues,
    dependentAxisLogScale,
    selectedPlotMode,
  } = props.configuration as BarPlotMarkerConfiguration;
  const markerDataResponse = useMarkerData({
    studyId: props.studyId,
    filters: props.filters,
    studyEntities: props.studyEntities,
    geoConfigs: props.geoConfigs,
    boundsZoomLevel: props.appState.boundsZoomLevel,
    selectedVariable,
    selectedValues,
    binningMethod,
    dependentAxisLogScale,
    valueSpec: selectedPlotMode,
  });
  return (
    <MapTypeHeaderCounts
      outputEntityId={selectedVariable.entityId}
      totalEntityCount={props.totalCounts.value?.[selectedVariable.entityId]}
      totalEntityInSubsetCount={
        props.filteredCounts.value?.[selectedVariable.entityId]
      }
      visibleEntityCount={markerDataResponse.totalVisibleWithOverlayEntityCount}
    />
  );
}

const processRawMarkersData = (
  mapElements: StandaloneMapMarkersResponse['mapElements'],
  defaultDependentAxisRange: NumberRange,
  dependentAxisLogScale: boolean,
  vocabulary?: string[],
  overlayType?: 'categorical' | 'continuous'
) => {
  return mapElements.map(
    ({
      geoAggregateValue,
      entityCount,
      avgLat,
      avgLon,
      minLat,
      minLon,
      maxLat,
      maxLon,
      overlayValues,
    }) => {
      const { bounds, position } = getBoundsAndPosition(
        minLat,
        minLon,
        maxLat,
        maxLon,
        avgLat,
        avgLon
      );

      const donutData =
        vocabulary && overlayValues && overlayValues.length
          ? overlayValues.map(({ binLabel, value, count }) => ({
              label: binLabel,
              value,
              count,
              color:
                overlayType === 'categorical'
                  ? ColorPaletteDefault[vocabulary.indexOf(binLabel)]
                  : gradientSequentialColorscaleMap(
                      vocabulary.length > 1
                        ? vocabulary.indexOf(binLabel) / (vocabulary.length - 1)
                        : 0.5
                    ),
            }))
          : [];

      // TO DO: address diverging colorscale (especially if there are use-cases)

      // now reorder the data, adding zeroes if necessary.
      const reorderedData =
        vocabulary != null
          ? vocabulary.map(
              (
                overlayLabel // overlay label can be 'female' or a bin label '(0,100]'
              ) =>
                donutData.find(({ label }) => label === overlayLabel) ?? {
                  label: fixLabelForOtherValues(overlayLabel),
                  value: 0,
                  count: 0,
                }
            )
          : // however, if there is no overlay data
            // provide a simple entity count marker in the palette's first colour
            [
              {
                label: 'unknown',
                value: entityCount,
                color: '#333',
              },
            ];

      const count =
        vocabulary != null && overlayValues // if there's an overlay (all expected use cases)
          ? overlayValues
              .filter(({ binLabel }) => vocabulary.includes(binLabel))
              .reduce((sum, { count }) => (sum = sum + count), 0)
          : entityCount; // fallback if not

      return {
        data: reorderedData,
        id: geoAggregateValue,
        key: geoAggregateValue,
        bounds,
        position,
        duration: defaultAnimationDuration,
        markerLabel: mFormatter(count),
        dependentAxisRange: defaultDependentAxisRange,
        dependentAxisLogScale,
      } as ChartMarkerPropsWithCounts;
    }
  );
};

const getBoundsAndPosition = (
  minLat: number,
  minLon: number,
  maxLat: number,
  maxLon: number,
  avgLat: number,
  avgLon: number
) => ({
  bounds: {
    southWest: { lat: minLat, lng: minLon },
    northEast: { lat: maxLat, lng: maxLon },
  },
  position: { lat: avgLat, lng: avgLon },
});

function fixLabelForOtherValues(input: string): string {
  return input === UNSELECTED_TOKEN ? UNSELECTED_DISPLAY_TEXT : input;
}

interface MarkerDataProps extends DistributionMarkerDataProps {
  dependentAxisLogScale: boolean;
}

function useMarkerData(props: MarkerDataProps) {
  const {
    data: markerData,
    error,
    isFetching,
    isPreviousData,
  } = useDistributionMarkerData(props);
  if (markerData == null) return { error, isFetching };

  const {
    mapElements,
    totalVisibleEntityCount,
    totalVisibleWithOverlayEntityCount,
    legendItems,
    overlayConfig,
  } = markerData;

  // calculate minPos, max and sum for chart marker dependent axis
  // assumes the value is a count! (so never negative)
  const { valueMax, valueMinPos } = mapElements
    .flatMap((el) => ('overlayValues' in el ? el.overlayValues : []))
    .reduce(
      ({ valueMax, valueMinPos }, elem) => ({
        valueMax: Math.max(elem.value, valueMax),
        valueMinPos:
          elem.value > 0 && (valueMinPos == null || elem.value < valueMinPos)
            ? elem.value
            : valueMinPos,
      }),
      {
        valueMax: 0,
        valueMinPos: Infinity,
      }
    );

  const defaultDependentAxisRange = getDefaultAxisRange(
    null,
    0,
    valueMinPos,
    valueMax,
    props.dependentAxisLogScale
  ) as NumberRange;

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const markerProps = processRawMarkersData(
    mapElements,
    defaultDependentAxisRange,
    props.dependentAxisLogScale,
    getVocabulary(overlayConfig),
    overlayConfig.overlayType
  );

  return {
    error,
    isFetching: isFetching || isPreviousData,
    markerProps,
    totalVisibleWithOverlayEntityCount,
    totalVisibleEntityCount,
    legendItems,
    overlayConfig,
    boundsZoomLevel: props.boundsZoomLevel,
  };
}

function getVocabulary(overlayConfig: OverlayConfig) {
  switch (overlayConfig.overlayType) {
    case 'categorical':
      return overlayConfig.overlayValues;
    case 'continuous':
      return overlayConfig.overlayValues.map((v) => v.binLabel);
    default:
      return [];
  }
}
