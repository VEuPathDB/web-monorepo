import { Close, FloatingButton, H5, Paragraph } from '@veupathdb/coreui';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Tooltip } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { mapNavigationBorder } from '..';
import { AnalysisState } from '../../core';
import PlaceholderIcon from '../../core/components/visualizations/PlaceholderIcon';
import { useVizIconColors } from '../../core/components/visualizations/implementations/selectorIcons/types';
import { GeoConfig } from '../../core/types/geoConfig';
import { ComputationAppOverview } from '../../core/types/visualization';
import './MapVizManagement.scss';
import { MarkerConfiguration, useAppState } from './appState';
import { ComputationPlugin } from '../../core/components/computations/Types';
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';
import { StartPage } from '../../core/components/computations/StartPage';

interface Props {
  activeVisualizationId: string | undefined;
  analysisState: AnalysisState;
  setActiveVisualizationId: ReturnType<
    typeof useAppState
  >['setActiveVisualizationId'];
  apps: ComputationAppOverview[];
  plugins: Partial<Record<string, ComputationPlugin>>;
  //  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
  geoConfigs: GeoConfig[];
  mapType?: MarkerConfiguration['type'];
  setHideVizInputsAndControls: (value: boolean) => void;
}

const mapVizManagementClassName = makeClassNameHelper('MapVizManagement');

export default function MapVizManagement({
  activeVisualizationId,
  analysisState,
  apps,
  geoConfigs,
  setActiveVisualizationId,
  plugins,
  mapType,
  setHideVizInputsAndControls,
}: Props) {
  const [isVizSelectorVisible, setIsVizSelectorVisible] = useState(false);

  function onVisualizationCreated(visualizationId: string) {
    setIsVizSelectorVisible(false);
    setActiveVisualizationId(visualizationId);
    setHideVizInputsAndControls(false);
  }

  if (!analysisState.analysis) return null;

  const visualizations = analysisState.getVisualizations();
  const totalVisualizationCount =
    visualizations?.filter(
      (viz) =>
        'applicationContext' in viz.descriptor &&
        viz.descriptor.applicationContext === mapType
    ).length ?? 0;

  const newVisualizationPicker = (
    <StartPage
      analysisState={analysisState}
      apps={apps}
      plugins={plugins}
      onVisualizationCreated={onVisualizationCreated}
      showHeading={false}
      tightLayout={true}
      applicationContext={mapType}
    />
  );

  if (totalVisualizationCount === 0)
    // When the user has no visualizations, they're presented with the Select a viz
    // picker in addition to some explanatory text.
    return (
      <div className={mapVizManagementClassName('-NewVizPicker')}>
        <H5
          additionalStyles={{
            margin: '0 0 5px 0',
          }}
        >
          Select a visualization
        </H5>
        <Paragraph
          styleOverrides={{
            margin: '0 0 5px 0',
          }}
        >
          Pick a visualization type to get started! If you update your subset,
          your visualizations will update when you reopen them.
        </Paragraph>
        {newVisualizationPicker}
      </div>
    );

  return (
    <div className={mapVizManagementClassName()}>
      <div className={mapVizManagementClassName('-VizListContainer')}>
        <div className={mapVizManagementClassName('-VizListHeaderContainer')}>
          {totalVisualizationCount > 0 && (
            <FloatingButton
              disabled={isVizSelectorVisible}
              themeRole="primary"
              text="New plot"
              size="medium"
              icon={Add}
              textTransform="none"
              onPress={() => {
                setActiveVisualizationId(undefined);
                setIsVizSelectorVisible(true);
              }}
            />
          )}
        </div>
        <H5 additionalStyles={{ margin: '0 0 15px 10px' }}>
          Plots ({totalVisualizationCount}):
        </H5>
        <VisualizationsList
          activeVisualizationId={activeVisualizationId}
          setActiveVisualizationId={setActiveVisualizationId}
          analysisState={analysisState}
          plugins={plugins}
          mapType={mapType}
        />
      </div>
      {isVizSelectorVisible && totalVisualizationCount > 0 && (
        <div
          style={{
            borderLeft: mapNavigationBorder,
          }}
          className={mapVizManagementClassName('-NewVizPicker')}
        >
          <div
            style={{
              // Pin the dismiss button to the right of the viz picker.
              alignSelf: 'flex-end',
            }}
          >
            <FloatingButton
              icon={Close}
              onPress={() => setIsVizSelectorVisible(false)}
              themeRole="secondary"
              text=""
              ariaLabel="Close visualization picker"
              size="small"
            />
          </div>
          <div>{newVisualizationPicker}</div>
        </div>
      )}
    </div>
  );
}

type VisualizationsListProps = {
  activeVisualizationId: Props['activeVisualizationId'];
  setActiveVisualizationId: Props['setActiveVisualizationId'];
  analysisState: AnalysisState;
  plugins: Props['plugins'];
  mapType?: MarkerConfiguration['type'];
};
function VisualizationsList({
  activeVisualizationId,
  setActiveVisualizationId,
  analysisState,
  plugins,
  mapType,
}: VisualizationsListProps) {
  const theme = useUITheme();
  if (analysisState.analysis == null) return null;
  const activeVisualization = analysisState.getVisualization(
    activeVisualizationId
  );
  const computations = analysisState.analysis.descriptor.computations;

  return (
    <ul className={mapVizManagementClassName('-VizList')}>
      {computations.map((computation) => (
        <li key={computation.computationId}>
          <ul className={mapVizManagementClassName('-VizList')}>
            {computation.visualizations
              .filter(
                (viz) =>
                  'applicationContext' in viz.descriptor &&
                  viz.descriptor.applicationContext === mapType
              )
              .map((viz) => {
                const vizIsActive =
                  activeVisualizationId === viz.visualizationId;
                const visualizationPlugins =
                  plugins[computation.descriptor.type]?.visualizationPlugins;
                return (
                  visualizationPlugins && (
                    <li
                      className={mapVizManagementClassName(
                        '-VizButtonItem',
                        vizIsActive ? 'active' : ''
                      )}
                      style={{
                        background: vizIsActive
                          ? theme?.palette.primary.hue[100]
                          : 'inherit',
                      }}
                      key={viz.visualizationId}
                    >
                      <button
                        className={mapVizManagementClassName('-VizButton')}
                        onClick={() => {
                          setActiveVisualizationId(
                            viz.visualizationId === activeVisualizationId
                              ? undefined
                              : viz.visualizationId
                          );
                        }}
                      >
                        {
                          <VisualizationIconOrPlaceholder
                            type={viz.descriptor.type}
                            visualizationPlugins={visualizationPlugins}
                          />
                        }
                        <span className={mapVizManagementClassName('-VizName')}>
                          {viz.displayName}
                        </span>
                      </button>
                      <div
                        className={mapVizManagementClassName(
                          '__copyAndDeleteButtons',
                          vizIsActive ? 'active' : ''
                        )}
                      >
                        <Tooltip title="Delete visualization">
                          <button
                            aria-label={`Delete ${
                              activeVisualization?.displayName ||
                              'visualization.'
                            }`}
                            type="button"
                            className="link"
                            onClick={() => {
                              analysisState.deleteVisualization(
                                viz.visualizationId
                              );
                              if (
                                activeVisualization?.visualizationId ===
                                viz.visualizationId
                              ) {
                                setActiveVisualizationId(undefined);
                              }
                            }}
                          >
                            <i aria-hidden className="fa fa-trash"></i>
                          </button>
                        </Tooltip>
                        <Tooltip title="Copy visualization">
                          <button
                            aria-label={`Create a copy of ${
                              viz.displayName || 'visualization.'
                            }`}
                            type="button"
                            className="link"
                            onClick={() => {
                              const vizCopyId = uuid();
                              const newViz = {
                                ...viz,
                                visualizationId: vizCopyId,
                                displayName:
                                  'Copy of ' +
                                  (viz.displayName || 'unnamed visualization'),
                              };
                              analysisState.addVisualization(
                                computation.computationId,
                                newViz
                              );
                              setActiveVisualizationId(vizCopyId);
                            }}
                          >
                            <i aria-hidden className="fa fa-clone"></i>
                          </button>
                        </Tooltip>
                      </div>
                    </li>
                  )
                );
              })}
          </ul>
        </li>
      ))}
    </ul>
  );
}
interface VisualizationIconOrPlaceholderProps {
  type: string;
  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
}
function VisualizationIconOrPlaceholder({
  type,
  visualizationPlugins,
}: VisualizationIconOrPlaceholderProps) {
  const colors = useVizIconColors();

  const enabledPlugin = visualizationPlugins[type];

  return (
    <div style={{ width: 40 }} aria-label={type}>
      {enabledPlugin ? (
        <enabledPlugin.selectorIcon {...colors} />
      ) : (
        <PlaceholderIcon name={type} />
      )}
    </div>
  );
}
