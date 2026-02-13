import { useEffect, useMemo } from 'react';
import { AnalysisState } from '../core';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { NotebookCell } from './NotebookCell';
import './EdaNotebook.scss';
import { createComputation } from '../core/components/computations/Utils';
import { presetNotebooks, NotebookCellDescriptor } from './NotebookPresets';
import { Computation } from '../core/types/visualization';
import { plugins } from '../core/components/computations/plugins';
import { H5 } from '@veupathdb/coreui';
import colors from '@veupathdb/coreui/lib/definitions/colors';
import ShowHideVariableContextProvider from '../core/utils/show-hide-variable-context';
import {
  Parameter,
  ParameterValues,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

// const NOTEBOOK_UI_SETTINGS_KEY = '@@NOTEBOOK@@';

// Type of function that we'll call updateWdkParamValue. It's
// adapted from one called updateParamValue used around the wdk and used
// to update values of parameters that come from the wdk.
export type UpdateParamValue = (
  parameter: Parameter,
  newParamValue: string
) => void;

export interface WdkState {
  queryName: string;
  parameters: Parameter[];
  paramValues: ParameterValues;
  updateParamValue: UpdateParamValue;
}

interface Props {
  analysisState: AnalysisState;
  notebookType: string;
  wdkState: WdkState;
}

export function EdaNotebookAnalysis(props: Props) {
  const { analysisState, notebookType, wdkState } = props;
  const { analysis, setComputations, addVisualization } = analysisState;

  if (analysis == null) throw new Error('Cannot find analysis.');

  const notebookPreset = presetNotebooks[notebookType];
  if (notebookPreset == null)
    throw new Error(`Cannot find a notebook preset for ${notebookType}`);

  // Check to ensure the notebook is valid for this project
  const projectId = useWdkService(
    async (wdkService) => (await wdkService.getConfig()).projectId
  );

  if (
    notebookPreset.projects &&
    projectId &&
    !notebookPreset.projects.includes(projectId)
  ) {
    throw new Error(
      `Notebook preset ${notebookType} is not valid for project ${projectId}`
    );
  }

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
        const appPlugin = plugins[cell.computationName];
        const computation = createComputation(
          cell.computationName,
          appPlugin.createDefaultConfiguration(),
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
    console.log('createdcells');
  }, [analysis, setComputations, addVisualization, notebookPreset]);

  console.log('notebookpreset', notebookPreset);

  // Pre-compute step numbers for all cells with numberedHeader: true.
  // Uses a depth-first walk so nested cells (e.g. volcano inside DE compute)
  // get sequential numbers. The Map is stable across partial re-renders.
  const stepNumbers = useMemo(() => {
    const map = new Map<NotebookCellDescriptor, number>();
    let n = 0;
    (function walk(cells: NotebookCellDescriptor[]) {
      for (const cell of cells) {
        if (cell.numberedHeader) map.set(cell, ++n);
        if ('cells' in cell && cell.cells) walk(cell.cells);
      }
    })(notebookPreset.cells);
    return map;
  }, [notebookPreset]);

  //
  // Now we render the notebook directly from the read-only `notebookPreset`,
  // fetching computations and visualizations from analysisState.analysis where needed.
  //
  // If we need `notebookPreset` to be dynamic state (e.g. user can add/remove new cells)
  // or if we need to store cell configuration beyond what the computation and visualisation
  // descriptors in analysisState.analysis and wdkParams can handle, then we can change this to persisted
  // `notebookState` coming from analysisState.analysis.descriptor.subset.uiSettings[NOTEBOOK_UI_SETTINGS_KEY]
  //
  return (
    <ShowHideVariableContextProvider defaultShowOnlyCompatible>
      <div className="EdaNotebook">
        <div className="Paper">
          {notebookPreset.header && (
            <H5 text={notebookPreset.header} color={colors.gray[600]} />
          )}
          {analysis.descriptor.computations.length > 0 ? (
            notebookPreset.cells.map((cell, index) => (
              <NotebookCell
                key={index}
                analysisState={analysisState}
                wdkState={wdkState}
                cell={cell}
                projectId={projectId}
                stepNumber={stepNumbers.get(cell)}
                stepNumbers={stepNumbers}
              />
            ))
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </ShowHideVariableContextProvider>
  );
}
