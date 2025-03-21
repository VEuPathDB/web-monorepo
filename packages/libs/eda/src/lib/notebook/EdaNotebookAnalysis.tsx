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

import React, { useCallback, useMemo } from 'react';
import { useAnalysis, useStudyRecord } from '../core';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { ExpandablePanel } from '@veupathdb/coreui';
import { NotebookCell as NotebookCellType } from './Types';
import { NotebookCell } from './NotebookCell';

import './EdaNotebook.css';

interface NotebookSettings {
  /** Ordered array of notebook cells */
  cells: NotebookCellType[];
}

const NOTEBOOK_UI_SETTINGS_KEY = '@@NOTEBOOK@@';

interface Props {
  analysisId: string;
}

export function EdaNotebookAnalysis(props: Props) {
  const { analysisId } = props;
  const studyRecord = useStudyRecord();
  const analysisState = useAnalysis(
    analysisId === 'new' ? undefined : analysisId
  );
  const { analysis } = analysisState;
  console.log(analysis);
  const notebookSettings = useMemo((): NotebookSettings => {
    const storedSettings =
      analysis?.descriptor.subset.uiSettings[NOTEBOOK_UI_SETTINGS_KEY];
    console.log('storedSettings', storedSettings);
    if (storedSettings == null)
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
            visualizationId: '',
          },
        ],
      };
    return storedSettings as any as NotebookSettings;
  }, [analysis]);
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
