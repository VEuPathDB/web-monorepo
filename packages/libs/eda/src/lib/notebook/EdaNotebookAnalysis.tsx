import { useCallback, useMemo, useEffect } from 'react';
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

import './EdaNotebook.css';
import { createComputation } from '../core/components/computations/Utils';
import { plugins } from '../core/components/computations/plugins';
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
// Eventually this value should come from the wdk or whomever is creating the notebook.
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
    let { apps } = await dataClient.getApps();
    return { apps };
  };

  const apps = useCachedPromise(fetchApps, [studyId]);

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

  const computation = useMemo(() => {
    return createComputation(computationName, {}, [], []);
  }, [computationName]);

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

  // Maybe use a ref instead?? Don't want to leave out a dependency on purpose.
  // Could we use the strategy of checking the analysisState for a good viz/compute, and if it
  // doesn't parse into a real thing then we create a new one?
  const presetNotebookCells = useMemo(() => {
    return (
      appOverview &&
      NOTEBOOK_PRESET_TEST.cells.map((cellDescriptor) => {
        return notebookDescriptorToCell(
          cellDescriptor,
          analysisState,
          computation,
          appOverview
        );
      })
    );
  }, [appOverview, computation, NOTEBOOK_PRESET_TEST]); // Should only change if the preset notebook changes.

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
