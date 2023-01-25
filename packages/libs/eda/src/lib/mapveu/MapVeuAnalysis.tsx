import { useMemo, useState } from 'react';
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

const mapStyle: React.CSSProperties = {
  zIndex: 1,
};

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
  const [viewport, setViewport] = useState<Viewport>(() => ({
    center: [0, 0],
    zoom: 4,
  }));
  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();
  const [mouseMode, setMouseMode] = useState<MouseMode>('default');
  const geoConfig = geoConfigs[0];

  const [
    selectedVariables,
    setSelectedVariables,
  ] = useState<VariablesByInputName>({
    overlay: undefined,
  });

  const findEntityAndVariable = useFindEntityAndVariable();
  const { entity, variable } =
    findEntityAndVariable(selectedVariables.overlayVariable) ?? {};

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
    boundsZoomLevel,
    geoConfig: geoConfig,
    studyId: studyMetadata.id,
    filters: analysisState.analysis?.descriptor.subset.descriptor,
    // xAxisVariable: appState.overlayVariable,
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
          viewport={viewport}
          markers={finalMarkers}
          mouseMode={mouseMode}
          flyToMarkers={false}
          flyToMarkersDelay={500}
          onBoundsChanged={setBoundsZoomLevel}
          onViewportChanged={setViewport}
          onMouseModeChange={setMouseMode}
          showGrid={geoConfig?.zoomLevelToAggregationLevel !== null}
          zoomLevelToGeohashLevel={geoConfig?.zoomLevelToAggregationLevel}
        />
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
        top: 0,
        left: 0,
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
