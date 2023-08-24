import BubbleMarker, {
  BubbleMarkerProps,
} from '@veupathdb/components/lib/map/BubbleMarker';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import { getValueToGradientColorMapper } from '@veupathdb/components/lib/types/plots/addOns';
import { TabbedDisplayProps } from '@veupathdb/coreui/lib/components/grids/TabbedDisplay';
import { capitalize, get, sumBy } from 'lodash';
import { useCallback, useMemo } from 'react';
import {
  CategoricalVariableDataShape,
  Variable,
  useFindEntityAndVariable,
} from '../../../../core';
import {
  BubbleOverlayConfig,
  StandaloneMapBubblesLegendRequestParams,
  StandaloneMapBubblesLegendResponse,
  StandaloneMapBubblesRequestParams,
  StandaloneMapBubblesResponse,
} from '../../../../core/api/DataClient/types';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
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
import { GLOBAL_VIEWPORT } from '../../hooks/standaloneMapMarkers';
import { useStandaloneVizPlugins } from '../../hooks/standaloneVizPlugins';
import { getDefaultBubbleOverlayConfig } from '../../utils/defaultOverlayConfig';
import { defaultAnimation } from '../shared';
import {
  GetDataProps,
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../types';
import { leastAncestralEntity } from '../../../../core/utils/data-element-constraints';
import DraggableVisualization from '../../DraggableVisualization';

const displayName = 'Bubbles';

export const plugin: MapTypePlugin<BubbleMarkerData> = {
  displayName,
  getData,
  ConfigPanelComponent: BubbleMapConfigurationPanel,
  MapLayerComponent: BubbleMapLayer,
  MapOverlayComponent: BubbleLegends,
};

interface BubbleMarkerData {
  markersData: BubbleMarkerProps[];
  totalVisibleWithOverlayEntityCount: number;
  totalVisibleEntityCount: number;
  bubbleLegendData: StandaloneMapBubblesLegendResponse;
  bubbleValueToDiameterMapper: (value: number) => number;
  bubbleValueToColorMapper?: (value: number) => string;
  overlayConfig: BubbleOverlayConfig;
}

async function getData(props: GetDataProps): Promise<BubbleMarkerData> {
  const {
    boundsZoomLevel,
    configuration,
    geoConfigs,
    studyId,
    filters,
    studyEntities,
    dataClient,
  } = props;

  const geoConfig = geoConfigs[0];

  const { selectedVariable, numeratorValues, denominatorValues, aggregator } =
    configuration as BubbleMarkerConfiguration;

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

  const outputEntity = leastAncestralEntity(
    [overlayEntity, geoConfig.entity],
    studyEntities
  );
  const outputEntityId = outputEntity?.id;

  const overlayConfig: BubbleOverlayConfig = {
    overlayVariable: {
      entityId: overlayEntity.id,
      variableId: overlayVariable.id,
    },
    aggregationConfig: CategoricalVariableDataShape.is(
      overlayVariable.dataShape
    )
      ? {
          overlayType: 'categorical',
          numeratorValues: numeratorValues ?? overlayVariable.vocabulary ?? [],
          denominatorValues:
            denominatorValues ?? overlayVariable.vocabulary ?? [],
        }
      : {
          overlayType: 'continuous',
          aggregator: aggregator ?? 'mean',
        },
  };

  // prepare some info that the map-markers and overlay requests both need
  const { latitudeVariable, longitudeVariable } =
    geoConfig == null || geoConfig.entity.id == null
      ? {
          latitudeVariable: undefined,
          longitudeVariable: undefined,
        }
      : {
          latitudeVariable: {
            entityId: geoConfig.entity.id,
            variableId: geoConfig.latitudeVariableId,
          },
          longitudeVariable: {
            entityId: geoConfig.entity.id,
            variableId: geoConfig.longitudeVariableId,
          },
        };
  // handle the geoAggregateVariable separately because it changes with zoom level
  // and we don't want that to change overlayVariableAndEntity etc because that invalidates
  // the overlayConfigPromise

  const geoAggregateVariable =
    geoConfig != null
      ? {
          entityId: geoConfig.entity.id,
          variableId:
            // if boundsZoomLevel is undefined, we'll default to geoConfig.aggregationVariableIds[0]
            geoConfig.aggregationVariableIds[
              boundsZoomLevel?.zoomLevel != null
                ? geoConfig.zoomLevelToAggregationLevel(
                    boundsZoomLevel.zoomLevel
                  ) - 1
                : 0
            ],
        }
      : undefined;

  if (
    geoConfig == null ||
    latitudeVariable == null ||
    longitudeVariable == null ||
    geoAggregateVariable == null ||
    outputEntityId == null
  )
    throw new Error('Something went wrong.');

  const viewport = boundsZoomLevel
    ? {
        latitude: {
          xMin: boundsZoomLevel.bounds.southWest.lat,
          xMax: boundsZoomLevel.bounds.northEast.lat,
        },
        longitude: {
          left: boundsZoomLevel.bounds.southWest.lng,
          right: boundsZoomLevel.bounds.northEast.lng,
        },
      }
    : GLOBAL_VIEWPORT;

  if (
    numeratorValues?.length === 0 ||
    denominatorValues?.length === 0 ||
    !validateProportionValues(numeratorValues, denominatorValues)
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

  const legendRequestParams: StandaloneMapBubblesLegendRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      outputEntityId,
      colorLegendConfig: {
        geoAggregateVariable: {
          entityId: geoConfig.entity.id,
          variableId: geoConfig.aggregationVariableIds.at(-1) as string,
        },
        quantitativeOverlayConfig: overlayConfig,
      },
      sizeConfig: {
        geoAggregateVariable: {
          entityId: geoConfig.entity.id,
          variableId: geoConfig.aggregationVariableIds[0],
        },
      },
    },
  };

  const [rawMarkersData, bubbleLegendData] = await Promise.all([
    dataClient.getStandaloneBubbles('standalone-map', markerRequestParams),
    dataClient.getStandaloneBubblesLegend(
      'standalone-map',
      legendRequestParams
    ),
  ]);

  const totalVisibleEntityCount = rawMarkersData.mapElements.reduce(
    (acc, curr) => {
      return acc + curr.entityCount;
    },
    0
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
    bubbleLegendData: adjustedBubbleLegendData,
    bubbleValueToDiameterMapper,
    bubbleValueToColorMapper,
    overlayConfig,
  };
}

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

  // TODO
  // - [ ] Move overlayVariable logic to here
  const findEntityAndVariable = useFindEntityAndVariable();

  const { variable: overlayVariable, entity: overlayEntity } =
    findEntityAndVariable(markerConfiguration.selectedVariable) ?? {};

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
  const activeOverlayConfig = useMemo((): BubbleOverlayConfig | undefined => {
    return getDefaultBubbleOverlayConfig({
      studyId,
      filters,
      overlayVariable,
      overlayEntity,
      aggregator: get(markerConfiguration, 'aggregator'),
      numeratorValues: get(markerConfiguration, 'numeratorValues'),
      denominatorValues: get(markerConfiguration, 'denominatorValues'),
    });
  }, [studyId, filters, overlayVariable, overlayEntity, markerConfiguration]);

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: activeOverlayConfig,
  });

  const configurationMenu = (
    <BubbleMarkerConfigurationMenu
      entities={studyEntities}
      onChange={updateConfiguration}
      configuration={markerConfiguration as BubbleMarkerConfiguration}
      overlayConfiguration={
        activeOverlayConfig && 'aggregationConfig' in activeOverlayConfig
          ? activeOverlayConfig
          : undefined
      }
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
function BubbleMapLayer(props: MapTypeMapLayerProps<BubbleMarkerData>) {
  const markers = props.data.markersData.map((markerProps) => (
    <BubbleMarker {...markerProps} />
  ));
  return <SemanticMarkers markers={markers} animation={defaultAnimation} />;
}

function BubbleLegends(props: MapTypeMapLayerProps<BubbleMarkerData>) {
  const { pending, error, data, updateConfiguration } = props;
  const configuration = props.configuration as BubbleMarkerConfiguration;
  const findEntityAndVariable = useFindEntityAndVariable();
  const { variable: overlayVariable } =
    findEntityAndVariable(configuration.selectedVariable) ?? {};
  const {
    bubbleLegendData,
    bubbleValueToDiameterMapper,
    bubbleValueToColorMapper,
  } = data;
  const setActiveVisualizationId = useCallback(
    (activeVisualizationId?: string) => {
      updateConfiguration({
        ...configuration,
        activeVisualizationId,
      });
    },
    [configuration, updateConfiguration]
  );

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: data.overlayConfig,
  });

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  return (
    <>
      <DraggableLegendPanel panelTitle="Count" zIndex={2}>
        <div style={{ padding: '5px 10px' }}>
          <MapLegend
            isLoading={pending}
            plotLegendProps={{
              type: 'bubble',
              legendMax: bubbleLegendData?.maxSizeValue ?? 0,
              valueToDiameterMapper: bubbleValueToDiameterMapper,
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
            isLoading={pending}
            plotLegendProps={{
              type: 'colorscale',
              legendMin: bubbleLegendData?.minColorValue ?? 0,
              legendMax: bubbleLegendData?.maxColorValue ?? 0,
              valueToColorMapper: bubbleValueToColorMapper ?? (() => 'white'),
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

      {error && (
        <FloatingDiv
          style={{
            top: undefined,
            bottom: 50,
            left: 100,
            right: 100,
          }}
        >
          <div>{String(error)}</div>
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
