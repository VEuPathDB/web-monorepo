import { useCallback, useMemo, useEffect, useState } from 'react';
import {
  Analysis,
  AnalysisState,
  NewAnalysis,
  useAnalysisState,
  useSetterWithCallback,
  useStudyRecord,
  useDataClient,
} from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import {
  ComputeNotebookCell,
  NotebookCell as NotebookCellType,
  VisualizationNotebookCell,
} from './Types';
import { NotebookCell } from './NotebookCell';
import { v4 as uuid } from 'uuid';

import './EdaNotebook.scss';
import { createComputation } from '../core/components/computations/Utils';
import { useCachedPromise } from '../core/hooks/cachedPromise';
import {
  isComputeCellDescriptor,
  isVisualizationCellDescriptor,
  NotebookCellDescriptorBase,
  presetNotebooks,
  ComputeCellDescriptor,
  NotebookCellDescriptor,
} from './NotebookPresets';
import {
  Computation,
  ComputationAppOverview,
} from '../core/types/visualization';
import { plugins } from '../core/components/computations/plugins';

interface NotebookSettings {
  /** Ordered array of notebook cells */
  cells: NotebookCellType[];
}

const NOTEBOOK_UI_SETTINGS_KEY = '@@NOTEBOOK@@';

// TEMPORARY: Eventually this value should come from the wdk or whomever is creating the notebook.
const NOTEBOOK_PRESET_TEST = presetNotebooks['wgcnaCorrelationNotebook'];

interface Props {
  analysisState: AnalysisState;
  notebookType: string;
}

export function EdaNotebookAnalysis(props: Props) {
  const { analysisState, notebookType } = props;
  const { analysis, setComputations, addVisualization } = analysisState;

  const studyRecord = useStudyRecord();
  const dataClient = useDataClient();

  const fetchApps = async () => {
    let { apps } = await dataClient.getApps();
    return { apps };
  };
  const apps = useCachedPromise(fetchApps, ['fetchApps']);

  if (analysis == null) throw new Error('Cannot find analysis.');

  const notebookPreset = presetNotebooks[notebookType];
  if (notebookPreset == null)
    throw new Error(`Cannot find a notebook preset for ${notebookType}`);

  // Create computations and visualizations if needed using the notebookPreset as a guide
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
        const computationId = uuid();
        const computation = createComputation(
          cell.computationName,
          {},
          [], // not passing potentially stale previous computations (used to prevent ID clash)
          [],
          computationId // use uuid instead
        );
        setComputations((prev: Computation[]) => [...prev, computation]);
        // recurse into child cells (only from compute cells?)
        cell.cells?.forEach((child) =>
          processCell(child, cell.computationName, computationId)
        );
      } else if (
        cell.type === 'visualization' &&
        parentComputationType != null &&
        parentComputationId != null
      ) {
        const appPlugin = plugins[parentComputationType];
        const vizPlugin =
          appPlugin && appPlugin.visualizationPlugins[cell.visualizationName];

        const visualizationId = uuid();
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

  // Use state for computed preset notebook cells. Using a memo or ref didn't work because of the dependencies, that it needs to be
  // called once, and because it is needed elsewhere to run other hooks.
  const [presetNotebookCells, setPresetNotebookCells] = useState<
    NotebookCellType[]
  >([]);

  useEffect(() => {
    // Assume if this has run once, we don't need it again. The preset
    // notebook should not change on refresh or rerendering.
    if (presetNotebookCells.length > 0) return;
    const foo = analysisState.analysis?.descriptor.computations;
    if (appOverview) {
      const newCells = NOTEBOOK_PRESET_TEST.cells.map((cellDescriptor) =>
        notebookDescriptorToCell(
          cellDescriptor,
          analysisState,
          computation,
          appOverview
        )
      );
      setPresetNotebookCells(newCells);
    }
  }, [appOverview, analysisState, computation, presetNotebookCells]);

  // The following is currently required for subsetting cells to function.
  const notebookSettings = useMemo((): NotebookSettings => {
    const storedSettings =
      analysisState.analysis?.descriptor.subset.uiSettings[
        NOTEBOOK_UI_SETTINGS_KEY
      ];
    if (storedSettings == null) {
      return presetNotebookCells && presetNotebookCells.length > 0
        ? {
            cells: presetNotebookCells,
          }
        : {
            cells: [],
          };
    } else {
      return storedSettings as any as NotebookSettings;
    }
  }, [
    analysisState.analysis?.descriptor.subset.uiSettings,
    presetNotebookCells,
  ]);

  const updateCell = useCallback(
    (cell: Partial<Omit<NotebookCellType, 'type'>>, cellIndex: number) => {
      const oldCell = notebookSettings.cells[cellIndex];
      const newCell = { ...oldCell, ...cell };
      const nextCells = notebookSettings.cells.concat();
      nextCells[cellIndex] = newCell;
      const nextSettings = {
        ...notebookSettings,
        cells: nextCells,
      };
      analysisState.setVariableUISettings({
        [NOTEBOOK_UI_SETTINGS_KEY]: nextSettings,
      });
    },
    [analysisState, notebookSettings]
  );

  return (
    <div className="EdaNotebook">
      <div className="Paper">
        <div className="Heading">
          <h1>
            <SaveableTextEditor
              className="Title"
              value={analysisState.analysis?.displayName ?? ''}
              onSave={analysisState.setName}
            />
          </h1>
          <h2>{safeHtml(studyRecord.displayName)}</h2>
        </div>
        {notebookSettings.cells.map((cell, index) => (
          <NotebookCell
            key={index}
            analysisState={analysisState}
            cell={cell}
            updateCell={(update) => updateCell(update, index)}
          />
        ))}
      </div>
    </div>
  );
}

// The notebook descriptors just contain basic information about what the cell should become.
// This function generates the ids and finds the appropriate plugins for the cells.
const notebookDescriptorToCell = function (
  cellDescriptor: NotebookCellDescriptorBase<string>,
  analysisState: AnalysisState,
  computation?: Computation,
  appOverview?: ComputationAppOverview
): NotebookCellType {
  if (isComputeCellDescriptor(cellDescriptor) && computation && appOverview) {
    return {
      ...cellDescriptor,
      computeId: computation.computationId,
      computationAppOverview: appOverview,
      subCells: cellDescriptor.cells?.map((subCell) =>
        notebookDescriptorToCell(
          subCell,
          analysisState,
          computation,
          appOverview
        )
      ),
    } as ComputeNotebookCell;
  } else if (
    isVisualizationCellDescriptor(cellDescriptor) &&
    computation &&
    appOverview
  ) {
    const visualizationId = uuid();

    return {
      ...cellDescriptor,
      visualizationId: visualizationId,
      computeId: computation.computationId,
      computationAppOverview: appOverview,
    } as VisualizationNotebookCell;
  } else {
    return cellDescriptor as NotebookCellType;
  }
};
