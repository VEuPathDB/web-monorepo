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
  wgcnaCorrelationNotebook,
} from './NotebookPresets';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';
import { useStudyMetadata } from '../core/hooks/study';
import { Note } from '@material-ui/icons';
import { composeTraversal } from 'monocle-ts/lib/Traversal';
import { ANALYSIS_MENU_STATE } from '@veupathdb/wdk-client/lib/StoreModules/StepAnalysis/StepAnalysisState';

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

  // Who should care about this? The cell or the analysis?
  // Probably the cell. Can the cell call another cell then? Because
  // if the compute cell finishes, only its linked viz cells should care.
  // Or maybe they don't have to and they just ask hey is there data ready
  // and they don't even know where it comes from.
  // But the viz cell needs the computation config... that part is tricky.
  // If we continue on our one compute per notebook assumption, this is all
  // far easier and we can leave it here.
  // const { jobStatus, createJob } = useComputeJobStatus(
  //   analysis,
  //   computation,
  //   appOverview?.computeName ?? ''
  // );
  //@ts-ignore
  const compNameTemp = NOTEBOOK_PRESET_TEST.skeleton[0].computationName;
  console.log('compNameTemp', compNameTemp);

  const appOverview =
    apps && apps.value?.apps.find((app) => app.name === compNameTemp);
  console.log('apps', apps);
  console.log('appOverview', appOverview);

  const plugin = plugins[compNameTemp];

  if (appOverview && plugin == null)
    throw new Error('Cannot find plugin for computation.');

  const computation = useMemo(() => {
    return createComputation(compNameTemp, {}, [], []);
  }, []);

  useEffect(() => {
    console.log('useeffect triggered');
    console.log('computation', computation);
    console.log('analysisState', analysisState);
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
      plugin &&
      NOTEBOOK_PRESET_TEST.skeleton.map((cell) => {
        if (cell.type === 'compute') {
          return {
            ...cell,
            computeId: computation.computationId,
            computationAppOverview: appOverview,
            plugin: plugin,
          } as ComputeNotebookCell;
        } else if (cell.type === 'visualization') {
          // const visualizationId = useMemo(() => {
          //   return uuid();
          // }, []);
          const visualizationId = 'abcde';

          // const vizName = cell.visualizationName;
          const vizName = 'bipartitenetwork';
          const vizPlugin = plugin && plugin.visualizationPlugins[vizName];
          // Add to analysis state ONLY if it doesn't exist
          const existingVisualization =
            analysisState.analysis?.descriptor.computations
              .find((comp) => comp.computationId === computation.computationId)
              ?.visualizations.find(
                (viz) => viz.visualizationId === visualizationId
              );

          console.log('existingVisualization', existingVisualization);
          if (existingVisualization == null) {
            const newVisualization = {
              visualizationId,
              displayName: 'Unnamed visualization',
              descriptor: {
                type: vizName,
                configuration: vizPlugin?.createDefaultConfig() ?? {},
              },
            };

            console.log('adding new viz');

            analysisState.addVisualization(
              computation.computationId,
              newVisualization
            );
          }

          return existingVisualization
            ? ({
                ...cell,
                visualizationId: visualizationId,
                computeId: computation.computationId,
                computationAppOverview: appOverview,
                plugin: vizPlugin,
              } as VisualizationNotebookCell)
            : ({
                title: 'Loading visualization...',
                type: 'text',
              } as TextNotebookCell);
        } else {
          return cell as NotebookCellType;
        }
      })
    );
  }, [appOverview, computation, plugin, analysisState]);
  console.log('presetNotebookCells', presetNotebookCells);
  console.log('analysisState', analysisState.analysis?.descriptor.computations);

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
      // console.log('oldCell', oldCell);
      // console.log('newCell', newCell); // good
      const nextCells = notebookSettings.cells.concat();
      nextCells[cellIndex] = newCell;
      const nextSettings = {
        ...notebookSettings,
        cells: nextCells,
      };
      analysisState.setVariableUISettings({
        [NOTEBOOK_UI_SETTINGS_KEY]: nextSettings,
      });
      console.log('nextSettings', nextSettings);
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
          <details>
            <summary>{cell.title}</summary>
            <NotebookCell
              analysisState={analysisState}
              cell={cell}
              updateCell={(update) => updateCell(update, index)}
            />
          </details>
        ))}
      </div>
    </div>
  );
}
