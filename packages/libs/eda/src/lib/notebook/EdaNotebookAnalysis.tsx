// Notes
// =====
//
// - For now, we will only support "fixed" notebooks. If we want to allow "custom" notebooks,
//   we have to make some decisions.
// - Do we want a top-down data flow? E.g., subsetting is global for an analysis.
// - Do we want to separate compute config from visualization? If so, how do we
//   support that in the UI?
// - Do we want text-based cells?
// - Do we want download cells? It could have a preview.
//

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Analysis,
  AnalysisChangeHandler,
  AnalysisState,
  makeNewAnalysis,
  NewAnalysis,
  useAnalysis,
  useAnalysisState,
  useSetterWithCallback,
  useStudyRecord,
  useDataClient,
} from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { ExpandablePanel } from '@veupathdb/coreui';
import {
  ComputeNotebookCell,
  NotebookCell as NotebookCellType,
  TextNotebookCell,
  VisualizationNotebookCell,
} from './Types';
import { NotebookCell } from './NotebookCell';
import { v4 as uuid } from 'uuid';

import './EdaNotebook.css';
import { volcanoPlotVisualization } from '../core/components/visualizations/implementations/VolcanoPlotVisualization';
import { createComputation } from '../core/components/computations/Utils';
import { plugins } from '../core/components/computations/plugins';
import { DifferentialAbundanceConfig } from '../core/components/computations/plugins/differentialabundance';
import { AppsResponse } from '../core/api/DataClient/types';
import { parseJson } from './Utils';
import { useCachedPromise } from '../core/hooks/cachedPromise';
import {
  differentialAbundanceNotebook,
  isComputeCellDescriptor,
  isVisualizationCellDescriptor,
  NotebookCellDescriptorBase,
  wgcnaCorrelationNotebook,
} from './NotebookPresets';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';
import { useStudyMetadata } from '../core/hooks/study';
import { Note } from '@material-ui/icons';
import { composeTraversal } from 'monocle-ts/lib/Traversal';
import { ANALYSIS_MENU_STATE } from '@veupathdb/wdk-client/lib/StoreModules/StepAnalysis/StepAnalysisState';
import {
  Computation,
  ComputationAppOverview,
} from '../core/types/visualization';
import { ComputationPlugin } from '../core/components/computations/Types';
import { VisualizationPlugin } from '../core/components/visualizations/VisualizationPlugin';

interface NotebookSettings {
  /** Ordered array of notebook cells */
  cells: NotebookCellType[];
}

const NOTEBOOK_UI_SETTINGS_KEY = '@@NOTEBOOK@@';
const NOTEBOOK_PRESET_TEST = wgcnaCorrelationNotebook;

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
  console.log(analysisState.analysis?.descriptor.subset.descriptor);

  const { analysis } = analysisState;
  if (analysis == null) throw new Error('Cannot find analysis.');

  //@ts-ignore
  const compNameTemp = NOTEBOOK_PRESET_TEST.skeleton[0].computationName;
  console.log('compNameTemp', compNameTemp);

  //
  const appOverview =
    apps && apps.value?.apps.find((app) => app.name === compNameTemp);

  const computation = useMemo(() => {
    return createComputation(compNameTemp, {}, [], []);
  }, []);

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

  const presetNotebookCells = useMemo(() => {
    return (
      appOverview &&
      NOTEBOOK_PRESET_TEST.skeleton.map((cellDescriptor) => {
        return notebookSkeletonToCell(
          cellDescriptor,
          analysisState,
          computation,
          appOverview
        );
      })
    );
  }, [appOverview, computation, NOTEBOOK_PRESET_TEST]); // Should only change if the preset notebook changes.
  console.log('presetNotebookCells', presetNotebookCells);
  console.log(analysisState);

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
            cells: [
              {
                type: 'subset',
                title: 'Subset data',
              },
              {
                type: 'text',
                text: 'Helpful text',
                title: 'Documentation',
              },
            ],
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

// A skeleton has to start up everything from scratch. Can assume there are no preexisting computations
// or visualizations.
const notebookSkeletonToCell = function (
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
      subCells: cellDescriptor.subCells?.map((subCell) =>
        notebookSkeletonToCell(subCell, analysisState, computation, appOverview)
      ),
    } as ComputeNotebookCell;
  } else if (
    isVisualizationCellDescriptor(cellDescriptor) &&
    computation &&
    appOverview
  ) {
    const visualizationId = uuid();

    const vizName = cellDescriptor.visualizationName;
    const appPlugin = plugins[computation.descriptor.type];
    const vizPlugin = appPlugin && appPlugin.visualizationPlugins[vizName];

    // // Move this to the visualization cell?
    // // Add to analysis state ONLY if it doesn't exist
    // const existingVisualization =
    //   analysisState.analysis?.descriptor.computations
    //     .find((comp) => comp.computationId === computation.computationId)
    //     ?.visualizations.find((viz) => viz.visualizationId === visualizationId);

    // if (existingVisualization == null) {
    //   const newVisualization = {
    //     visualizationId,
    //     displayName: 'Unnamed visualization',
    //     descriptor: {
    //       type: vizName,
    //       configuration: vizPlugin?.createDefaultConfig() ?? {},
    //     },
    //   };

    //   console.log('adding new viz');

    //   analysisState.addVisualization(
    //     computation.computationId,
    //     newVisualization
    //   );
    // }

    return {
      ...cellDescriptor,
      visualizationId: visualizationId,
      computeId: computation.computationId,
      computationAppOverview: appOverview,
      plugin: vizPlugin,
    } as VisualizationNotebookCell;
  } else {
    return cellDescriptor as NotebookCellType;
  }
};
