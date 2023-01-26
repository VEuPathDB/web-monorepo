import { useCallback, useMemo, useState } from 'react';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import {
  makeNewAnalysis,
  useAnalysis,
  useFindEntityAndVariable,
  useStudyEntities,
  useStudyMetadata,
  useStudyRecord,
} from '../core';
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { BoundsViewport, Viewport } from '@veupathdb/components/lib/map/Types';
import { MouseMode } from '@veupathdb/components/lib/map/MouseTools';
import { useGeoConfig } from '../core/hooks/geoConfig';
import { useMapMarkers } from '../core/hooks/mapMarkers';
import { InputVariables } from '../core/components/visualizations/InputVariables';
import { VariablesByInputName } from '../core/utils/data-element-constraints';
import { useToggleStarredVariable } from '../core/hooks/starredVariables';
import { DocumentationContainer } from '../core/components/docs/DocumentationContainer';
import { VariableDescriptor } from '../core/types/variable';
import PlotLegend from '@veupathdb/components/lib/components/plotControls/PlotLegend';

const mapStyle: React.CSSProperties = {
  zIndex: 1,
};

interface AppState {
  viewport: Viewport;
  boundsZoomLevel?: BoundsViewport;
  mouseMode: MouseMode;
  selectedOverlayVariable?: VariableDescriptor;
}

interface Props {
  analysisId: string;
  studyId: string;
}
export function MapVeuAnalysis(props: Props) {
  const { analysisId } = props;
  const studyRecord = useStudyRecord();
  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();
  const geoConfigs = useGeoConfig(studyEntities);
  const analysisState = useAnalysis(analysisId);

  const {
    appState,
    setBoundsZoomLevel,
    setMouseMode,
    setSelectedVariables,
    setViewport,
  } = useAppState();

  const geoConfig = geoConfigs[0];

  const selectedVariables = useMemo(
    () => ({
      overlay: appState.selectedOverlayVariable,
    }),
    [appState.selectedOverlayVariable]
  );

  const findEntityAndVariable = useFindEntityAndVariable();
  const { entity, variable } =
    findEntityAndVariable(selectedVariables.overlay) ?? {};

  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const {
    markers,
    pending,
    legendItems,
    vocabulary,
    basicMarkerError,
    overlayError,
    totalEntityCount,
  } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel: appState.boundsZoomLevel,
    geoConfig: geoConfig,
    studyId: studyMetadata.id,
    filters: analysisState.analysis?.descriptor.subset.descriptor,
    xAxisVariable: selectedVariables.overlay,
    computationType: 'pass',
    markerType: 'pie',
    checkedLegendItems: undefined,
    //TO DO: maybe dependentAxisLogScale
  });

  const finalMarkers = useMemo(() => markers || [], [markers]);

  return (
    <DocumentationContainer>
      <div
        style={{
          height: '100%',
          position: 'relative',
        }}
      >
        <MapVEuMap
          height="100%"
          width="100%"
          style={mapStyle}
          showMouseToolbar
          showSpinner={pending}
          animation={null}
          viewport={appState.viewport}
          markers={finalMarkers}
          mouseMode={appState.mouseMode}
          flyToMarkers={false}
          flyToMarkersDelay={500}
          onBoundsChanged={setBoundsZoomLevel}
          onViewportChanged={setViewport}
          onMouseModeChange={setMouseMode}
          showGrid={geoConfig?.zoomLevelToAggregationLevel !== null}
          zoomLevelToGeohashLevel={geoConfig?.zoomLevelToAggregationLevel}
        />
        {legendItems.length > 0 && (
          <FloatingDiv
            style={{
              top: 50,
              right: 50,
            }}
          >
            <div>
              <strong>{variable?.displayName}</strong>
            </div>
            <PlotLegend
              type="list"
              legendItems={legendItems}
              showOverlayLegend
              checkedLegendItems={legendItems.map((item) => item.label)}
              containerStyles={{
                border: 'none',
                boxShadow: 'none',
                padding: 0,
                width: 'auto',
              }}
            />
          </FloatingDiv>
        )}
        <FloatingDiv
          style={{
            top: 10,
            left: 100,
          }}
        >
          <div>
            {safeHtml(studyRecord.displayName)} ({totalEntityCount})
          </div>
          <div>
            Showing {entity?.displayName} variable {variable?.displayName}
          </div>
          <div>
            <InputVariables
              inputs={[{ name: 'overlay', label: 'Overlay' }]}
              entities={studyEntities}
              selectedVariables={selectedVariables}
              onChange={setSelectedVariables}
              starredVariables={
                analysisState.analysis?.descriptor.starredVariables ?? []
              }
              toggleStarredVariable={toggleStarredVariable}
            />
          </div>
        </FloatingDiv>
        {(basicMarkerError || overlayError) && (
          <FloatingDiv
            style={{ top: undefined, bottom: 50, left: 100, right: 100 }}
          >
            {basicMarkerError && <div>{String(basicMarkerError)}</div>}
            {overlayError && <div>{String(overlayError)}</div>}
          </FloatingDiv>
        )}
      </div>
    </DocumentationContainer>
  );
}

function FloatingDiv(props: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1,
        padding: '1em',
        backgroundColor: 'white',
        border: '1px solid black',
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

function useAppState() {
  const [appState, setAppState] = useState<AppState>(() => ({
    viewport: {
      center: [0, 0],
      zoom: 4,
    },
    mouseMode: 'default',
  }));

  const setViewport = useCallback((viewport: Viewport) => {
    setAppState((prevState) => ({ ...prevState, viewport }));
  }, []);

  const setMouseMode = useCallback((mouseMode: MouseMode) => {
    setAppState((prevState) => ({ ...prevState, mouseMode }));
  }, []);

  const setBoundsZoomLevel = useCallback((boundsZoomLevel: BoundsViewport) => {
    setAppState((prevState) => ({ ...prevState, boundsZoomLevel }));
  }, []);

  const setSelectedVariables = useCallback(
    (selectedVariables: VariablesByInputName<'overlay'>) => {
      setAppState((prevState) => ({
        ...prevState,
        selectedOverlayVariable: selectedVariables.overlay,
      }));
    },
    []
  );

  return {
    appState,
    setViewport,
    setMouseMode,
    setBoundsZoomLevel,
    setSelectedVariables,
  };
}
