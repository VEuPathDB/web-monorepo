import { useState, useCallback } from 'react';
import { FloatingButton, H5, Modal, Paragraph } from '@veupathdb/coreui';
import { v4 as uuid } from 'uuid';

import { AnalysisState } from '../../core';
import { NewVisualizationPickerGrouped } from '../../core/components/visualizations/VisualizationsContainer';
import { useAppState } from './appState';
import {
  ComputationAppOverview,
  Visualization,
} from '../../core/types/visualization';
import { GeoConfig } from '../../core/types/geoConfig';
import { Add } from '@material-ui/icons';
import { VisualizationPlugin } from '../../core/components/visualizations/VisualizationPlugin';
import { useVizIconColors } from '../../core/components/visualizations/implementations/selectorIcons/types';
import PlaceholderIcon from '../../core/components/visualizations/PlaceholderIcon';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import './MapVizManagement.scss';
import { Tooltip } from '@material-ui/core';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';

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

const MapVizManagementClassName = makeClassNameHelper('MapVizManagement');

export default function MapVizManagement({
  activeVisualizationId,
  analysisState,
  updateVisualizations,
  setActiveVisualizationId,
  geoConfigs,
  app,
  visualizationPlugins,
}: Props) {
  const [isVizSelectorVisible, setIsVizSelectorVisible] = useState(false);

  const computation = analysisState.analysis?.descriptor.computations[0];

  const onVisualizationCreated = useCallback(
    (visualizationId: string) => {
      setIsVizSelectorVisible(false);
      setActiveVisualizationId(visualizationId);
    },
    [setActiveVisualizationId, setIsVizSelectorVisible]
  );

  const activeVisualization = computation?.visualizations.find(
    (viz) => viz.visualizationId === activeVisualizationId
  );

  const computations = analysisState.analysis?.descriptor.computations;
  const hasSomeVisualizations =
    computations && computations[0].visualizations.length > 0;

  function UiWhenUserHasNoVisualizations() {
    return (
      <div className={MapVizManagementClassName('emptyState')}>
        <div className={MapVizManagementClassName('emptyStateHeadline')}></div>
        <H5>No plots to show yet.</H5>
        <Paragraph>
          Use plot tools, to make histograms, bar plots, box plots, scatter
          plots, 2x2 contingency tables, and mosaic plots for RxC contingency
          tables.
        </Paragraph>
        <Paragraph>
          You can also stratify by another variable. If you update your subset,
          no worries, your plot will update too when you reopen them.
        </Paragraph>
      </div>
    );
  }
  const totalVisualizationCount = computations?.reduce((acc, curr) => {
    return acc + curr.visualizations.length;
  }, 0);

  const theme = useUITheme();

  return (
    <div className={MapVizManagementClassName()}>
      <div>
        <div className={MapVizManagementClassName('vizListHeaderContainer')}>
          <FloatingButton
            themeRole="primary"
            text="New plot"
            size="medium"
            icon={Add}
            textTransform="none"
            onPress={() => setIsVizSelectorVisible(true)}
          />
        </div>
        {totalVisualizationCount && (
          <H5 additionalStyles={{ marginBottom: 15, marginLeft: 10 }}>
            Plots ({totalVisualizationCount}):
          </H5>
        )}
        {!hasSomeVisualizations && <UiWhenUserHasNoVisualizations />}
        <ul className={MapVizManagementClassName('vizList')}>
          {computations?.map((computation) => (
            <li key={computation.computationId}>
              <ul className={MapVizManagementClassName('vizList')}>
                {computation.visualizations.map((viz) => {
                  const vizIsActive =
                    activeVisualizationId === viz.visualizationId;

                  return (
                    <li
                      className={MapVizManagementClassName(
                        'vizButtonItem',
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
                        className={MapVizManagementClassName('vizButton')}
                        onClick={() => {
                          setActiveVisualizationId(
                            viz.visualizationId === activeVisualizationId
                              ? undefined
                              : viz.visualizationId
                          );
                        }}
                      >
                        {
                          <VizIconOrPlaceholder
                            type={viz.descriptor.type}
                            visualizationPlugins={visualizationPlugins}
                            iconProps={{
                              width: 20,
                            }}
                          />
                        }
                        <span className={MapVizManagementClassName('vizName')}>
                          {viz.displayName}
                        </span>
                      </button>
                      <div
                        className={MapVizManagementClassName(
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
                              updateVisualizations((visualizations) =>
                                visualizations.filter(
                                  (v) =>
                                    v.visualizationId !== viz.visualizationId
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
                                    (viz.displayName ||
                                      'unnamed visualization'),
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
      </div>
      {isVizSelectorVisible && (
        <div className={MapVizManagementClassName('NewVizPicker')}>
          <Modal
            themeRole="primary"
            title="Select a visualization"
            styleOverrides={{
              content: {
                padding: {
                  top: 20,
                  right: 30,
                  bottom: 20,
                  left: 30,
                },
              },
            }}
            visible={isVizSelectorVisible}
            toggleVisible={setIsVizSelectorVisible}
            includeCloseButton
          >
            <NewVisualizationPickerGrouped
              includeHeader
              computation={computation!}
              updateVisualizations={updateVisualizations}
              visualizationPlugins={visualizationPlugins}
              visualizationsOverview={app.visualizations}
              geoConfigs={geoConfigs}
              onVisualizationCreated={onVisualizationCreated}
            />
          </Modal>
        </div>
      )}
    </div>
  );
}

function VizIconOrPlaceholder({ type, visualizationPlugins }: any) {
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
