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
} from './NotebookPresets';
import {
  Computation,
  ComputationAppOverview,
} from '../core/types/visualization';

interface NotebookSettings {
  /** Ordered array of notebook cells */
  cells: NotebookCellType[];
}

const NOTEBOOK_UI_SETTINGS_KEY = '@@NOTEBOOK@@';

// TEMPORARY: Eventually this value should come from the wdk or whomever is creating the notebook.
const NOTEBOOK_PRESET_TEST = presetNotebooks['wgcnaCorrelationNotebook'];

interface Props {
  analysis: Analysis | NewAnalysis | undefined;
  studyId: string;
  onAnalysisChange: (value: Analysis | NewAnalysis | undefined) => void;
}

export function EdaNotebookAnalysis(props: Props) {
  const { studyId, onAnalysisChange } = props;
  const studyRecord = useStudyRecord();

  const dataClient = useDataClient();

  const fetchApps = async () => {
    const { apps } = await dataClient.getApps();
    return { apps };
  };

  const apps = useCachedPromise(fetchApps, ['fetchApps']);

  const wrappedOnAnalysisChange = useSetterWithCallback<
    Analysis | NewAnalysis | undefined
  >(props.analysis, onAnalysisChange);

  const analysisState = useAnalysisState(
    props.analysis,
    wrappedOnAnalysisChange
  );

  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');

  const computationName =
    (
      NOTEBOOK_PRESET_TEST.cells.find((cell) =>
        isComputeCellDescriptor(cell)
      ) as ComputeCellDescriptor
    )?.computationName ?? 'pass';

  const appOverview =
    apps && apps.value?.apps.find((app) => app.name === computationName);
  console.log('computationname:', computationName);

  const computation = useMemo(() => {
    console.log('making new computation');
    return createComputation(computationName, {}, [], []);
  }, [computationName]);

  // Create the one computation for the analysis. Eventually
  // we'll move this logic or improve it to handle multiple computations.
  useEffect(() => {
    if (!computation) return;

    // Avoid updating if the computation already exists
    const existingComputation =
      analysisState.analysis?.descriptor.computations.find(
        (comp) => comp.computationId === computation.computationId
      );
    if (existingComputation) return;

    analysisState.setComputations([computation]);
  }, [analysisState, computation]);

  // Use state for computed preset notebook cells. Using a memo or ref didn't work because of the dependencies, that it needs to be
  // called once, and because it is needed elsewhere to run other hooks.
  const [presetNotebookCells, setPresetNotebookCells] = useState<
    NotebookCellType[]
  >([]);

  useEffect(() => {
    // Assume if this has run once, we don't need it again. The preset
    // notebook should not change on refresh or rerendering.
    if (presetNotebookCells.length > 0) return;
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
