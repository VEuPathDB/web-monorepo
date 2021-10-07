import { orderBy } from 'lodash';
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
import {
  safeHtml,
  useSetDocumentTitle,
} from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { confirm } from '@veupathdb/wdk-client/lib/Utils/Platform';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { OverflowingTextCell } from '@veupathdb/wdk-client/lib/Views/Strategy/OverflowingTextCell';

import {
  AnalysisClient,
  AnalysisSummary,
  SubsettingClient,
  useAnalysisList,
  usePinnedAnalyses,
} from '../core';
import { workspaceTheme } from '../core/components/workspaceTheme';
import { useDebounce } from '../core/hooks/debouncing';
import { useWdkStudyRecords } from '../core/hooks/study';
import { convertISOToDisplayFormat } from '../core/utils/date-conversion';

interface AnalysisAndDataset {
  analysis: AnalysisSummary & {
    creationTimeDisplay: string;
    modificationTimeDisplay: string;
  };
  dataset?: RecordInstance & {
    displayNameHTML: string;
  };
}

interface Props {
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  exampleAnalysesAuthor?: number;
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

const UNKNOWN_DATASET_NAME = 'Unknown study';

export function AllAnalyses(props: Props) {
  const { analysisClient, exampleAnalysesAuthor } = props;
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const { url } = useRouteMatch();
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();

  const queryParams = new URLSearchParams(location.search);
  const searchText = queryParams.get('s') ?? '';
  const debouncedSearchText = useDebounce(searchText, 250);

  const onFilterFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const queryParams = value ? '?s=' + encodeURIComponent(value) : '';
      history.replace(location.pathname + queryParams);
    },
    [history, location.pathname]
  );

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

  const datasets = useWdkStudyRecords();

  const {
    analyses,
    deleteAnalyses,
    updateAnalysis,
    loading,
    error,
  } = useAnalysisList(analysisClient);

  const analysesAndDatasets: AnalysisAndDataset[] | undefined = useMemo(
    () =>
      analyses?.map((analysis) => {
        const dataset = datasets?.find(
          (d) => d.id[0].value === analysis.studyId
        );
        return {
          analysis: {
            ...analysis,
            creationTimeDisplay: convertISOToDisplayFormat(
              analysis.creationTime
            ),
            modificationTimeDisplay: convertISOToDisplayFormat(
              analysis.modificationTime
            ),
          },
          dataset: dataset && {
            ...dataset,
            displayName: stripHTML(dataset.displayName),
            displayNameHTML: dataset.displayName,
          },
        };
      }),
    [analyses, datasets]
  );

  const searchableAnalysisColumns = useMemo(
    () =>
      [
        'displayName',
        'description',
        'creationTimeDisplay',
        'modificationTimeDisplay',
      ] as const,
    []
  );

  const searchableDatasetColumns = useMemo(() => ['displayName'] as const, []);

  const filteredAnalysesAndDatasets = useMemo(() => {
    if (!debouncedSearchText) return analysesAndDatasets;
    const lowerSearchText = debouncedSearchText.toLowerCase();

    return analysesAndDatasets?.filter(
      ({ analysis, dataset }) =>
        searchableAnalysisColumns.some((columnKey) =>
          analysis[columnKey]?.toLowerCase().includes(lowerSearchText)
        ) ||
        searchableDatasetColumns.some((columnKey) =>
          dataset?.[columnKey].toLowerCase().includes(lowerSearchText)
        ) ||
        (dataset == null &&
          UNKNOWN_DATASET_NAME.toLowerCase().includes(lowerSearchText))
    );
  }, [
    searchableAnalysisColumns,
    searchableDatasetColumns,
    debouncedSearchText,
    analysesAndDatasets,
  ]);

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
                      datasets?.find((d) => d.id[0].value === analysis.studyId)
                        ?.displayName ?? UNKNOWN_DATASET_NAME
                    );
                  case 'displayName':
                    return analysis.displayName;
                  case 'description':
                    return analysis.description;
                  case 'isPublic':
                    return analysis.isPublic;
                  case 'modificationTime':
                    return analysis.modificationTime;
                  case 'creationTime':
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
          key: 'id',
          name: ' ',
          width: '2.75em',
          renderCell: (data: { row: AnalysisAndDataset }) => (
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
          ),
        },
        {
          key: 'study',
          name: 'Study',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) => {
            const { dataset } = data.row;
            if (dataset == null) return UNKNOWN_DATASET_NAME;
            return safeHtml(dataset.displayNameHTML);
          },
        },
        {
          key: 'name',
          name: 'Analysis',
          sortable: true,
          style: { maxWidth: '200px' },
          renderCell: (data: { row: AnalysisAndDataset }) => {
            const analysisId = data.row.analysis.analysisId;
            const displayName = data.row.analysis.displayName;

            return (
              <div style={{ display: 'block', maxWidth: '100%' }}>
                <SaveableTextEditor
                  key={analysisId}
                  value={displayName}
                  displayValue={(value) => (
                    <Link
                      to={Path.join(
                        history.location.pathname,
                        data.row.analysis.studyId,
                        data.row.analysis.analysisId
                      )}
                    >
                      {value}
                    </Link>
                  )}
                  onSave={(newName) => {
                    updateAnalysis(analysisId, { displayName: newName });
                  }}
                />
              </div>
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

            return user?.id === exampleAnalysesAuthor ? (
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
            ) : (
              <OverflowingTextCell key={analysisId} value={descriptionStr} />
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
            data.row.analysis.creationTimeDisplay,
        },
        {
          key: 'modificationTime',
          name: 'Modified',
          sortable: true,
          renderCell: (data: { row: AnalysisAndDataset }) =>
            data.row.analysis.modificationTimeDisplay,
        },
      ].filter(
        // Only offer isPublic column if the user is the "example analyses" author
        (column) =>
          column.key !== 'isPublic' || user?.id === exampleAnalysesAuthor
      ),
    }),
    [
      sortPinned,
      filteredAnalysesAndDatasets,
      tableSort,
      selectedAnalyses,
      pinnedAnalyses.length,
      isPinnedAnalysis,
      datasets,
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
      exampleAnalysesAuthor,
      user,
    ]
  );
  const theme = createMuiTheme(workspaceTheme);

  useSetDocumentTitle('My Analyses');

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <h1>My Analyses</h1>
        {error && <ContentError>{error}</ContentError>}
        {analyses && datasets && user ? (
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
                onChange={onFilterFieldChange}
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
