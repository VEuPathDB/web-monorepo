import { Close, FloatingButton, H5, Paragraph } from '@veupathdb/coreui';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Tooltip } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { mapNavigationBorder } from '..';
import { AnalysisState } from '../../core';
import PlaceholderIcon from '../../core/components/visualizations/PlaceholderIcon';
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';
import { NewVisualizationPickerGrouped } from '../../core/components/visualizations/VisualizationsContainer';
import { useVizIconColors } from '../../core/components/visualizations/implementations/selectorIcons/types';
import { GeoConfig } from '../../core/types/geoConfig';
import {
  Computation,
  ComputationAppOverview,
  Visualization,
} from '../../core/types/visualization';
import './MapVizManagement.scss';
import { useAppState } from './appState';

interface Props {
  activeVisualizationId: string | undefined;
  analysisState: AnalysisState;
  updateVisualizations: (
    visualizations:
      | Visualization[]
      | ((visualizations: Visualization[]) => Visualization[])
  ) => void;
  setActiveVisualizationId: ReturnType<
    typeof useAppState
  >['setActiveVisualizationId'];
  app: ComputationAppOverview;
  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
  geoConfigs: GeoConfig[];
}

const mapVizManagementClassName = makeClassNameHelper('MapVizManagement');

export default function MapVizManagement({
  activeVisualizationId,
  analysisState,
  app,
  geoConfigs,
  setActiveVisualizationId,
  updateVisualizations,
  visualizationPlugins,
}: Props) {
  const [isVizSelectorVisible, setIsVizSelectorVisible] = useState(false);
  function onVisualizationCreated(visualizationId: string) {
    setIsVizSelectorVisible(false);
    setActiveVisualizationId(visualizationId);
  }

  if (!analysisState.analysis) return null;

  const computations = analysisState.analysis.descriptor.computations;
  const totalVisualizationCount = computations.reduce((count, computation) => {
    return computation.visualizations.length + count;
  }, 0);

  if (totalVisualizationCount === 0)
    // When the user has no visualizations, they're presented with the Select a viz
    // picker in addition to some explanatory text.
    return (
      <div className={mapVizManagementClassName('-NewVizPicker')}>
        <H5>Select a visualization</H5>
        <Paragraph>
          Pick a visualization type to get started! If you update your subset,
          your visualizations will update when you reopen them.
        </Paragraph>
        <NewVisualizationPickerGrouped
          computation={computations[0]}
          updateVisualizations={updateVisualizations}
          visualizationPlugins={visualizationPlugins}
          visualizationsOverview={app.visualizations}
          geoConfigs={geoConfigs}
          onVisualizationCreated={onVisualizationCreated}
        />
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
        <H5 additionalStyles={{ marginBottom: 15, marginLeft: 10 }}>
          Plots ({totalVisualizationCount}):
        </H5>
        <VisualizationsList
          activeVisualizationId={activeVisualizationId}
          computations={computations}
          setActiveVisualizationId={setActiveVisualizationId}
          updateVisualizations={updateVisualizations}
          visualizationPlugins={visualizationPlugins}
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
          <div>
            <NewVisualizationPickerGrouped
              includeHeader
              computation={computations[0]}
              updateVisualizations={updateVisualizations}
              visualizationPlugins={visualizationPlugins}
              visualizationsOverview={app.visualizations}
              geoConfigs={geoConfigs}
              onVisualizationCreated={onVisualizationCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}

type VisualizationsListProps = {
  activeVisualizationId: Props['activeVisualizationId'];
  computations: Computation[];
  setActiveVisualizationId: Props['setActiveVisualizationId'];
  updateVisualizations: Props['updateVisualizations'];
  visualizationPlugins: Props['visualizationPlugins'];
};
function VisualizationsList({
  activeVisualizationId,
  computations,
  setActiveVisualizationId,
  updateVisualizations,
  visualizationPlugins,
}: VisualizationsListProps) {
  const theme = useUITheme();
  const activeVisualization = computations[0].visualizations.find(
    (viz) => viz.visualizationId === activeVisualizationId
  );

  return (
    <ul className={mapVizManagementClassName('-VizList')}>
      {computations.map((computation) => (
        <li key={computation.computationId}>
          <ul className={mapVizManagementClassName('-VizList')}>
            {computation.visualizations.map((viz) => {
              const vizIsActive = activeVisualizationId === viz.visualizationId;

              return (
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
                          activeVisualization?.displayName || 'visualization.'
                        }`}
                        type="button"
                        className="link"
                        onClick={() => {
                          updateVisualizations((visualizations) =>
                            visualizations.filter(
                              (v) => v.visualizationId !== viz.visualizationId
                            )
                          );
                          setActiveVisualizationId(undefined);
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
                          updateVisualizations((visualizations) =>
                            visualizations.concat({
                              ...viz,
                              visualizationId: vizCopyId,
                              displayName:
                                'Copy of ' +
                                (viz.displayName || 'unnamed visualization'),
                            })
                          );
                          setActiveVisualizationId(vizCopyId);
                        }}
                      >
                        <i aria-hidden className="fa fa-clone"></i>
                      </button>
                    </Tooltip>
                  </div>
                </li>
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
  visualizationPlugins: Props['visualizationPlugins'];
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
