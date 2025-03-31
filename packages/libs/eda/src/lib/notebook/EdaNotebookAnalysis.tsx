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

import { parseJson } from './Utils';

interface NotebookSettings {
  /** Ordered array of notebook cells */
  cells: NotebookCellType[];
}

const NOTEBOOK_UI_SETTINGS_KEY = '@@NOTEBOOK@@';

interface Props {
  analysis: Analysis | NewAnalysis | undefined;
  studyId: string;
  onAnalysisChange: (value: Analysis | NewAnalysis | undefined) => void;
}

export function EdaNotebookAnalysis(props: Props) {
  const { studyId, onAnalysisChange } = props;
  const studyRecord = useStudyRecord();

  const analysisDescriptor = useMemo(() => {
    return props.analysis == null ? makeNewAnalysis(studyId) : props.analysis;
  }, [props.analysis, studyId]);

  const wrappedOnAnalysisChange = useSetterWithCallback<
    Analysis | NewAnalysis | undefined
  >(props.analysis, onAnalysisChange);

  const analysisState = useAnalysisState(
    analysisDescriptor,
    wrappedOnAnalysisChange
  );
  console.log('analysisState', analysisState);

  // Let's make a fake visualization and computation (because they go togehter)
  const visualizationId = uuid();
  const newVisualization = {
    visualizationId,
    displayName: 'Unnamed visualization',
    descriptor: {
      type: 'volcanoplot',
      configuration: volcanoPlotVisualization.createDefaultConfig(),
    },
  };

  const computation = useMemo(() => {
    return createComputation(
      'differentialabundance',
      {} as DifferentialAbundanceConfig,
      [],
      []
    );
  }, []);

  // useEffect(() => {
  //   if (!computation || !analysisState) {return;}
  //   console.log(computation);
  //   analysisState.setComputations([computation]);
  // }, [analysisState, computation]);

  // analysisState.addVisualization(
  //   computation.computationId,
  //   newVisualization
  // );

  const notebookSettings = useMemo((): NotebookSettings => {
    const storedSettings =
      analysisState.analysis?.descriptor.subset.uiSettings[
        NOTEBOOK_UI_SETTINGS_KEY
      ];
    console.log('storedSettings', storedSettings);
    // if (storedSettings == null)
    return {
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
          type: 'visualization',
          title: 'Visualization cell',
          visualizationId: visualizationId,
        },
      ],
    };
    // return storedSettings as any as NotebookSettings;
  }, [visualizationId]);

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
