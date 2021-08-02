import Path from 'path';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  Analysis,
  AnalysisClient,
  SubsettingClient,
  usePinnedAnalyses,
} from '../core';
import { usePromise } from '../core/hooks/promise';
import { Mesa } from '@veupathdb/wdk-client/lib/Components';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';
import { orderBy } from 'lodash';

interface Props {
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
}

export function AllAnalyses(props: Props) {
  const { analysisClient, subsettingClient } = props;
  const analyses = usePromise(
    useCallback(() => analysisClient.getAnalyses(), [analysisClient])
  );

  const {
    isPinnedAnalysis,
    addPinnedAnalysis,
    removePinnedAnalysis,
  } = usePinnedAnalyses(analysisClient);

  const studies = usePromise(
    useCallback(() => subsettingClient.getStudies(), [subsettingClient])
  );

  const [sortPinned, setSortPinned] = useState(true);

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
      rows: sortPinned
        ? orderBy(analysisList, (analysis) =>
            isPinnedAnalysis(analysis.id) ? 0 : 1
          )
        : analysisList,
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
          key: 'pinned',
          name: <i className="fa fa-thumb-tack" />,
          width: '4em',
          renderCell: (data: { row: Analysis }) => (
            <input
              type="checkbox"
              checked={isPinnedAnalysis(data.row.id)}
              onChange={(e) => {
                if (e.target.checked) addPinnedAnalysis(data.row.id);
                else removePinnedAnalysis(data.row.id);
              }}
            />
          ),
        },
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
    [
      addPinnedAnalysis,
      analysisList,
      datasets?.records,
      history.location.pathname,
      isPinnedAnalysis,
      removePinnedAnalysis,
      sortPinned,
    ]
  );
  if (analysisList == null) return null;
  return (
    <div>
      <h1>My Analyses</h1>
      <Switch
        state={sortPinned}
        onStateChange={setSortPinned}
        label="Sort pinned to top"
      />
      <Mesa.Mesa state={tableState} />
    </div>
  );
}
