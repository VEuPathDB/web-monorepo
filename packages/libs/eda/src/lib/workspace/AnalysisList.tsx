import { Link, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { isLeft } from 'fp-ts/Either';
import { PathReporter } from 'io-ts/PathReporter';
import * as Path from 'path';
import * as React from 'react';
import { useHistory } from 'react-router';
import {
  AnalysisClient,
  AnalysisSummary,
  NewAnalysis,
  useAnalysisList,
  useStudyRecord,
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
  const { analyses, deleteAnalyses } = useAnalysisList(analysisStore);
  const analysisList = analyses
    ? analyses.filter((analysis) => analysis.studyId === studyId)
    : undefined;
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
        isRowSelected: (analysis: AnalysisSummary) =>
          selected.has(analysis.analysisId),
      },
      eventHandlers: {
        onRowSelect: (analysis: AnalysisSummary) =>
          setSelected((set) => {
            const newSet = new Set(set);
            newSet.add(analysis.analysisId);
            return newSet;
          }),
        onRowDeselect: (analysis: AnalysisSummary) =>
          setSelected((set) => {
            const newSet = new Set(set);
            newSet.delete(analysis.analysisId);
            return newSet;
          }),
        onMultipleRowSelect: (analyses: AnalysisSummary[]) =>
          setSelected((set) => {
            const newSet = new Set(set);
            for (const analysis of analyses) newSet.add(analysis.analysisId);
            return newSet;
          }),
        onMultipleRowDeselect: (analyses: AnalysisSummary[]) =>
          setSelected((set) => {
            const newSet = new Set(set);
            for (const analysis of analyses) newSet.delete(analysis.analysisId);
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
      rows: analysisList ?? [],
      columns: [
        {
          key: 'name',
          name: 'Name',
          renderCell: (data: { row: AnalysisSummary }) => (
            <Link
              to={Path.join(history.location.pathname, data.row.analysisId)}
            >
              {data.row.displayName}
            </Link>
          ),
        },
        { key: 'creationTime', name: 'Created' },
        { key: 'modificationTime', name: 'Modified' },
        {
          key: 'download',
          name: 'Download JSON',
          renderCell: (data: { row: AnalysisSummary }) => (
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data.row, null, 2)
              )}`}
              download={`${data.row.displayName}.json`}
            >
              Download JSON
            </a>
          ),
        },
      ],
    }),
    [
      loadAnalysis,
      analysisList,
      selected,
      deleteAnalyses,
      history.location.pathname,
    ]
  );

  useSetDocumentTitle(`All Analyses - ${studyRecord.displayName}`);

  if (analysisList == null) return null;
  return <Mesa.Mesa state={tableState} />;
}
