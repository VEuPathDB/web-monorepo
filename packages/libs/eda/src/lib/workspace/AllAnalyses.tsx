import Path from 'path';
import React, { useCallback, useMemo } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { Analysis, AnalysisClient, SubsettingClient } from '../core';
import { usePromise } from '../core/hooks/promise';
import { Mesa } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
}

export function AllAnalyses(props: Props) {
  const { analysisClient, subsettingClient } = props;
  const analyses = usePromise(
    useCallback(() => analysisClient.getAnalyses(), [analysisClient])
  );
  const studies = usePromise(
    useCallback(() => subsettingClient.getStudies(), [subsettingClient])
  );
  const datasets = useWdkService(
    (wdkService) =>
      wdkService.getAnswerJson(
        {
          searchName: 'Studies',
          searchConfig: {
            parameters: {},
          },
        },
        {
          attributes: ['dataset_id'],
        }
      ),
    []
  );
  const analysisList = analyses.value;
  const history = useHistory();
  const tableState = useMemo(
    () => ({
      rows: analysisList,
      options: {
        renderEmptyState: () => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
              fontSize: '2em',
            }}
          >
            <div>
              You do not have any analyses. Get started by choosing a study.
            </div>
          </div>
        ),
      },
      columns: [
        {
          key: 'name',
          name: 'Analysis',
          renderCell: (data: { row: Analysis }) => (
            <Link
              to={Path.join(
                history.location.pathname,
                data.row.studyId,
                data.row.id
              )}
            >
              {data.row.name}
            </Link>
          ),
        },
        {
          key: 'study',
          name: 'Study',
          renderCell: (data: { row: Analysis }) => {
            const dataset = datasets?.records.find(
              (d) => d.id[0].value === data.row.studyId
            );
            if (dataset == null) return 'Unknown study';
            return (
              <Link to={`/record/dataset/${dataset.id[0].value}`}>
                {dataset.displayName}
              </Link>
            );
          },
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
    [analysisList, datasets?.records, history.location.pathname]
  );
  if (analysisList == null) return null;
  return (
    <div>
      <h1>My Analyses</h1>
      <Mesa.Mesa state={tableState} />
    </div>
  );
}
