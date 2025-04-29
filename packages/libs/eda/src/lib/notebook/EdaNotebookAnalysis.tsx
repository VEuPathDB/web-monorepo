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
import { NotebookCell as NotebookCellType } from './Types';
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
  boxplotNotebook,
  differentialAbundanceNotebook,
  wgcnaCorrelationNotebook,
} from './NotebookPresets';
import { useComputeJobStatus } from '../core/components/computations/ComputeJobStatusHook';
import { useStudyMetadata } from '../core/hooks/study';
import { Note } from '@material-ui/icons';

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

  // apps are what are defined in the data service.
  // plugins are defined in the client. We want to make sure
  // our project ID is included in the app's allowed projects,
  // and then ensure we have a plugin for that app.

  const appOverview =
    apps &&
    apps.value?.apps.find(
      (app) => app.name === NOTEBOOK_PRESET_TEST.computationName
    );

  // Stuck here. Non computes don't have a computename...
  const plugin =
    plugins[appOverview?.computeName ?? NOTEBOOK_PRESET_TEST.computationName];
  if (appOverview && plugin == null)
    throw new Error('Cannot find plugin for computation.');

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

  const visualizationId = useMemo(() => {
    return uuid();
  }, []);

  const vizName = NOTEBOOK_PRESET_TEST.visualizations[0];
  const vizPlugin = plugin && plugin.visualizationPlugins[vizName];

  const computation = useMemo(() => {
    const newVisualization = {
      visualizationId,
      displayName: 'Unnamed visualization',
      descriptor: {
        type: vizName,
        configuration: vizPlugin?.createDefaultConfig() ?? {},
      },
    };
    return createComputation(
      NOTEBOOK_PRESET_TEST.computationName,
      {},
      [],
      [newVisualization]
    );
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

  // Who should care about this? The cell or the analysis?
  // Probably the cell. Can the cell call another cell then? Because
  // if the compute cell finishes, only its linked viz cells should care.
  // Or maybe they don't have to and they just ask hey is there data ready
  // and they don't even know where it comes from.
  // But the viz cell needs the computation config... that part is tricky.
  // If we continue on our one compute per notebook assumption, this is all
  // far easier and we can leave it here.
  const { jobStatus, createJob } = useComputeJobStatus(
    analysis,
    computation,
    appOverview?.computeName ?? ''
  );

  const notebookSettings = useMemo((): NotebookSettings => {
    const storedSettings =
      analysisState.analysis?.descriptor.subset.uiSettings[
        NOTEBOOK_UI_SETTINGS_KEY
      ];
    if (storedSettings == null) {
      // eventually read this from the preset notebook?
      return appOverview &&
        vizPlugin &&
        plugin &&
        analysisState.analysis?.descriptor.computations[0]
        ? {
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
              {
                type: 'compute',
                title: 'Compute cell',
                computeId: computation.computationId,
                computationAppOverview: appOverview,
                plugin: plugin,
              },
              {
                type: 'visualization',
                title: 'Compute visualization cell',
                visualizationId: visualizationId,
                computeId: computation.computationId,
                computationAppOverview: appOverview,
                plugin: vizPlugin,
              },
              {
                type: 'visualization',
                title: 'Visualization cell',
                visualizationId: visualizationId,
                plugin: vizPlugin,
                computeId: computation.computationId,
                computationAppOverview: appOverview,
              },
            ],
          }
        : {
            cells: [
              {
                type: 'text',
                text: 'No app overview found. Please select an app.',
                title: 'Error',
              },
            ],
          };
    } else {
      return storedSettings as any as NotebookSettings;
    }
  }, [
    analysisState.analysis?.descriptor.subset.uiSettings,
    analysisState.analysis?.descriptor.computations,
    computation.computationId,
    appOverview,
    visualizationId,
    plugin,
    vizPlugin,
  ]);

  const updateCell = useCallback(
    (cell: Partial<Omit<NotebookCellType, 'type'>>, cellIndex: number) => {
      const oldCell = notebookSettings.cells[cellIndex];
      const newCell = { ...oldCell, ...cell };
      console.log('oldCell', oldCell);
      console.log('newCell', newCell); // good
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
