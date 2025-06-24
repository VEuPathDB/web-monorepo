import { useEffect } from 'react';
import { AnalysisState, useStudyRecord } from '../core';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { NotebookCell } from './NotebookCell';
import './EdaNotebook.scss';
import { createComputation } from '../core/components/computations/Utils';
import { presetNotebooks, NotebookCellDescriptor } from './NotebookPresets';
import { Computation } from '../core/types/visualization';
import { plugins } from '../core/components/computations/plugins';
import CoreUIThemeProvider from '@veupathdb/coreui/lib/components/theming/UIThemeProvider';
import { colors, H5 } from '@veupathdb/coreui';

// const NOTEBOOK_UI_SETTINGS_KEY = '@@NOTEBOOK@@';

interface Props {
  analysisState: AnalysisState;
  notebookType: string;
}

export function EdaNotebookAnalysis(props: Props) {
  const { analysisState, notebookType } = props;
  const { analysis, setComputations, addVisualization } = analysisState;

  const studyRecord = useStudyRecord();

  if (analysis == null) throw new Error('Cannot find analysis.');

  const notebookPreset = presetNotebooks[notebookType];
  if (notebookPreset == null)
    throw new Error(`Cannot find a notebook preset for ${notebookType}`);

  // One-off, create computations and visualizations in the analysis
  // (if needed) using the notebookPreset as a guide
  useEffect(() => {
    if (analysis == null) return;
    // if the analysis already has computations, then don't repeat this
    if (analysis.descriptor.computations.length > 0) return;

    // recursive function to handle computation and visualization creation
    function processCell(
      cell: NotebookCellDescriptor,
      parentComputationType?: string,
      parentComputationId?: string
    ) {
      if (cell.type === 'compute') {
        const computation = createComputation(
          cell.computationName,
          {},
          [],
          [],
          cell.computationId
        );
        setComputations((prev: Computation[]) => [...prev, computation]);

        // recurse into child cells (only from compute cells?)
        cell.cells?.forEach((child) =>
          processCell(child, cell.computationName, cell.computationId)
        );
      } else if (
        cell.type === 'visualization' &&
        parentComputationType != null &&
        parentComputationId != null
      ) {
        const appPlugin = plugins[parentComputationType];
        const vizPlugin =
          appPlugin && appPlugin.visualizationPlugins[cell.visualizationName];

        const visualizationId = cell.visualizationId;
        const visualization = {
          visualizationId,
          displayName: 'Unnamed visualization',
          descriptor: {
            type: cell.visualizationName,
            configuration: vizPlugin?.createDefaultConfig() ?? {},
          },
        };

        addVisualization(parentComputationId, visualization);
      }
    }

    // The recursion and state updates here work as intended because both
    // `setComputations` and `addVisualization` use the functional update form.
    // This ensures that updates are queued and applied in order, even across
    // multiple recursive calls.
    notebookPreset.cells.forEach((cell) => processCell(cell));
  }, [analysis, setComputations, addVisualization, notebookPreset]);

  //
  // Now we render the notebook directly from the read-only `notebookPreset`,
  // fetching computations and visualizations from analysisState.analysis where needed.
  //
  // If we need `notebookPreset` to be dynamic state (e.g. user can add/remove new cells)
  // or if we need to store cell configuration beyond what the computation and visualisation
  // descriptors in analysisState.analysis can handle, then we can change this to persisted
  // `notebookState` coming from analysisState.analysis.descriptor.subset.uiSettings[NOTEBOOK_UI_SETTINGS_KEY]
  //
  return (
    // The CoreUIThemeProvider should be moved elsewhere. Should go in the genomics form override.
    <CoreUIThemeProvider
      theme={{
        palette: {
          primary: { hue: colors.cyan, level: 600 },
          secondary: { hue: colors.mutedRed, level: 500 },
        },
      }}
    >
      <div className="EdaNotebook">
        <div className="Paper">
          {notebookPreset.header && <H5 text={notebookPreset.header} />}
          {analysis.descriptor.computations.length > 0 ? (
            notebookPreset.cells.map((cell, index) => (
              <NotebookCell
                key={index}
                analysisState={analysisState}
                cell={cell}
              />
            ))
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </CoreUIThemeProvider>
  );
}
