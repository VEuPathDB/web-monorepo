import { debounce, orderBy } from 'lodash';
import Path from 'path';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Link, useHistory, useLocation } from 'react-router-dom';

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
import {
  Loading,
  Mesa,
  SaveableTextEditor,
} from '@veupathdb/wdk-client/lib/Components';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { confirm } from '@veupathdb/wdk-client/lib/Utils/Platform';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  AnalysisClient,
  AnalysisSummary,
  SubsettingClient,
  useAnalysisList,
  usePinnedAnalyses,
} from '../core';
import { workspaceTheme } from '../core/components/workspaceTheme';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

interface AnalysisAndDataset {
  analysis: AnalysisSummary;
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
  const location = useLocation();
  const classes = useStyles();

  const queryParams = new URLSearchParams(location.search);
  const searchText = queryParams.get('s') ?? '';

  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(
    new Set()
  );
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

  const {
    analyses,
    deleteAnalyses,
    updateAnalysis,
    loading,
    error,
  } = useAnalysisList(analysisClient);

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
    const lowerSearchText = searchText.toLowerCase();

    return analysesAndDatasets?.filter(
      ({ analysis, dataset }) =>
        analysis.displayName.toLowerCase().includes(lowerSearchText) ||
        dataset?.displayName.toLowerCase().includes(lowerSearchText)
    );
  }, [searchText, analysesAndDatasets]);

  const removeUnpinned = useCallback(() => {
    if (filteredAnalysesAndDatasets == null) return;
    const idsToRemove = filteredAnalysesAndDatasets
      .map(({ analysis }) => analysis.analysisId)
      .filter((id) => !isPinnedAnalysis(id));
    deleteAnalyses(idsToRemove);
  }, [filteredAnalysesAndDatasets, deleteAnalyses, isPinnedAnalysis]);

  const tableState = useMemo(
    () => ({
      rows: sortPinned
        ? orderBy(
            filteredAnalysesAndDatasets,
            [
              ({ analysis }) => (isPinnedAnalysis(analysis.analysisId) ? 0 : 1),
              ({ analysis }) => {
                const columnKey = tableSort[0];
                switch (columnKey) {
                  case 'study':
                    return (
                      datasets?.records.find(
                        (d) => d.id[0].value === analysis.studyId
                      )?.displayName ?? 'Unknown study'
                    );
                  case 'displayName':
                    return analysis.displayName;
                  case 'description':
                    return analysis.description;
                  case 'isPublic':
                    return analysis.isPublic;
                  case 'modified':
                    return analysis.modificationTime;
                  case 'created':
                    return analysis.creationTime;
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
          return isPinnedAnalysis(analysis.analysisId)
            ? 'pinned'
            : 'not-pinned';
        },
        isRowSelected: ({ analysis }: AnalysisAndDataset) =>
          selectedAnalyses.has(analysis.analysisId),
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
            newSet.add(analysis.analysisId);
            return newSet;
          }),
        onRowDeselect: ({ analysis }: AnalysisAndDataset) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            newSet.delete(analysis.analysisId);
            return newSet;
          }),
        onMultipleRowSelect: (entries: AnalysisAndDataset[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const entry of entries) newSet.add(entry.analysis.analysisId);
            return newSet;
          }),
        onMultipleRowDeselect: (entries: AnalysisAndDataset[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const entry of entries)
              newSet.delete(entry.analysis.analysisId);
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
                  isPinnedAnalysis(data.row.analysis.analysisId)
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
                      checked={isPinnedAnalysis(data.row.analysis.analysisId)}
                      onChange={(e) => {
                        if (e.target.checked)
                          addPinnedAnalysis(data.row.analysis.analysisId);
                        else removePinnedAnalysis(data.row.analysis.analysisId);
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
                  data.row.analysis.analysisId
                )}
              >
                {data.row.analysis.displayName}
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
          key: 'description',
          name: 'Description',
          sortable: true,
          style: { maxWidth: '300px' },
          renderCell: (data: { row: AnalysisAndDataset }) => {
            const analysisId = data.row.analysis.analysisId;
            const descriptionStr = data.row.analysis.description || '';

            return (
              <div style={{ display: 'block', maxWidth: '100%' }}>
                <SaveableTextEditor
                  key={analysisId}
                  multiLine
                  rows={Math.max(2, descriptionStr.length / 30)}
                  value={descriptionStr}
                  onSave={(newDescription) => {
                    updateAnalysis(analysisId, { description: newDescription });
                  }}
                />
              </div>
            );
          },
        },
        {
          key: 'isPublic',
          name: 'Public',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) => {
            return (
              <Checkbox
                checked={data.row.analysis.isPublic}
                onChange={(event) => {
                  updateAnalysis(data.row.analysis.analysisId, {
                    isPublic: event.target.checked,
                  });
                }}
              />
            );
          },
        },
        {
          key: 'creationTime',
          name: 'Created',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) =>
            new Date(data.row.analysis.creationTime).toUTCString().slice(5),
        },
        {
          key: 'modificationTime',
          name: 'Modified',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) =>
            new Date(data.row.analysis.modificationTime).toUTCString().slice(5),
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
      updateAnalysis,
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

  // Create a debounced function, which will update the query param
  // at most once every 250ms. This prevents issues with UI lag
  // caused by rerendering the table on every character input.
  //
  // NB: We want to minimize the number of dependencies so that this
  // function is as stable as possible.
  //
  // NB2: TextField below is no longer a controlled input component.
  // This makes it possible to have the input state and queryparam
  // state be out of sync, which is necessary for debouncing.
  const updateQueryParam = useMemo(
    () =>
      debounce((value: string) => {
        const queryParams = value ? '?s=' + encodeURIComponent(value) : '';
        history.replace(location.pathname + queryParams);
      }, 250),
    [history, location.pathname]
  );

  useSetDocumentTitle('My Analyses');

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <h1>My Analyses</h1>
        {error && <ContentError>{error}</ContentError>}
        {analyses && datasets ? (
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
                defaultValue={searchText}
                onChange={(e) => updateQueryParam(e.target.value)}
              />
              <span>
                Showing {filteredAnalysesAndDatasets?.length} of{' '}
                {analyses.length} analyses
              </span>
            </div>
            {(loading || datasets == null) && <Loading />}
          </Mesa.Mesa>
        ) : (
          <Loading />
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
