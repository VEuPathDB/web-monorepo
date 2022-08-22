import {
  IsEnabledInPickerParams,
  VisualizationProps,
} from '../VisualizationTypes';
import map from './selectorIcons/map.svg';
import * as t from 'io-ts';
import { isEqual, zip, some, sum } from 'lodash';

// map component related imports
import MapVEuMap, {
  MapVEuMapProps,
  baseLayers,
} from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import {
  BoundsViewport,
  Bounds,
  LatLng,
} from '@veupathdb/components/lib/map/Types';
import DonutMarker from '@veupathdb/components/lib/map/DonutMarker';
import ChartMarker from '@veupathdb/components/lib/map/ChartMarker';

import {
  ColorPaletteDefault,
  gradientSequentialColorscaleMap,
} from '@veupathdb/components/lib/types/plots/addOns';

// general ui imports
import { FormControl, Select, MenuItem, InputLabel } from '@material-ui/core';

// viz-related imports
import { PlotLayout } from '../../layouts/PlotLayout';
import {
  useDataClient,
  useFindEntityAndVariable,
  useStudyEntities,
  useStudyMetadata,
} from '../../../hooks/workspace';
import { useMemo, useCallback, useState, useEffect } from 'react';
import DataClient, {
  MapMarkersRequestParams,
  MapMarkersOverlayRequestParams,
  MapMarkersOverlayResponse,
} from '../../../api/DataClient';
import { useVizConfig } from '../../../hooks/visualizations';
import { usePromise } from '../../../hooks/promise';
// the next import is unused, but leaving it there as a reminder to
// test more types of variable in future (e.g. low cardinality numbers?)
import { fixLabelsForNumberVariables } from '../../../utils/visualization';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { values } from 'lodash';
import PluginError from '../PluginError';
import { VariableDescriptor } from '../../../types/variable';
import { InputVariables } from '../InputVariables';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import PlotLegend, {
  LegendItemsProps,
} from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { useCheckedLegendItemsStatus } from '../../../hooks/checkedLegendItemsStatus';
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import { BirdsEyeView } from '../../BirdsEyeView';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { MouseMode } from '@veupathdb/components/lib/map/MouseTools';
import { kFormatter, mFormatter } from '../../../utils/big-number-formatters';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { NumberVariable } from '../../../types/study';
import { BinSpec, NumberRange } from '../../../types/general';
import { createVisualizationPlugin } from '../VisualizationPlugin';

import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import { useDefaultAxisRange } from '../../../hooks/computeDefaultAxisRange';

const numContinuousBins = 8;

export const mapVisualization = createVisualizationPlugin({
  selectorIcon: map,
  fullscreenComponent: MapViz,
  createDefaultConfig: createDefaultConfig,
  isEnabledInPicker: isEnabledInPicker,
});

function createDefaultConfig() {
  return {
    mapCenterAndZoom: {
      latitude: 0,
      longitude: 0,
      zoomLevel: 2,
    },
    baseLayer: 'Street',
    dependentAxisLogScale: false,
    mouseMode: 'default',
  } as const;
}

function isEnabledInPicker({ geoConfigs }: IsEnabledInPickerParams): boolean {
  return geoConfigs != null && geoConfigs.length > 0;
}

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

type MapConfig = t.TypeOf<typeof MapConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const MapConfig = t.intersection([
  t.type({
    mapCenterAndZoom: t.type({
      latitude: t.number,
      longitude: t.number,
      zoomLevel: t.number,
    }),
    baseLayer: t.keyof(baseLayers),
  }),
  t.partial({
    geoEntityId: t.string,
    outputEntityId: t.string,
    xAxisVariable: VariableDescriptor,
    checkedLegendItems: t.array(t.string),
    markerType: t.keyof({
      count: null,
      proportion: null,
      pie: null,
    }),
    dependentAxisLogScale: t.boolean,
    mouseMode: t.keyof({
      default: null,
      magnification: null,
    }),
  }),
]);

type BasicMarkerData = {
  completeCasesGeoVar: number;
  markerData: {
    geoAggregateValue: string;
    entityCount: number;
    position: LatLng;
    bounds: Bounds;
    isAtomic: boolean;
  }[];
};

type MapMarkersOverlayData = Record<
  string,
  { entityCount: number; data: { label: string; value: number }[] }
>;

function MapViz(props: VisualizationProps) {
  const {
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    filters,
    totalCounts,
    filteredCounts,
    geoConfigs,
    otherVizOverviews,
    starredVariables,
    toggleStarredVariable,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useStudyEntities();
  const dataClient: DataClient = useDataClient();

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    MapConfig,
    createDefaultConfig,
    updateConfiguration
  );

  if (geoConfigs.length === 1 && vizConfig.geoEntityId === undefined)
    updateVizConfig({ geoEntityId: geoConfigs[0].entity.id });

  const handleViewportChanged: MapVEuMapProps['onViewportChanged'] = useCallback(
    ({ center, zoom }) => {
      if (center != null && center.length === 2 && zoom != null) {
        updateVizConfig({
          mapCenterAndZoom: {
            latitude: center[0],
            longitude: center[1],
            zoomLevel: zoom,
          },
        });
      }
    },
    [updateVizConfig]
  );

  // prettier-ignore
  const onChangeHandlerFactory = useCallback(
    < ValueType,>(key: keyof MapConfig) => (newValue?: ValueType) => {
      updateVizConfig({
	      [key] : newValue,
      });
    },
    [updateVizConfig]
  );

  const onMarkerTypeChange = onChangeHandlerFactory('markerType');

  const onDependentAxisLogScaleChange = onChangeHandlerFactory<boolean>(
    'dependentAxisLogScale'
  );

  const onMouseModeChange = onChangeHandlerFactory<MouseMode>('mouseMode');

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();

  const geoConfig = useMemo(() => {
    if (vizConfig.geoEntityId == null) return undefined;
    return geoConfigs.find(
      (config) => config.entity.id === vizConfig.geoEntityId
    );
  }, [vizConfig.geoEntityId, geoConfigs]);

  const findEntityAndVariable = useFindEntityAndVariable();
  const [outputEntity, xAxisVariable] = useMemo(() => {
    const geoEntity =
      vizConfig.geoEntityId !== null
        ? entities.find((entity) => entity.id === vizConfig.geoEntityId)
        : undefined;

    const outputEntityId =
      vizConfig.xAxisVariable?.entityId ??
      vizConfig.outputEntityId ??
      vizConfig.geoEntityId;
    const outputEntity =
      outputEntityId !== null
        ? entities.find((entity) => entity.id === outputEntityId)
        : undefined;

    const { variable: xAxisVariable } =
      findEntityAndVariable(vizConfig.xAxisVariable) ?? {};

    return [outputEntity ?? geoEntity, xAxisVariable];
  }, [
    entities,
    vizConfig.outputEntityId,
    vizConfig.geoEntityId,
    vizConfig.xAxisVariable,
    findEntityAndVariable,
  ]);

  // prepare some info that the map-markers and overlay requests both need
  const {
    latitudeVariable,
    longitudeVariable,
    geoAggregateVariable,
  } = useMemo(() => {
    if (
      boundsZoomLevel == null ||
      geoConfig == null ||
      vizConfig.geoEntityId == null
    )
      return {};

    const latitudeVariable = {
      entityId: vizConfig.geoEntityId,
      variableId: geoConfig.latitudeVariableId,
    };
    const longitudeVariable = {
      entityId: vizConfig.geoEntityId,
      variableId: geoConfig.longitudeVariableId,
    };
    const geoAggregateVariable = {
      entityId: vizConfig.geoEntityId,
      variableId:
        geoConfig.aggregationVariableIds[
          geoConfig.zoomLevelToAggregationLevel(boundsZoomLevel.zoomLevel) - 1
        ],
    };

    return {
      latitudeVariable,
      longitudeVariable,
      geoAggregateVariable,
    };
  }, [boundsZoomLevel, vizConfig.geoEntityId, geoConfig]);

  const basicMarkerData = usePromise<BasicMarkerData | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        vizConfig.geoEntityId == null ||
        geoConfig == null ||
        latitudeVariable == null ||
        longitudeVariable == null ||
        geoAggregateVariable == null ||
        outputEntity == null ||
        vizConfig.xAxisVariable == null
      )
        return undefined;

      const {
        northEast: { lat: xMax, lng: right },
        southWest: { lat: xMin, lng: left },
      } = boundsZoomLevel.bounds;

      // now prepare the rest of the request params
      const requestParams: MapMarkersRequestParams = {
        studyId,
        filters: filters || [],
        config: {
          outputEntityId: outputEntity.id, // might be quicker to use geoEntity.id but numbers in white markers will be wrong, momentarily
          geoAggregateVariable,
          latitudeVariable,
          longitudeVariable,
          viewport: {
            latitude: {
              xMin,
              xMax,
            },
            longitude: {
              left,
              right,
            },
          },
        },
      };

      // now get the data
      const response = await dataClient.getMapMarkers(
        computation.descriptor.type,
        requestParams
      );

      return {
        markerData: response.mapElements.map(
          ({
            avgLat,
            avgLon,
            minLat,
            minLon,
            maxLat,
            maxLon,
            entityCount,
            geoAggregateValue,
          }) => {
            const isAtomic = false; // TO DO: work with Danielle to get this info from back end
            return {
              geoAggregateValue,
              entityCount: entityCount,
              position: { lat: avgLat, lng: avgLon },
              bounds: {
                southWest: { lat: minLat, lng: minLon },
                northEast: { lat: maxLat, lng: maxLon },
              },
              isAtomic,
            };
          }
        ),
        completeCasesGeoVar: response.config.completeCasesGeoVar,
      };
    }, [
      studyId,
      filters,
      dataClient,
      // we don't want to allow vizConfig.mapCenterAndZoom to trigger an update,
      // because boundsZoomLevel does the same thing, but they can trigger two separate updates
      // (baseLayer doesn't matter either) - so we cherry pick properties of vizConfig
      vizConfig.geoEntityId,
      vizConfig.xAxisVariable,
      geoAggregateVariable,
      latitudeVariable,
      longitudeVariable,
      outputEntity,
      boundsZoomLevel,
      computation.descriptor.type,
      geoConfig,
    ])
  );

  const defaultOverlayRange = useDefaultAxisRange(xAxisVariable);

  /**
   * Now we deal with the optional second request to map-markers-overlay
   */
  const proportionMode = vizConfig.markerType === 'proportion';
  const overlayResponse = usePromise<MapMarkersOverlayResponse | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        vizConfig.xAxisVariable == null ||
        geoAggregateVariable == null ||
        outputEntity == null ||
        latitudeVariable == undefined ||
        longitudeVariable == undefined
      )
        return undefined;

      const {
        northEast: { lat: xMax, lng: right },
        southWest: { lat: xMin, lng: left },
      } = boundsZoomLevel.bounds;

      // For now, just calculate a static binSpec from variable metadata for numeric continous only
      // TO DO: date variables when we have testable data (UMSP has them but difficult to test, and back end was giving 500s)
      // date variables need special date maths for calculating the width, and probably rounding aggressively to whole months/years etc - not trivial.
      const binSpec: BinSpec | undefined =
        NumberVariable.is(xAxisVariable) &&
        defaultOverlayRange != null &&
        NumberRange.is(defaultOverlayRange)
          ? {
              range: defaultOverlayRange,
              type: 'binWidth',
              value:
                (defaultOverlayRange.max - defaultOverlayRange.min) /
                numContinuousBins,
            }
          : // : DateVariable.is(xAxisVariable) && DateRange.is(defaultOverlayRange) ? ... TO DO
            undefined;

      // prepare request
      const requestParams: MapMarkersOverlayRequestParams = {
        studyId,
        filters: filters || [],
        config: {
          outputEntityId: outputEntity.id,
          xAxisVariable: vizConfig.xAxisVariable,
          latitudeVariable: latitudeVariable,
          longitudeVariable: longitudeVariable,
          geoAggregateVariable: geoAggregateVariable,
          showMissingness: 'noVariables', // current back end 'showMissing' behaviour applies to facet variable
          valueSpec: proportionMode ? 'proportion' : 'count',
          binSpec: binSpec ?? {},
          viewport: {
            latitude: {
              xMin,
              xMax,
            },
            longitude: {
              left,
              right,
            },
          },
        },
      };

      // send request
      return await dataClient.getMapMarkersOverlay(
        computation.descriptor.type,
        requestParams
      );
    }, [
      studyId,
      dataClient,
      xAxisVariable,
      vizConfig.xAxisVariable,
      proportionMode,
      boundsZoomLevel,
      computation.descriptor.type,
      geoAggregateVariable,
      outputEntity,
      filters,
    ])
  );
  const overlayData = useMemo(() => {
    // process response and return a map of "geoAgg key" => donut labels and counts
    return !overlayResponse.pending && overlayResponse.value
      ? overlayResponse.value.mapMarkers.data.reduce(
          (map, { geoAggregateVariableDetails, label, value }) => {
            const geoAggKey = geoAggregateVariableDetails.value;
            if (overlayResponse.value)
              // don't know why TS makes us do this check *again*...
              map[geoAggKey] = {
                // sum up the entity count from the sampleSizeTable because
                // the data.label values might be proportions (and sum to 1)
                entityCount: sum(
                  overlayResponse.value.sampleSizeTable.find(
                    (item) =>
                      item.geoAggregateVariableDetails != null &&
                      item.geoAggregateVariableDetails.value === geoAggKey
                  )?.size
                ),
                data: zip(label, value).map(([label, value]) => ({
                  label: label!,
                  value: value!,
                })),
              };
            return map;
          },
          {} as MapMarkersOverlayData
        )
      : undefined;
  }, [overlayResponse]);

  const valueMax = useMemo(
    () =>
      overlayData
        ? values(overlayData) // it's a Record 'object'
            .map((record) => record.data)
            .flat() // flatten all the arrays into one
            .reduce(
              (accum, elem) => (elem.value > accum ? elem.value : accum),
              0
            ) // find max value
        : 0,
    [overlayData]
  );

  const valueMinPos = useMemo(
    () =>
      overlayData
        ? values(overlayData)
            .map((record) => record.data)
            .flat()
            .reduce<number | undefined>(
              (accum, elem) =>
                elem.value > 0 && (accum == null || elem.value < accum)
                  ? elem.value
                  : accum,
              undefined
            )
        : undefined,
    [overlayData]
  );

  const defaultDependentAxisRange = useDefaultAxisRange(
    null,
    0,
    valueMinPos,
    valueMax,
    vizConfig.dependentAxisLogScale
  ) as NumberRange;

  // If it's a string variable and a small vocabulary, use it as-is from the study metadata.
  // This ensures that for low cardinality categoricals, the colours are always the same.
  // Otherwise use the overlayValues from the back end (which are either bins or a Top7+Other)
  const vocabulary =
    xAxisVariable?.type === 'string' &&
    xAxisVariable?.vocabulary != null &&
    xAxisVariable.vocabulary.length <= 8
      ? xAxisVariable.vocabulary
      : overlayResponse.value?.mapMarkers.config.overlayValues;

  /**
   * Reset checkedLegendItems to all-checked (actually none checked)
   * if ANY of the checked items are NOT in the vocabulary
   * OR if ALL of the checked items ARE in the vocabulary
   *
   * TO DO: generalise this for use in other visualizations
   */
  useEffect(() => {
    if (vizConfig.checkedLegendItems == null || vocabulary == null) return;

    if (
      vizConfig.checkedLegendItems.some(
        (label) => vocabulary.findIndex((vocab) => vocab === label) === -1
      ) ||
      vizConfig.checkedLegendItems.length === vocabulary.length
    )
      updateVizConfig({ checkedLegendItems: undefined });
  }, [vocabulary, vizConfig.checkedLegendItems, updateVizConfig]);

  /**
   * Merge the overlay data into the basicMarkerData, if available,
   * and create markers.
   */
  const markers = useMemo(() => {
    if (vocabulary == null) return undefined;

    return basicMarkerData.value?.markerData.map(
      ({ geoAggregateValue, entityCount, bounds, position }) => {
        const donutData =
          overlayData?.[geoAggregateValue] != null
            ? overlayData[geoAggregateValue].data
                .map(({ label, value }) => ({
                  label,
                  value,
                  color:
                    xAxisVariable?.type === 'string'
                      ? ColorPaletteDefault[vocabulary.indexOf(label!)]
                      : gradientSequentialColorscaleMap(
                          vocabulary.indexOf(label!) / (vocabulary.length - 1)
                        ),
                }))
                // DonutMarkers don't handle checkedLegendItems automatically, like our
                // regular PlotlyPlot components, so we do the filtering here
                .filter(
                  ({ label }) =>
                    vizConfig.checkedLegendItems == null ||
                    vizConfig.checkedLegendItems.indexOf(label) > -1
                )
            : [];

        // now reorder the data, adding zeroes if necessary.
        const reorderedData = vocabulary.map(
          (
            overlayLabel // overlay label can be 'female' or a bin label '(0,100]'
          ) =>
            donutData.find(({ label }) => label === overlayLabel) ?? {
              label: overlayLabel,
              value: 0,
            }
        );

        // provide the 'plain white' donut data if all legend items unchecked
        // or if there is no overlay data
        const safeDonutData =
          reorderedData.length > 0
            ? reorderedData
            : [
                {
                  label: 'unknown',
                  value: entityCount,
                  color: 'white',
                },
              ];

        // TO DO: find out if MarkerProps.id is obsolete
        const MarkerComponent =
          vizConfig.markerType == null || vizConfig.markerType === 'pie'
            ? DonutMarker
            : ChartMarker;

        const count =
          overlayData != null
            ? vizConfig.markerType == null || vizConfig.markerType === 'pie'
              ? // pies always show sum of legend checked items (donutData is already filtered on checkboxes)
                donutData.reduce((sum, item) => (sum = sum + item.value), 0)
              : // the bar/histogram charts always show the constant entity count
                // however, if there is no data at all we can safely infer a zero
                overlayData[geoAggregateValue]?.entityCount ?? 0
            : entityCount;

        const formattedCount =
          MarkerComponent === ChartMarker
            ? mFormatter(count)
            : kFormatter(count);

        return (
          <MarkerComponent
            id={geoAggregateValue}
            key={geoAggregateValue}
            bounds={bounds}
            position={position}
            data={safeDonutData}
            duration={defaultAnimationDuration}
            markerLabel={formattedCount}
            {...(vizConfig.markerType !== 'pie'
              ? {
                  dependentAxisRange: defaultDependentAxisRange,
                  dependentAxisLogScale: vizConfig.dependentAxisLogScale,
                }
              : {})}
          />
        );
      }
    );
  }, [
    basicMarkerData.value,
    vocabulary,
    overlayData,
    vizConfig.checkedLegendItems,
    vizConfig.markerType,
    xAxisVariable,
    outputEntity,
    // add vizConfig.dependentAxisLogScale to reflect its state change
    vizConfig.dependentAxisLogScale,
  ]);

  const totalEntityCount = basicMarkerData.value?.completeCasesGeoVar;

  /**
   * Now render the visualization
   */
  const [height, width] = [600, 1000];
  const { latitude, longitude, zoomLevel } = vizConfig.mapCenterAndZoom;

  // Create the ref that we send to the map in web-components
  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    { height, width },
    // The dependencies for needing to generate a new thumbnail
    [
      markers,
      latitude,
      longitude,
      zoomLevel,
      vizConfig.baseLayer,
      vizConfig.checkedLegendItems,
      vizConfig.mouseMode,
    ]
  );

  const plotNode = (
    <>
      <MapVEuMap
        viewport={{ center: [latitude, longitude], zoom: zoomLevel }}
        onViewportChanged={handleViewportChanged}
        onBoundsChanged={setBoundsZoomLevel}
        markers={markers ?? []}
        animation={defaultAnimation}
        height={height}
        width={width}
        showGrid={geoConfig?.zoomLevelToAggregationLevel != null}
        zoomLevelToGeohashLevel={geoConfig?.zoomLevelToAggregationLevel}
        ref={plotRef}
        baseLayer={vizConfig.baseLayer}
        onBaseLayerChanged={(newBaseLayer) =>
          updateVizConfig({ baseLayer: newBaseLayer })
        }
        flyToMarkers={
          markers &&
          markers.length > 0 &&
          isEqual(
            vizConfig.mapCenterAndZoom,
            createDefaultConfig().mapCenterAndZoom
          )
        }
        flyToMarkersDelay={500}
        showSpinner={basicMarkerData.pending || overlayResponse.pending}
        // whether to show scale at map
        showScale={zoomLevel != null && zoomLevel > 4 ? true : false}
        // show mouse tool
        showMouseToolbar={true}
        mouseMode={vizConfig.mouseMode ?? createDefaultConfig().mouseMode}
        onMouseModeChange={onMouseModeChange}
      />
      <RadioButtonGroup
        label="Plot mode"
        selectedOption={vizConfig.markerType || 'pie'}
        options={['count', 'proportion', 'pie']}
        optionLabels={['Bar plot: count', 'Bar plot: proportion', 'Pie plot']}
        buttonColor={'primary'}
        onOptionSelected={onMarkerTypeChange}
        margins={['1em', '0', '1em', '1.5em']}
        itemMarginRight={40}
      />
      {/* Y-axis range control */}
      <div
        style={{ display: 'flex', flexDirection: 'row', marginLeft: '0.5em' }}
      >
        <LabelledGroup label="Y-axis controls">
          <div style={{ display: 'flex' }}>
            <Switch
              label="Log scale:"
              state={vizConfig.dependentAxisLogScale}
              onStateChange={onDependentAxisLogScaleChange}
              disabled={
                vizConfig.markerType == null || vizConfig.markerType === 'pie'
              }
            />
          </div>
        </LabelledGroup>
      </div>
    </>
  );

  const handleGeoEntityChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      if (event != null)
        updateVizConfig({
          geoEntityId: event.target.value as string,
          mapCenterAndZoom: createDefaultConfig().mapCenterAndZoom,
        });
    },
    [updateVizConfig]
  );

  const handleInputVariableChange = useCallback(
    ({ xAxisVariable }: VariablesByInputName) => {
      updateVizConfig({
        xAxisVariable,
        checkedLegendItems: undefined,
        dependentAxisLogScale: false,
      });
    },
    [updateVizConfig]
  );

  const handleCheckedLegendItemsChange = useCallback(
    (newCheckedItems) => {
      if (newCheckedItems != null)
        updateVizConfig({ checkedLegendItems: newCheckedItems });
    },
    [updateVizConfig]
  );

  /**
   * create custom legend data
   */

  const legendItems: LegendItemsProps[] = useMemo(() => {
    if (vocabulary == null) return [];

    return vocabulary.map((label) => ({
      label,
      marker: 'square',
      markerColor:
        xAxisVariable?.type === 'string'
          ? ColorPaletteDefault[vocabulary.indexOf(label)]
          : gradientSequentialColorscaleMap(
              vocabulary.indexOf(label) / (vocabulary.length - 1)
            ),
      // has any geo-facet got an array of overlay data
      // containing at least one element that satisfies label==label
      // (do not check that value > 0, because the back end doesn't return
      // zero counts, but does sometimes return near-zero counts that get
      // rounded to zero)
      hasData: overlayData
        ? some(overlayData, (pieData) =>
            some(pieData.data, (data) => data.label === label)
          )
        : false,
      group: 1,
      rank: 1,
    }));
  }, [xAxisVariable, vocabulary, overlayData]);

  // set checkedLegendItems
  const checkedLegendItems = useCheckedLegendItemsStatus(
    legendItems,
    vizConfig.checkedLegendItems
  );

  const legendNode = legendItems != null && xAxisVariable != null && (
    <PlotLegend
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      legendTitle={variableDisplayWithUnit(xAxisVariable)}
      onCheckedLegendItemsChange={handleCheckedLegendItemsChange}
      showOverlayLegend={true}
    />
  );

  // get variable constraints for InputVariables
  const pieOverview = otherVizOverviews.find(
    (overview) => overview.name === 'map-markers-overlay'
  );
  if (pieOverview == null)
    throw new Error('Map visualization cannot find map-markers-overlay helper');
  const pieConstraints = pieOverview.dataElementConstraints;
  const pieDependencyOrder = pieOverview.dataElementDependencyOrder;

  const tableGroupNode = (
    <>
      <BirdsEyeView
        completeCasesAxesVars={basicMarkerData.value?.completeCasesGeoVar}
        completeCasesAllVars={
          overlayResponse.value?.mapMarkers.config.completeCasesAllVars
        }
        outputEntity={outputEntity}
        stratificationIsActive={
          false /* this disables the 'strata and axes' bar/impulse */
        }
        // enableSpinner={vizConfig.xAxisVariable != null && !overlayData.error}
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      {!overlayResponse.pending && overlayResponse.value ? (
        <VariableCoverageTable
          completeCases={overlayResponse.value.completeCasesTable}
          filteredCounts={filteredCounts}
          outputEntityId={outputEntity?.id}
          variableSpecs={[
            {
              role: 'Main',
              required: true,
              display: variableDisplayWithUnit(xAxisVariable),
              variable: vizConfig.xAxisVariable,
            },
            {
              role: 'Geo',
              required: true,
              display: 'Geolocation',
              variable:
                overlayResponse.value.completeCasesTable[1].variableDetails,
            },
          ]}
        />
      ) : null}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          width,
          display: 'flex',
          alignItems: 'center',
          zIndex: 1,
          justifyContent: 'space-between',
        }}
      >
        {geoConfigs.length > 1 && (
          <FormControl style={{ minWidth: '200px' }} variant="filled">
            <InputLabel>Map the locations of</InputLabel>
            <Select
              value={vizConfig.geoEntityId ?? ''}
              onChange={handleGeoEntityChange}
            >
              {geoConfigs.map((geoConfig) => (
                <MenuItem key={geoConfig.entity.id} value={geoConfig.entity.id}>
                  {geoConfig.entity.displayNamePlural ??
                    geoConfig.entity.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <InputVariables
          inputs={[
            {
              name: 'xAxisVariable',
              label: 'Main',
            },
          ]}
          entities={entities}
          selectedVariables={{
            xAxisVariable: vizConfig.xAxisVariable,
          }}
          onChange={handleInputVariableChange}
          constraints={pieConstraints}
          dataElementDependencyOrder={pieDependencyOrder}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
          outputEntity={outputEntity}
        />
      </div>

      <PluginError
        error={basicMarkerData.error}
        outputSize={totalEntityCount}
      />
      <PluginError
        error={overlayResponse.error}
        outputSize={totalEntityCount}
      />
      <OutputEntityTitle entity={outputEntity} outputSize={totalEntityCount} />
      <PlotLayout
        isFaceted={false}
        legendNode={legendNode}
        plotNode={plotNode}
        tableGroupNode={tableGroupNode}
        /**
         * unlike all other visualizations, dataElementsContraints does not include xAxisVariable as a required variable;
         * thus, we're directly coercing a boolean as to whether or not the required variable has been chosen
         */
        showRequiredInputsPrompt={!vizConfig.xAxisVariable}
      />
    </div>
  );
}
