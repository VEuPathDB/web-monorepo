import {
  IsEnabledInPickerParams,
  VisualizationProps,
} from '../VisualizationTypes';
import MapSVG from './selectorIcons/MapSVG';
import * as t from 'io-ts';
import { isEqual } from 'lodash';

// map component related imports
import MapVEuMap, {
  MapVEuMapProps,
  baseLayers,
} from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';

// general ui imports
import { FormControl, Select, MenuItem, InputLabel } from '@material-ui/core';

// viz-related imports
import { PlotLayout } from '../../layouts/PlotLayout';
import { useStudyEntities, useStudyMetadata } from '../../../hooks/workspace';
import { useMemo, useCallback, useState } from 'react';
import { useVizConfig } from '../../../hooks/visualizations';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { OutputEntityTitle } from '../OutputEntityTitle';
import PluginError from '../PluginError';
import { VariableDescriptor } from '../../../types/variable';
import { InputVariables } from '../InputVariables';
import { VariablesByInputName } from '../../../utils/data-element-constraints';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';
import { useCheckedLegendItems } from '../../../hooks/checkedLegendItemsStatus';
import { variableDisplayWithUnit } from '../../../utils/variable-display';
import { BirdsEyeView } from '../../BirdsEyeView';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import { MouseMode } from '@veupathdb/components/lib/map/MouseTools';
import { VariableCoverageTable } from '../../VariableCoverageTable';
import { createVisualizationPlugin } from '../VisualizationPlugin';

import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import { Toggle } from '@veupathdb/coreui';
import { LayoutOptions } from '../../layouts/types';
import { useMapMarkers } from '../../../hooks/mapMarkers';

export const mapVisualization = createVisualizationPlugin({
  selectorIcon: MapSVG,
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

export const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

export type MapConfig = t.TypeOf<typeof MapConfig>;
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
    outputEntityId: t.string, // UNUSED/DEPRECATED
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

interface Options extends LayoutOptions {}

function MapViz(props: VisualizationProps<Options>) {
  const {
    options,
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
  const entities = useStudyEntities(filters);

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    MapConfig,
    createDefaultConfig,
    updateConfiguration
  );

  if (geoConfigs.length === 1 && vizConfig.geoEntityId === undefined)
    updateVizConfig({ geoEntityId: geoConfigs[0].entity.id });

  const handleViewportChanged: MapVEuMapProps['onViewportChanged'] =
    useCallback(
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

  // get variable constraints for InputVariables
  const pieOverview = otherVizOverviews.find(
    (overview) => overview.name === 'map-markers-overlay'
  );
  if (pieOverview == null)
    throw new Error('Map visualization cannot find map-markers-overlay helper');
  const pieConstraints = pieOverview.dataElementConstraints;
  const pieDependencyOrder = pieOverview.dataElementDependencyOrder;

  const {
    markers,
    totalEntityCount,
    completeCasesAllVars,
    completeCases,
    vocabulary,
    legendItems,
    pending,
    basicMarkerError,
    overlayError,
    outputEntity,
    xAxisVariable,
  } = useMapMarkers({
    requireOverlay: true,
    boundsZoomLevel,
    geoConfig,
    studyId,
    filters,
    computationType: computation.descriptor.type,
    xAxisVariable: vizConfig.xAxisVariable,
    markerType: vizConfig.markerType,
    dependentAxisLogScale: vizConfig.dependentAxisLogScale,
    checkedLegendItems: vizConfig.checkedLegendItems,
    overlayDataElementConstraints: pieConstraints,
  });

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
        showSpinner={pending}
        // whether to show scale at map
        showScale={zoomLevel != null && zoomLevel > 4 ? true : false}
        // show mouse tool
        showMouseToolbar={true}
        mouseMode={vizConfig.mouseMode ?? createDefaultConfig().mouseMode}
        onMouseModeChange={onMouseModeChange}
      />
    </>
  );

  const controlsNode = (
    <>
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
            <Toggle
              label={'Log scale'}
              value={vizConfig.dependentAxisLogScale ?? false}
              onChange={onDependentAxisLogScaleChange}
              disabled={
                vizConfig.markerType == null || vizConfig.markerType === 'pie'
              }
              themeRole="primary"
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

  const [checkedLegendItems, setCheckedLegendItems] = useCheckedLegendItems(
    legendItems,
    vizConfig.checkedLegendItems,
    updateVizConfig,
    vocabulary
  );

  const legendNode = legendItems != null && xAxisVariable != null && (
    <PlotLegend
      type="list"
      legendItems={legendItems}
      checkedLegendItems={checkedLegendItems}
      onCheckedLegendItemsChange={setCheckedLegendItems}
      legendTitle={variableDisplayWithUnit(xAxisVariable)}
      showOverlayLegend={true}
    />
  );

  const tableGroupNode = (
    <>
      <BirdsEyeView
        completeCasesAxesVars={totalEntityCount}
        completeCasesAllVars={completeCasesAllVars}
        outputEntity={outputEntity}
        stratificationIsActive={
          false /* this disables the 'strata and axes' bar/impulse */
        }
        // enableSpinner={vizConfig.xAxisVariable != null && !overlayData.error}
        totalCounts={totalCounts.value}
        filteredCounts={filteredCounts.value}
      />
      {!pending && completeCases != null ? (
        <VariableCoverageTable
          completeCases={completeCases}
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
              variable: completeCases[1].variableDetails,
            },
          ]}
        />
      ) : null}
    </>
  );

  const LayoutComponent = options?.layoutComponent ?? PlotLayout;

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

      <PluginError error={basicMarkerError} outputSize={totalEntityCount} />
      <PluginError error={overlayError} outputSize={totalEntityCount} />
      <OutputEntityTitle entity={outputEntity} outputSize={totalEntityCount} />
      <LayoutComponent
        isFaceted={false}
        legendNode={legendNode}
        plotNode={plotNode}
        controlsNode={controlsNode}
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
