import { Link, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { isLeft } from 'fp-ts/Either';
import { PathReporter } from 'io-ts/PathReporter';
import * as Path from 'path';
import * as React from 'react';
import { useHistory } from 'react-router';
import {
  NewAnalysis,
  Analysis,
  useStudyRecord,
  AnalysisClient,
  useAnalysisList,
} from '../core';

export interface Props {
  analysisStore: AnalysisClient;
}

export function AnalysisList(props: Props) {
  const { analysisStore } = props;
  const studyRecord = useStudyRecord();
  const studyId = studyRecord.id.map((part) => part.value).join('/');
  const history = useHistory();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const { analyses, deleteAnalyses } = useAnalysisList(
    analysisStore
  );
  const analysisList = analyses ? analyses.filter((analysis) => analysis.studyId === studyId) : undefined;
  const createNewAnalysis = React.useCallback(async () => {
    const { id } = await analysisStore.createAnalysis({
      name: 'Unnamed Analysis',
      studyId,
      filters: [],
      starredVariables: [],
      derivedVariables: [],
      visualizations: [],
      computations: [],
      variableUISettings: {},
    });
    const newLocation = {
      ...history.location,
      pathname:
        history.location.pathname +
        (history.location.pathname.endsWith('/') ? '' : '/') +
        id,
    };
    history.push(newLocation);
  }, [analysisStore, history, studyId]);
  const loadAnalysis = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files && event.currentTarget.files[0];
      if (file == null) return;
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      reader.onload = (loadEvent) => {
        try {
          const result = loadEvent.target?.result;
          if (typeof result !== 'string') return null;
          const json = JSON.parse(result);
          const decodeResult = NewAnalysis.decode(json);
          if (isLeft(decodeResult)) {
            console.error(
              'Error parsing file\n',
              PathReporter.report(decodeResult)
            );
            alert(
              'Error parsing file. See developer tools console for details.'
            );
            return;
          }
          analysisStore.createAnalysis(decodeResult.right).then((id) => {
            const newLocation = {
              ...history.location,
              pathname:
                history.location.pathname +
                (history.location.pathname.endsWith('/') ? '' : '/') +
                id,
            };
            history.push(newLocation);
          });
        } catch (error) {
          console.error('Error loading file: ' + error);
          alert('Error loading file. See developer tools console for details.');
        }
      };
    },
    [analysisStore, history]
  );
  const tableState = React.useMemo(
    () => ({
      options: {
        isRowSelected: (analysis: Analysis) => selected.has(analysis.id),
      },
      eventHandlers: {
        onRowSelect: (analysis: Analysis) =>
          setSelected((set) => {
            const newSet = new Set(set);
            newSet.add(analysis.id);
            return newSet;
          }),
        onRowDeselect: (analysis: Analysis) =>
          setSelected((set) => {
            const newSet = new Set(set);
            newSet.delete(analysis.id);
            return newSet;
          }),
        onMultipleRowSelect: (analyses: Analysis[]) =>
          setSelected((set) => {
            const newSet = new Set(set);
            for (const analysis of analyses) newSet.add(analysis.id);
            return newSet;
          }),
        onMultipleRowDeselect: (analyses: Analysis[]) =>
          setSelected((set) => {
            const newSet = new Set(set);
            for (const analysis of analyses) newSet.delete(analysis.id);
            return newSet;
          }),
      },
      actions: [
        {
          selectionRequired: true,
          element: (
            <button
              type="button"
              className="btn"
              onClick={() => deleteAnalyses(selected)}
            >
              Delete selected analyses
            </button>
          ),
        },
        {
          selectionRequired: false,
          element: (
            <button type="button" className="btn" onClick={createNewAnalysis}>
              Start a new analysis
            </button>
          ),
        },
        {
          selectionRequired: false,
          element: (
            <>
              <input
                hidden
                id="upload-file"
                type="file"
                className="btn"
                multiple={false}
                onChange={loadAnalysis}
              />
              <label className="btn" htmlFor="upload-file">
                Upload an analysis from JSON
              </label>
            </>
          ),
        },
      ],
      rows: analysisList,
      columns: [
        {
          key: 'name',
          name: 'Name',
          renderCell: (data: { row: Analysis }) => (
            <Link to={Path.join(history.location.pathname, data.row.id)}>
              {data.row.name}
            </Link>
          ),
        },
        { key: 'created', name: 'Created' },
        { key: 'modified', name: 'Modified' },
        {
          key: 'download',
          name: 'Download JSON',
          renderCell: (data: { row: Analysis }) => (
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data.row, null, 2)
              )}`}
              download={`${data.row.name}.json`}
            >
              Download JSON
            </a>
          ),
        },
      ],
    }),
    [
      createNewAnalysis,
      loadAnalysis,
      analysisList,
      selected,
      deleteAnalyses,
      history.location.pathname,
    ]
  );
  if (analysisList == null) return null;
  return <Mesa.Mesa state={tableState} />;
}
