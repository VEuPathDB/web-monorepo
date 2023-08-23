import React, { useCallback, useMemo } from 'react';
import {
  CategoricalVariableDataShape,
  Variable,
} from '../../../../core/types/study';
import { findEntityAndVariable } from '../../../../core/utils/study-metadata';
import {
  BarPlotMarkerConfiguration,
  BarPlotMarkerConfigurationMenu,
} from '../../MarkerConfiguration/BarPlotMarkerConfigurationMenu';
import {
  GetDataProps,
  MapTypeConfigPanelProps,
  MapTypeMapLayerProps,
  MapTypePlugin,
} from '../types';
import { getDefaultOverlayConfig } from '../../utils/defaultOverlayConfig';
import { GLOBAL_VIEWPORT } from '../../hooks/standaloneMapMarkers';
import {
  AllValuesDefinition,
  OverlayConfig,
  StandaloneMapMarkersRequestParams,
  StandaloneMapMarkersResponse,
} from '../../../../core/api/DataClient/types';
import { getDefaultAxisRange } from '../../../../core/utils/computeDefaultAxisRange';
import { NumberRange } from '@veupathdb/components/lib/types/general';
import { mFormatter } from '../../../../core/utils/big-number-formatters';
import ChartMarker, {
  ChartMarkerProps,
  ChartMarkerStandalone,
} from '@veupathdb/components/lib/map/ChartMarker';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';
import { UNSELECTED_DISPLAY_TEXT, UNSELECTED_TOKEN } from '../../..';
import { LegendItemsProps } from '@veupathdb/components/lib/components/plotControls/PlotListLegend';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import { defaultAnimation } from '../shared';
import {
  useDataClient,
  useFindEntityAndVariable,
  useSubsettingClient,
} from '../../../../core/hooks/workspace';
import { DraggableLegendPanel } from '../../DraggableLegendPanel';
import { MapLegend } from '../../MapLegend';
import { filtersFromBoundingBox } from '../../../../core/utils/visualization';
import { usePromise } from '../../../../core';
import { getCategoricalValues } from '../../utils/categoricalValues';
import { sharedStandaloneMarkerProperties } from '../../MarkerConfiguration/CategoricalMarkerPreview';
import { useToggleStarredVariable } from '../../../../core/hooks/starredVariables';
import { leastAncestralEntity } from '../../../../core/utils/data-element-constraints';
import DraggableVisualization from '../../DraggableVisualization';
import { useStandaloneVizPlugins } from '../../hooks/standaloneVizPlugins';

interface BarMarkerData {
  markersData: ChartMarkerProps[];
  totalVisibleWithOverlayEntityCount: number;
  totalVisibleEntityCount: number;
  legendItems: LegendItemsProps[];
  overlayConfig: OverlayConfig;
}

const displayName = 'Bar plots';

export const plugin: MapTypePlugin<BarMarkerData> = {
  displayName,
  getData,
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
};

async function getData(props: GetDataProps): Promise<BarMarkerData> {
  const {
    appState,
    geoConfigs,
    configuration,
    studyId,
    filters,
    studyEntities,
    dataClient,
    subsettingClient,
  } = props;

  const { boundsZoomLevel } = appState;

  const {
    selectedVariable,
    selectedPlotMode,
    dependentAxisLogScale,
    binningMethod,
  } = configuration as BarPlotMarkerConfiguration;

  const geoConfig = geoConfigs[0];

  const { entity: overlayEntity, variable: overlayVariable } =
    findEntityAndVariable(studyEntities, selectedVariable) ?? {};

  if (overlayEntity == null || overlayVariable == null) {
    throw new Error(
      'Could not find overlay variable: ' + JSON.stringify(selectedVariable)
    );
  }

  if (!Variable.is(overlayVariable)) {
    throw new Error('Not a variable');
  }

  const outputEntity = leastAncestralEntity(
    [overlayEntity, geoConfig.entity],
    studyEntities
  );
  const outputEntityId = outputEntity?.id;

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

  const overlayConfig = await getDefaultOverlayConfig({
    studyId,
    filters,
    overlayEntity,
    overlayVariable,
    dataClient,
    subsettingClient,
    binningMethod,
  });

  // check all required vizConfigs are provided
  if (
    overlayConfig == null ||
    geoConfig == null ||
    latitudeVariable == null ||
    longitudeVariable == null ||
    geoAggregateVariable == null ||
    outputEntityId == null
  )
    throw new Error('Oops');

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

  const requestParams: StandaloneMapMarkersRequestParams = {
    studyId,
    filters: filters || [],
    config: {
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      overlayConfig,
      outputEntityId,
      valueSpec: selectedPlotMode,
      viewport,
    },
  };

  const rawMarkersData = await dataClient.getStandaloneMapMarkers(
    'standalone-map',
    requestParams
  );
  const vocabulary =
    overlayConfig?.overlayType === 'categorical' // switch statement style guide time!!
      ? (overlayConfig.overlayValues as string[])
      : overlayConfig?.overlayType === 'continuous'
      ? overlayConfig.overlayValues.map((ov) =>
          typeof ov === 'object' ? ov.binLabel : ''
        )
      : [];

  const totalVisibleEntityCount: number | undefined =
    rawMarkersData.mapElements.reduce((acc, curr) => {
      return acc + curr.entityCount;
    }, 0);

  // calculate minPos, max and sum for chart marker dependent axis
  // assumes the value is a count! (so never negative)
  const { valueMax, valueMinPos, countSum } = rawMarkersData.mapElements
    .flatMap((el) => ('overlayValues' in el ? el.overlayValues : []))
    .reduce(
      ({ valueMax, valueMinPos, countSum }, elem) => ({
        valueMax: Math.max(elem.value, valueMax),
        valueMinPos:
          elem.value > 0 && (valueMinPos == null || elem.value < valueMinPos)
            ? elem.value
            : valueMinPos,
        countSum: countSum + elem.count,
      }),
      {
        valueMax: 0,
        valueMinPos: Infinity,
        countSum: 0,
      }
    );

  const defaultDependentAxisRange = getDefaultAxisRange(
    null,
    0,
    valueMinPos,
    valueMax,
    dependentAxisLogScale
  ) as NumberRange;

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const finalMarkersData = processRawMarkersData(
    rawMarkersData.mapElements,
    defaultDependentAxisRange,
    dependentAxisLogScale,
    vocabulary,
    overlayConfig?.overlayType
  );

  /**
   * create custom legend data
   */
  const legendItems: LegendItemsProps[] = vocabulary?.map((label) => ({
    label: fixLabelForOtherValues(label),
    marker: 'square',
    markerColor:
      overlayConfig?.overlayType === 'categorical'
        ? ColorPaletteDefault[vocabulary.indexOf(label)]
        : overlayConfig?.overlayType === 'continuous'
        ? gradientSequentialColorscaleMap(
            vocabulary.length > 1
              ? vocabulary.indexOf(label) / (vocabulary.length - 1)
              : 0.5
          )
        : undefined,
    // has any geo-facet got an array of overlay data
    // containing at least one element that satisfies label==label
    hasData: rawMarkersData.mapElements.some(
      (el) =>
        // TS says el could potentially be a number, and I don't know why
        typeof el === 'object' &&
        'overlayValues' in el &&
        el.overlayValues.some((ov) => ov.binLabel === label)
    ),
    group: 1,
    rank: 1,
  }));

  return {
    markersData: finalMarkersData,
    totalVisibleWithOverlayEntityCount: countSum,
    totalVisibleEntityCount,
    legendItems,
    overlayConfig,
  };
}

function ConfigPanelComponent(props: MapTypeConfigPanelProps) {
  const {
    analysisState,
    appState,
    geoConfigs,
    configuration,
    updateConfiguration,
    studyId,
    studyEntities,
    filters,
  } = props;

  const geoConfig = geoConfigs[0];
  const dataClient = useDataClient();
  const subsettingClient = useSubsettingClient();
  const { selectedVariable, binningMethod, dependentAxisLogScale } =
    configuration as BarPlotMarkerConfiguration;

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
    return [
      ...(props.analysisState.analysis?.descriptor.subset.descriptor ?? []),
      ...viewportFilters,
    ];
  }, [
    appState.boundsZoomLevel,
    geoConfig.entity.id,
    geoConfig.latitudeVariableId,
    geoConfig.longitudeVariableId,
    props.analysisState.analysis?.descriptor.subset.descriptor,
  ]);

  const allFilteredCategoricalValues = usePromise(
    useCallback(async (): Promise<AllValuesDefinition[] | undefined> => {
      /**
       * We only need this data for categorical vars, so we can return early if var isn't categorical
       */
      if (
        !overlayVariable ||
        !CategoricalVariableDataShape.is(overlayVariable.dataShape)
      )
        return;
      return getCategoricalValues({
        overlayEntity,
        subsettingClient,
        studyId,
        overlayVariable,
        filters,
      });
    }, [overlayEntity, overlayVariable, subsettingClient, studyId, filters])
  );

  const allVisibleCategoricalValues = usePromise(
    useCallback(async (): Promise<AllValuesDefinition[] | undefined> => {
      /**
       * Return early if:
       *  - overlay var isn't categorical
       *  - "Show counts for" toggle isn't set to 'visible'
       */
      if (
        !overlayVariable ||
        !CategoricalVariableDataShape.is(overlayVariable.dataShape) ||
        (configuration as BarPlotMarkerConfiguration).selectedCountsOption !==
          'visible'
      )
        return;

      return getCategoricalValues({
        overlayEntity,
        subsettingClient,
        studyId,
        overlayVariable,
        filters: filtersIncludingViewport,
      });
    }, [
      overlayVariable,
      configuration,
      overlayEntity,
      subsettingClient,
      studyId,
      filtersIncludingViewport,
    ])
  );

  const previewMarkerResult = usePromise(
    useCallback(
      () => getData({ ...props, dataClient, subsettingClient }),
      [dataClient, props, subsettingClient]
    )
  );

  const continuousMarkerPreview = useMemo(() => {
    if (
      !previewMarkerResult.value ||
      !previewMarkerResult.value.markersData.length ||
      !Array.isArray(previewMarkerResult.value.markersData[0].data)
    )
      return;
    const initialDataObject = previewMarkerResult.value.markersData[0].data.map(
      (data) => ({
        label: data.label,
        value: 0,
        ...(data.color ? { color: data.color } : {}),
      })
    );
    const finalData = previewMarkerResult.value.markersData.reduce(
      (prevData, currData) =>
        currData.data.map((data, index) => ({
          label: data.label,
          value: data.value + prevData[index].value,
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
        markerLabel={mFormatter(finalData.reduce((p, c) => p + c.value, 0))}
        dependentAxisLogScale={dependentAxisLogScale}
        {...sharedStandaloneMarkerProperties}
      />
    );
  }, [dependentAxisLogScale, previewMarkerResult.value]);

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const overlayConfiguration = usePromise(
    useCallback(
      () =>
        getDefaultOverlayConfig({
          studyId,
          filters,
          overlayEntity,
          overlayVariable,
          dataClient,
          subsettingClient,
          binningMethod,
        }),
      [
        studyId,
        filters,
        overlayEntity,
        overlayVariable,
        dataClient,
        subsettingClient,
        binningMethod,
      ]
    )
  );

  return (
    <BarPlotMarkerConfigurationMenu
      onChange={updateConfiguration}
      configuration={configuration as BarPlotMarkerConfiguration}
      overlayConfiguration={overlayConfiguration.value}
      overlayVariable={overlayVariable}
      subsettingClient={subsettingClient}
      studyId={studyId}
      filters={filters}
      continuousMarkerPreview={continuousMarkerPreview}
      allFilteredCategoricalValues={allFilteredCategoricalValues.value}
      allVisibleCategoricalValues={allVisibleCategoricalValues.value}
      inputs={[]}
      entities={studyEntities}
      starredVariables={
        analysisState.analysis?.descriptor.starredVariables ?? []
      }
      toggleStarredVariable={toggleStarredVariable}
    />
  );
}

function MapLayerComponent(props: MapTypeMapLayerProps<BarMarkerData>) {
  const markers = props.data.markersData.map((markerProps) => (
    <ChartMarker {...markerProps} />
  ));
  return <SemanticMarkers markers={markers} animation={defaultAnimation} />;
}

function MapOverlayComponent(props: MapTypeMapLayerProps<BarMarkerData>) {
  const { data, updateConfiguration } = props;
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

  const plugins = useStandaloneVizPlugins({
    selectedOverlayConfig: data.overlayConfig,
  });

  const toggleStarredVariable = useToggleStarredVariable(props.analysisState);

  return (
    <>
      <DraggableLegendPanel
        panelTitle={overlayVariable?.displayName}
        zIndex={2}
      >
        <div style={{ padding: '5px 10px' }}>
          <MapLegend
            isLoading={data.legendItems.length === 0}
            plotLegendProps={{ type: 'list', legendItems: data.legendItems }}
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
        zIndexForStackingContext={3}
      />
    </>
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
          ? overlayValues.map(({ binLabel, value }) => ({
              label: binLabel,
              value: value,
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
      } as ChartMarkerProps;
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
