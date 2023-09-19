import BubbleMarker, {
  BubbleMarkerProps,
} from '@veupathdb/components/lib/map/BubbleMarker';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import { getValueToGradientColorMapper } from '@veupathdb/components/lib/types/plots/addOns';
import { TabbedDisplayProps } from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';
import { capitalize, sumBy } from 'lodash';
import { useCallback, useMemo } from 'react';
import {
  useFindEntityAndVariable,
  Filter,
  useDataClient,
  useStudyEntities,
} from '../../../../core';
import {
  BubbleOverlayConfig,
  StandaloneMapBubblesLegendRequestParams,
  StandaloneMapBubblesRequestParams,
  StandaloneMapBubblesResponse,
} from '../../../../core/api/DataClient/types';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { DraggableLegendPanel } from '../../DraggableLegendPanel';
import { FloatingDiv } from '../../FloatingDiv';
import { MapLegend } from '../../MapLegend';
import MapVizManagement from '../../MapVizManagement';
import { BubbleMarkerConfigurationMenu } from '../../MarkerConfiguration';
import {
  BubbleMarkerConfiguration,
  validateProportionValues,
} from '../../MarkerConfiguration/BubbleMarkerConfigurationMenu';
import {
  MapTypeConfigurationMenu,
  MarkerConfigurationOption,
} from '../../MarkerConfiguration/MapTypeConfigurationMenu';
import { BubbleMarker as BubbleMarkerIcon } from '../../MarkerConfiguration/icons';
import { useStandaloneVizPlugins } from '../../hooks/standaloneVizPlugins';
import { getDefaultBubbleOverlayConfig } from '../../utils/defaultOverlayConfig';
import { defaultAnimation, useCommonData } from '../shared';
import {
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../types';
import DraggableVisualization from '../../DraggableVisualization';
import { VariableDescriptor } from '../../../../core/types/variable';
import { useQuery } from '@tanstack/react-query';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { GeoConfig } from '../../../../core/types/geoConfig';

const displayName = 'Bubbles';

export const plugin: MapTypePlugin<void> = {
  displayName,
  // getData,
  ConfigPanelComponent: BubbleMapConfigurationPanel,
  MapLayerComponent: BubbleMapLayer,
  MapOverlayComponent: BubbleLegends,
};

function BubbleMapConfigurationPanel(props: MapTypeConfigPanelProps) {
  const {
    apps,
    analysisState,
    studyEntities,
    updateConfiguration,
    studyId,
    filters,
    geoConfigs,
  } = props;

  const toggleStarredVariable = useToggleStarredVariable(analysisState);
  const markerConfiguration = props.configuration as BubbleMarkerConfiguration;

  const markerVariableConstraints = apps
    .find((app) => app.name === 'standalone-map')
    ?.visualizations.find(
      (viz) => viz.name === 'map-markers'
    )?.dataElementConstraints;

  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      if (markerConfiguration == null) return;
      updateConfiguration({
        ...markerConfiguration,
        activeVisualizationId,
      });
    },
    [markerConfiguration, updateConfiguration]
  );

  // If the variable or filters have changed on the active marker config
  // get the default overlay config.
  const activeOverlayConfig = useOverlayConfig({
    studyId,
    filters,
    ...markerConfiguration,
  });

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: activeOverlayConfig,
  });

  const configurationMenu = (
    <BubbleMarkerConfigurationMenu
      entities={studyEntities}
      onChange={updateConfiguration}
      configuration={markerConfiguration as BubbleMarkerConfiguration}
      overlayConfiguration={activeOverlayConfig}
      starredVariables={
        analysisState.analysis?.descriptor.starredVariables ?? []
      }
      toggleStarredVariable={toggleStarredVariable}
      constraints={markerVariableConstraints}
    />
  );

  const markerConfigurationOption: MarkerConfigurationOption = {
    type: 'bubble',
    displayName,
    icon: (
      <BubbleMarkerIcon style={{ height: '1.5em', marginLeft: '0.25em' }} />
    ),
    configurationMenu,
  };

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
          activeVisualizationId={markerConfiguration.activeVisualizationId}
          plugins={plugins}
          geoConfigs={geoConfigs}
          mapType="bubble"
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

/**
 * Renders marker and legend components
 */
function BubbleMapLayer(props: MapTypeMapLayerProps<void>) {
  const { studyId, filters, appState, configuration, geoConfigs } = props;
  const markersData = useMarkerData({
    boundsZoomLevel: appState.boundsZoomLevel,
    configuration: configuration as BubbleMarkerConfiguration,
    geoConfigs,
    studyId,
    filters,
  });
  if (markersData == null) return null;

  const markers = markersData.markersData.map((markerProps) => (
    <BubbleMarker {...markerProps} />
  ));
  return <SemanticMarkers markers={markers} animation={defaultAnimation} />;
}

function BubbleLegends(props: MapTypeMapLayerProps<void>) {
  const { studyId, filters, geoConfigs, appState, updateConfiguration } = props;
  const configuration = props.configuration as BubbleMarkerConfiguration;
  const findEntityAndVariable = useFindEntityAndVariable();
  const { variable: overlayVariable } =
    findEntityAndVariable(configuration.selectedVariable) ?? {};

  const legendData = useLegendData({
    studyId,
    filters,
    geoConfigs,
    configuration,
    boundsZoomLevel: appState.boundsZoomLevel,
  });

  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      updateConfiguration({
        ...configuration,
        activeVisualizationId,
      });
    },
    [configuration, updateConfiguration]
  );

  const plugins = useStandaloneVizPlugins({});

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  return (
    <>
      <DraggableLegendPanel panelTitle="Count" zIndex={2}>
        <div style={{ padding: '5px 10px' }}>
          <MapLegend
            isLoading={legendData.isLoading}
            plotLegendProps={{
              type: 'bubble',
              legendMax: legendData.data?.bubbleLegendData?.maxSizeValue ?? 0,
              valueToDiameterMapper:
                legendData.data?.bubbleValueToDiameterMapper,
            }}
          />
        </div>
      </DraggableLegendPanel>
      <DraggableLegendPanel
        panelTitle={overlayVariable?.displayName}
        zIndex={3}
        defaultPosition={{ x: window.innerWidth, y: 420 }}
      >
        <div style={{ padding: '5px 10px' }}>
          <MapLegend
            isLoading={legendData.isLoading}
            plotLegendProps={{
              type: 'colorscale',
              legendMin: legendData.data?.bubbleLegendData?.minColorValue ?? 0,
              legendMax: legendData.data?.bubbleLegendData?.maxColorValue ?? 0,
              valueToColorMapper:
                legendData.data?.bubbleValueToColorMapper ?? (() => 'white'),
            }}
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
      />

      {legendData.error && (
        <FloatingDiv
          style={{
            top: undefined,
            bottom: 50,
            left: 100,
            right: 100,
          }}
        >
          <div>{String(legendData.error)}</div>
        </FloatingDiv>
      )}
    </>
  );
}

const processRawBubblesData = (
  mapElements: StandaloneMapBubblesResponse['mapElements'],
  aggregationConfig?: BubbleOverlayConfig['aggregationConfig'],
  bubbleValueToDiameterMapper?: (value: number) => number,
  bubbleValueToColorMapper?: (value: number) => string
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
      overlayValue,
    }) => {
      const { bounds, position } = getBoundsAndPosition(
        minLat,
        minLon,
        maxLat,
        maxLon,
        avgLat,
        avgLon
      );

      // TO DO: address diverging colorscale (especially if there are use-cases)

      const bubbleData = {
        value: entityCount,
        diameter: bubbleValueToDiameterMapper?.(entityCount) ?? 0,
        colorValue: overlayValue,
        colorLabel: aggregationConfig
          ? aggregationConfig.overlayType === 'continuous'
            ? capitalize(aggregationConfig.aggregator)
            : 'Proportion'
          : undefined,
        color: bubbleValueToColorMapper?.(overlayValue),
      };

      return {
        id: geoAggregateValue,
        key: geoAggregateValue,
        bounds,
        position,
        duration: defaultAnimationDuration,
        data: bubbleData,
        markerLabel: String(entityCount),
      } as BubbleMarkerProps;
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

interface OverlayConfigProps {
  selectedVariable?: VariableDescriptor;
  studyId: string;
  filters?: Filter[];
  aggregator?: BubbleMarkerConfiguration['aggregator'];
  numeratorValues?: BubbleMarkerConfiguration['numeratorValues'];
  denominatorValues?: BubbleMarkerConfiguration['denominatorValues'];
}

function useOverlayConfig(props: OverlayConfigProps) {
  const {
    studyId,
    filters = [],
    aggregator,
    numeratorValues,
    denominatorValues,
    selectedVariable,
  } = props;
  const findEntityAndVariable = useFindEntityAndVariable();
  const entityAndVariable = findEntityAndVariable(selectedVariable);

  if (entityAndVariable == null)
    throw new Error(
      'Invalid selected variable: ' + JSON.stringify(selectedVariable)
    );
  const { entity: overlayEntity, variable: overlayVariable } =
    entityAndVariable;
  // If the variable or filters have changed on the active marker config
  // get the default overlay config.
  return useMemo(() => {
    return getDefaultBubbleOverlayConfig({
      studyId,
      filters,
      overlayVariable,
      overlayEntity,
      aggregator,
      numeratorValues,
      denominatorValues,
    });
  }, [
    studyId,
    filters,
    overlayVariable,
    overlayEntity,
    aggregator,
    numeratorValues,
    denominatorValues,
  ]);
}

interface DataProps {
  boundsZoomLevel?: BoundsViewport;
  configuration: BubbleMarkerConfiguration;
  geoConfigs: GeoConfig[];
  studyId: string;
  filters?: Filter[];
}

function useLegendData(props: DataProps) {
  const { boundsZoomLevel, configuration, geoConfigs, studyId, filters } =
    props;

  const studyEntities = useStudyEntities();

  const dataClient = useDataClient();

  const { selectedVariable, numeratorValues, denominatorValues, aggregator } =
    configuration as BubbleMarkerConfiguration;

  const { outputEntity, geoAggregateVariable } = useCommonData(
    selectedVariable,
    geoConfigs,
    studyEntities,
    boundsZoomLevel
  );

  const outputEntityId = outputEntity?.id;

  const overlayConfig = useOverlayConfig({
    studyId,
    filters,
    selectedVariable,
    aggregator,
    numeratorValues,
    denominatorValues,
  });

  if (
    numeratorValues?.length === 0 ||
    denominatorValues?.length === 0 ||
    !validateProportionValues(numeratorValues, denominatorValues)
  ) {
    throw new Error('Something is wrong with buuble config.');
  }

  const legendRequestParams: StandaloneMapBubblesLegendRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      outputEntityId,
      colorLegendConfig: {
        geoAggregateVariable,
        quantitativeOverlayConfig: overlayConfig,
      },
      sizeConfig: {
        geoAggregateVariable,
      },
    },
  };

  return useQuery({
    queryKey: ['bubbleMarkers', 'legendData', legendRequestParams],
    queryFn: async () => {
      const bubbleLegendData = await dataClient.getStandaloneBubblesLegend(
        'standalone-map',
        legendRequestParams
      );

      const adjustedSizeData =
        bubbleLegendData.minSizeValue === bubbleLegendData.maxSizeValue
          ? {
              minSizeValue: 0,
              maxSizeValue: bubbleLegendData.maxSizeValue || 1,
            }
          : undefined;

      const adjustedColorData =
        bubbleLegendData.minColorValue === bubbleLegendData.maxColorValue
          ? bubbleLegendData.maxColorValue >= 0
            ? {
                minColorValue: 0,
                maxColorValue: bubbleLegendData.maxColorValue || 1,
              }
            : {
                minColorValue: bubbleLegendData.minColorValue,
                maxColorValue: 0,
              }
          : undefined;

      const adjustedBubbleLegendData = {
        ...bubbleLegendData,
        ...adjustedSizeData,
        ...adjustedColorData,
      };

      const bubbleValueToDiameterMapper = (value: number) => {
        // const largestCircleArea = 9000;
        const largestCircleDiameter = 90;
        const smallestCircleDiameter = 10;

        // Area scales directly with value
        // const constant = largestCircleArea / maxOverlayCount;
        // const area = value * constant;
        // const radius = Math.sqrt(area / Math.PI);

        // Radius scales with log_10 of value
        // const constant = 20;
        // const radius = Math.log10(value) * constant;

        // Radius scales directly with value
        // y = mx + b, m = (y2 - y1) / (x2 - x1), b = y1 - m * x1
        const m =
          (largestCircleDiameter - smallestCircleDiameter) /
          (adjustedBubbleLegendData.maxSizeValue -
            adjustedBubbleLegendData.minSizeValue);
        const b =
          smallestCircleDiameter - m * adjustedBubbleLegendData.minSizeValue;
        const diameter = m * value + b;

        // return 2 * radius;
        return diameter;
      };

      const bubbleValueToColorMapper = getValueToGradientColorMapper(
        adjustedBubbleLegendData.minColorValue,
        adjustedBubbleLegendData.maxColorValue
      );

      return {
        bubbleLegendData: adjustedBubbleLegendData,
        bubbleValueToDiameterMapper,
        bubbleValueToColorMapper,
      };
    },
  });
}

function useMarkerData(props: DataProps) {
  const { boundsZoomLevel, configuration, geoConfigs, studyId, filters } =
    props;

  const studyEntities = useStudyEntities();
  const dataClient = useDataClient();

  const {
    outputEntity,
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
    viewport,
  } = useCommonData(
    configuration.selectedVariable,
    geoConfigs,
    studyEntities,
    boundsZoomLevel
  );

  const outputEntityId = outputEntity?.id;

  const overlayConfig = useOverlayConfig({
    studyId,
    filters,
    ...configuration,
  });

  if (
    configuration.numeratorValues?.length === 0 ||
    configuration.denominatorValues?.length === 0 ||
    !validateProportionValues(
      configuration.numeratorValues,
      configuration.denominatorValues
    )
  ) {
    throw new Error('Something is wrong with buuble config.');
  }

  const markerRequestParams: StandaloneMapBubblesRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      overlayConfig,
      outputEntityId,
      valueSpec: 'count',
      viewport,
    },
  };

  const rawMarkersDataResponse = useQuery({
    queryKey: ['bubblePlot', 'markerData', markerRequestParams],
    queryFn: () =>
      dataClient.getStandaloneBubbles('standalone-map', markerRequestParams),
  });

  const rawMarkersData = rawMarkersDataResponse.data;
  const legendData = useLegendData(props).data;

  if (rawMarkersData == null || legendData == null) return;

  const { bubbleValueToColorMapper, bubbleValueToDiameterMapper } = legendData;

  const totalVisibleEntityCount = rawMarkersData.mapElements.reduce(
    (acc, curr) => {
      return acc + curr.entityCount;
    },
    0
  );

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const finalMarkersData = processRawBubblesData(
    rawMarkersData.mapElements,
    overlayConfig.aggregationConfig,
    bubbleValueToDiameterMapper,
    bubbleValueToColorMapper
  );

  const totalVisibleWithOverlayEntityCount = sumBy(
    rawMarkersData.mapElements,
    'entityCount'
  );

  return {
    markersData: finalMarkersData,
    totalVisibleWithOverlayEntityCount,
    totalVisibleEntityCount,
  };
}
