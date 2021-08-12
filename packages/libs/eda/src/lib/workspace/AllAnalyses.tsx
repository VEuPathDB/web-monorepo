import { orderBy } from 'lodash';
import Path from 'path';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Link, useHistory } from 'react-router-dom';

import {
  Button,
  Checkbox,
  createMuiTheme,
  FormControlLabel,
  Icon,
  makeStyles,
  Switch,
  TextField,
  ThemeProvider,
  Tooltip,
} from '@material-ui/core';
import { Loading, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { confirm } from '@veupathdb/wdk-client/lib/Utils/Platform';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  Analysis,
  AnalysisClient,
  SubsettingClient,
  useAnalysisList,
  usePinnedAnalyses,
} from '../core';
import { workspaceTheme } from '../core/components/workspaceTheme';

interface AnalysisAndDataset {
  analysis: Analysis;
  dataset?: RecordInstance;
}

interface Props {
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
}

const useStyles = makeStyles({
  root: {
    '& .ActionToolbar-Item': {
      display: 'flex',
      alignItems: 'center',
    },
    '& .MesaComponent td': {
      verticalAlign: 'middle',
    },
  },
});

export function AllAnalyses(props: Props) {
  const { analysisClient } = props;
  const { url } = useRouteMatch();
  const history = useHistory();
  const classes = useStyles();

  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(
    new Set()
  );
  const [searchText, setSearchText] = useState('');
  const [sortPinned, setSortPinned] = useSessionBackedState<boolean>(
    true,
    'eda::allAnalysesPinned',
    JSON.stringify,
    JSON.parse
  );

  const [tableSort, setTableSort] = useSessionBackedState<
    [string, 'asc' | 'desc']
  >(['modified', 'desc'], 'eda::allAnalysesSort', JSON.stringify, JSON.parse);

  const {
    pinnedAnalyses,
    isPinnedAnalysis,
    addPinnedAnalysis,
    removePinnedAnalysis,
  } = usePinnedAnalyses(analysisClient);

  const datasets = useDatasets();

  const { analyses, deleteAnalyses, loading, error } = useAnalysisList(
    analysisClient
  );

  const analysesAndDatasets = useMemo(
    () =>
      analyses?.map((analysis) => {
        const dataset = datasets?.records.find(
          (d) => d.id[0].value === analysis.studyId
        );
        return {
          analysis,
          dataset,
        };
      }),
    [analyses, datasets]
  );

  const filteredAnalysesAndDatasets = useMemo(() => {
    if (!searchText) return analysesAndDatasets;
    return analysesAndDatasets?.filter(
      ({ analysis, dataset }) =>
        analysis.name.toLowerCase().includes(searchText) ||
        dataset?.displayName.toLowerCase().includes(searchText)
    );
  }, [searchText, analysesAndDatasets]);

  const removeUnpinned = useCallback(() => {
    if (filteredAnalysesAndDatasets == null) return;
    const idsToRemove = filteredAnalysesAndDatasets
      .map(({ analysis }) => analysis.id)
      .filter((id) => !isPinnedAnalysis(id));
    deleteAnalyses(idsToRemove);
  }, [filteredAnalysesAndDatasets, deleteAnalyses, isPinnedAnalysis]);

  const tableState = useMemo(
    () => ({
      rows: sortPinned
        ? orderBy(
            filteredAnalysesAndDatasets,
            [
              ({ analysis }) => (isPinnedAnalysis(analysis.id) ? 0 : 1),
              ({ analysis }) => {
                const columnKey = tableSort[0];
                switch (columnKey) {
                  case 'study':
                    return (
                      datasets?.records.find(
                        (d) => d.id[0].value === analysis.studyId
                      )?.displayName ?? 'Unknown study'
                    );
                  case 'name':
                    return analysis.name;
                  case 'modified':
                    return analysis.modified;
                  case 'created':
                    return analysis.created;
                }
              },
            ],
            ['asc', tableSort[1]]
          )
        : filteredAnalysesAndDatasets,
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
              {analyses == null
                ? 'You do not have any analyses. Get started by choosing a study'
                : 'There are no analyses that match your search'}
              .
            </div>
          </div>
        ),
        deriveRowClassName: ({ analysis }: AnalysisAndDataset) => {
          return isPinnedAnalysis(analysis.id) ? 'pinned' : 'not-pinned';
        },
        isRowSelected: ({ analysis }: AnalysisAndDataset) =>
          selectedAnalyses.has(analysis.id),
      },
      actions: [
        {
          element: (
            <Button
              type="button"
              startIcon={<Icon color="action" className="fa fa-trash" />}
              onClick={async () => {
                const answer = await confirm(
                  'Delete selected analyses',
                  'Are you sure you want to delete selected analyses?'
                );
                if (answer) {
                  deleteAnalyses(selectedAnalyses);
                }
              }}
              disabled={selectedAnalyses.size === 0}
            >
              Delete selected analyses
            </Button>
          ),
        },
        {
          element: (
            <Button
              type="button"
              startIcon={<Icon color="action" className="fa fa-trash" />}
              onClick={async () => {
                const answer = await confirm(
                  'Delete selected analyses',
                  'Are you sure you want to delete selected analyses?'
                );
                if (answer) {
                  removeUnpinned();
                }
              }}
              disabled={pinnedAnalyses.length === 0}
            >
              Delete unpinned analyses
            </Button>
          ),
        },
        {
          element: (
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  size="small"
                  checked={sortPinned}
                  onChange={(e) => setSortPinned(e.target.checked)}
                />
              }
              label="Sort pinned to top"
              style={{
                padding: '1em',
              }}
              disabled={pinnedAnalyses.length === 0}
            />
          ),
        },
      ],
      eventHandlers: {
        onSort: (column: any, direction: any) => {
          console.log({ column, direction });
          setTableSort([column.key, direction]);
        },
        onRowSelect: ({ analysis }: AnalysisAndDataset) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            newSet.add(analysis.id);
            return newSet;
          }),
        onRowDeselect: ({ analysis }: AnalysisAndDataset) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            newSet.delete(analysis.id);
            return newSet;
          }),
        onMultipleRowSelect: (entries: AnalysisAndDataset[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const entry of entries) newSet.add(entry.analysis.id);
            return newSet;
          }),
        onMultipleRowDeselect: (entries: AnalysisAndDataset[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const entry of entries) newSet.delete(entry.analysis.id);
            return newSet;
          }),
      },
      uiState: {
        sort: {
          columnKey: tableSort[0],
          direction: tableSort[1],
        },
      },
      columns: [
        {
          key: 'name',
          name: 'Analysis',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) => (
            <>
              <Tooltip
                title={
                  isPinnedAnalysis(data.row.analysis.id)
                    ? 'Remove from pinned analyses'
                    : 'Add to pinned analyses'
                }
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      icon={
                        <Icon
                          style={{ color: '#aaa' }}
                          className="fa fa-thumb-tack"
                        />
                      }
                      checkedIcon={
                        <Icon color="primary" className="fa fa-thumb-tack" />
                      }
                      checked={isPinnedAnalysis(data.row.analysis.id)}
                      onChange={(e) => {
                        if (e.target.checked)
                          addPinnedAnalysis(data.row.analysis.id);
                        else removePinnedAnalysis(data.row.analysis.id);
                      }}
                    />
                  }
                  label=""
                />
              </Tooltip>
              <Link
                to={Path.join(
                  history.location.pathname,
                  data.row.analysis.studyId,
                  data.row.analysis.id
                )}
              >
                {data.row.analysis.name}
              </Link>
            </>
          ),
        },
        {
          key: 'study',
          name: 'Study',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) => {
            const { dataset } = data.row;
            if (dataset == null) return 'Unknown study';
            return (
              <Link to={`${url}/${dataset.id[0].value}`}>
                {dataset.displayName}
              </Link>
            );
          },
        },
        {
          key: 'created',
          name: 'Created',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) =>
            new Date(data.row.analysis.created).toUTCString().slice(5),
        },
        {
          key: 'modified',
          name: 'Modified',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) =>
            new Date(data.row.analysis.modified).toUTCString().slice(5),
        },
      ],
    }),
    [
      sortPinned,
      filteredAnalysesAndDatasets,
      tableSort,
      selectedAnalyses,
      pinnedAnalyses.length,
      isPinnedAnalysis,
      datasets?.records,
      analyses,
      deleteAnalyses,
      removeUnpinned,
      setSortPinned,
      setTableSort,
      history.location.pathname,
      addPinnedAnalysis,
      removePinnedAnalysis,
      url,
    ]
  );
  const theme = createMuiTheme(workspaceTheme);
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <h1>My Analyses</h1>
        {error && <ContentError>{error}</ContentError>}
        {analyses && datasets && (
          <Mesa.Mesa state={tableState}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1ex',
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                label="Search analyses"
                inputProps={{ size: 50 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <span>
                Showing {filteredAnalysesAndDatasets?.length} of{' '}
                {analyses.length} analyses
              </span>
            </div>
            {(loading || datasets == null) && <Loading />}
          </Mesa.Mesa>
        )}
      </div>
    </ThemeProvider>
  );
}

function useDatasets() {
  return useWdkService(
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
}
