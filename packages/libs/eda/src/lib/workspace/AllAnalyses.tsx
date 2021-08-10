import {
  Button,
  Checkbox,
  createMuiTheme,
  FormControlLabel,
  Icon,
  makeStyles,
  Switch,
  ThemeProvider,
  Tooltip,
} from '@material-ui/core';
import { Loading, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { orderBy } from 'lodash';
import Path from 'path';
import React, { useCallback, useMemo, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Link, useHistory } from 'react-router-dom';
import {
  Analysis,
  AnalysisClient,
  SubsettingClient,
  useAnalysisList,
  usePinnedAnalyses,
} from '../core';
import { workspaceTheme } from '../core/components/workspaceTheme';

const useStyles = makeStyles({
  root: {
    '& .ActionToolbar-ItemList': {
      width: '100%',
    },
    '& .ActionToolbar-Item': {
      display: 'flex',
      alignItems: 'center',
      '&:last-of-type': {
        marginLeft: 'auto',
      },
    },
    '& .MesaComponent td': {
      verticalAlign: 'middle',
    },
  },
});

interface Props {
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
}

export function AllAnalyses(props: Props) {
  const { analysisClient } = props;
  const { url } = useRouteMatch();
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(
    new Set()
  );
  const classes = useStyles();

  const {
    pinnedAnalyses,
    isPinnedAnalysis,
    addPinnedAnalysis,
    removePinnedAnalysis,
  } = usePinnedAnalyses(analysisClient);

  const { analyses, deleteAnalyses, loading, error } = useAnalysisList(
    analysisClient
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

  // const [sortPinned, setSortPinned] = useState(true);

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
  const history = useHistory();

  const removeUnpinned = useCallback(() => {
    if (analyses == null) return;
    const idsToRemove = analyses
      .map((analysis) => analysis.id)
      .filter((id) => !isPinnedAnalysis(id));
    deleteAnalyses(idsToRemove);
  }, [analyses, deleteAnalyses, isPinnedAnalysis]);

  const tableState = useMemo(
    () => ({
      rows: sortPinned
        ? orderBy(
            analyses,
            [
              (analysis) => (isPinnedAnalysis(analysis.id) ? 0 : 1),
              (analysis) => {
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
        : analyses,
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
        deriveRowClassName: (row: Analysis) => {
          return isPinnedAnalysis(row.id) ? 'pinned' : 'not-pinned';
        },
        isRowSelected: (analysis: Analysis) =>
          selectedAnalyses.has(analysis.id),
      },
      actions: [
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
        {
          element: (
            <Button
              variant="text"
              startIcon={<Icon color="action" className="fa fa-trash" />}
              onClick={removeUnpinned}
              disabled={pinnedAnalyses.length === 0}
            >
              Remove unpinned analyses
            </Button>
          ),
        },
        {
          element: (
            <Button
              type="button"
              onClick={() => deleteAnalyses(selectedAnalyses)}
              disabled={selectedAnalyses.size === 0}
            >
              Delete selected analyses
            </Button>
          ),
        },
      ],
      eventHandlers: {
        onSort: (column: any, direction: any) => {
          console.log({ column, direction });
          setTableSort([column.key, direction]);
        },
        onRowSelect: (analysis: Analysis) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            newSet.add(analysis.id);
            return newSet;
          }),
        onRowDeselect: (analysis: Analysis) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            newSet.delete(analysis.id);
            return newSet;
          }),
        onMultipleRowSelect: (analyses: Analysis[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const analysis of analyses) newSet.add(analysis.id);
            return newSet;
          }),
        onMultipleRowDeselect: (analyses: Analysis[]) =>
          setSelectedAnalyses((set) => {
            const newSet = new Set(set);
            for (const analysis of analyses) newSet.delete(analysis.id);
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
          renderCell: (data: { row: Analysis }) => (
            <>
              <Tooltip
                title={
                  isPinnedAnalysis(data.row.id)
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
                      checked={isPinnedAnalysis(data.row.id)}
                      onChange={(e) => {
                        if (e.target.checked) addPinnedAnalysis(data.row.id);
                        else removePinnedAnalysis(data.row.id);
                      }}
                    />
                  }
                  label=""
                />
              </Tooltip>
              <Link
                to={Path.join(
                  history.location.pathname,
                  data.row.studyId,
                  data.row.id
                )}
              >
                {data.row.name}
              </Link>
            </>
          ),
        },
        {
          key: 'study',
          name: 'Study',
          sortable: true,
          renderCell: (data: { row: Analysis }) => {
            const dataset = datasets?.records.find(
              (d) => d.id[0].value === data.row.studyId
            );
            if (dataset == null) return 'Unknown study';
            return (
              <Link to={`${url}/${dataset.id[0].value}`}>
                {dataset.displayName}
              </Link>
            );
          },
        },
        { key: 'created', name: 'Created', sortable: true },
        { key: 'modified', name: 'Modified', sortable: true },
      ],
    }),
    [
      addPinnedAnalysis,
      analyses,
      datasets?.records,
      deleteAnalyses,
      history.location.pathname,
      isPinnedAnalysis,
      pinnedAnalyses.length,
      removePinnedAnalysis,
      removeUnpinned,
      selectedAnalyses,
      setSortPinned,
      setTableSort,
      sortPinned,
      tableSort,
      url,
    ]
  );
  const theme = createMuiTheme(workspaceTheme);
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <h1>My Analyses</h1>
        {loading && <Loading />}
        {error && <ContentError>{error}</ContentError>}
        {analyses && <Mesa.Mesa state={tableState} />}
      </div>
    </ThemeProvider>
  );
}
