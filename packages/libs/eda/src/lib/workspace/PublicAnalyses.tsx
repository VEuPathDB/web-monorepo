import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';

import {
  FormControlLabel,
  Switch,
  TextField,
  ThemeProvider,
  createMuiTheme,
  makeStyles,
} from '@material-ui/core';
import { keyBy, orderBy } from 'lodash';

import { Link, Loading, Mesa } from '@veupathdb/wdk-client/lib/Components';
import { create as createTableState } from '@veupathdb/wdk-client/lib/Components/Mesa/Utils/MesaState';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/wdk-client/lib/Core/CommonTypes';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { OverflowingTextCell } from '@veupathdb/wdk-client/lib/Views/Strategy/OverflowingTextCell';

import { workspaceTheme } from '../core/components/workspaceTheme';
import { useDebounce } from '../core/hooks/debouncing';
import {
  PromiseHookState,
  PromiseResult,
  PublicAnalysisSummary,
  StudyRecord,
} from '../core';
import { convertISOToDisplayFormat } from '../core/utils/date-conversion';

const useStyles = makeStyles({
  root: {
    '& .TableToolbar-Children': {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    '& .MesaComponent td': {
      verticalAlign: 'middle',
    },
    '& .ExampleRow': {
      fontWeight: 'bold',
    },
  },
});

interface Props {
  publicAnalysisListState: PromiseHookState<PublicAnalysisSummary[]>;
  studyRecords: StudyRecord[] | undefined;
  makeStudyLink: (studyId: string) => string;
  makeAnalysisLink: (
    studyId: string,
    analysisId: string,
    ownerUserId: number
  ) => string;
  exampleAnalysesAuthor?: number;
}

export function PublicAnalyses({
  publicAnalysisListState,
  studyRecords,
  ...tableProps
}: Props) {
  const styles = useStyles();
  const theme = createMuiTheme(workspaceTheme);

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.root}>
        <h1>Public Analyses</h1>
        <PromiseResult state={publicAnalysisListState}>
          {(publicAnalysisList) =>
            studyRecords == null ? (
              <Loading />
            ) : (
              <PublicAnalysesTable
                {...tableProps}
                studyRecords={studyRecords}
                publicAnalysisList={publicAnalysisList}
              />
            )
          }
        </PromiseResult>
      </div>
    </ThemeProvider>
  );
}

interface TableProps extends Omit<Props, 'publicAnalysisListState'> {
  publicAnalysisList: PublicAnalysisSummary[];
  studyRecords: StudyRecord[];
}

interface PublicAnalysisRow extends PublicAnalysisSummary {
  studyAvailable: boolean;
  studyDisplayName: string;
  isExample: boolean;
}

function PublicAnalysesTable({
  publicAnalysisList,
  studyRecords,
  makeAnalysisLink,
  makeStudyLink,
  exampleAnalysesAuthor,
}: TableProps) {
  const history = useHistory();
  const location = useLocation();

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

  const [tableSort, setTableSort] = useSessionBackedState<MesaSortObject>(
    { columnKey: 'modificationTime', direction: 'desc' },
    'eda::publicAnalysesSort',
    JSON.stringify,
    JSON.parse
  );

  const [exampleSort, setExampleSort] = useSessionBackedState<boolean>(
    true,
    'eda::publicAnalysesExampleSort',
    JSON.stringify,
    JSON.parse
  );

  const unfilteredRows: PublicAnalysisRow[] = useMemo(() => {
    const studiesById = keyBy(studyRecords, (study) => study.id[0].value);

    return publicAnalysisList.map((publicAnalysis) => ({
      ...publicAnalysis,
      studyAvailable: Boolean(studiesById[publicAnalysis.studyId]),
      studyDisplayName:
        studiesById[publicAnalysis.studyId]?.displayName ?? 'Unknown study',
      isExample: publicAnalysis.userId === exampleAnalysesAuthor,
    }));
  }, [publicAnalysisList, studyRecords, exampleAnalysesAuthor]);

  const offerExampleSortControl = useMemo(
    () =>
      unfilteredRows.some((row) => row.isExample) &&
      unfilteredRows.some((row) => !row.isExample),
    [unfilteredRows]
  );

  const filteredRows = useMemo(() => {
    if (!debouncedSearchText) {
      return unfilteredRows;
    }

    const normalizedSearchText = debouncedSearchText.toLowerCase();

    return unfilteredRows.filter(
      (row) =>
        row.displayName.toLowerCase().includes(normalizedSearchText) ||
        row.studyDisplayName.toLowerCase().includes(normalizedSearchText)
    );
  }, [unfilteredRows, debouncedSearchText]);

  const sortedRows = useMemo(
    () =>
      orderBy(
        filteredRows,
        [
          exampleSort && offerExampleSortControl
            ? (row) => row.isExample
            : () => 0,
          (row) => {
            switch (tableSort?.columnKey) {
              case 'studyId':
                return row.studyDisplayName;
              case 'analysisId':
                return row.displayName;
              case 'description':
                return row.description;
              case 'userName':
                return row.userName;
              case 'userOrganization':
                return row.userOrganization;
              case 'creationTime':
                return row.creationTime;
              case 'modificationTime':
                return row.modificationTime;
              default:
                console.warn(
                  `Tried to sort by an unrecognized column key '${tableSort?.columnKey}'.`
                );
            }
          },
        ],
        ['desc', tableSort?.direction]
      ),
    [filteredRows, tableSort, exampleSort, offerExampleSortControl]
  );

  const columns: MesaColumn<keyof PublicAnalysisRow>[] = useMemo(
    () => [
      {
        key: 'studyId',
        name: 'Study',
        sortable: true,
        renderCell: (data: { row: PublicAnalysisRow }) =>
          !data.row.studyAvailable ? (
            data.row.studyDisplayName
          ) : (
            <Link to={makeStudyLink(data.row.studyId)}>
              {data.row.studyDisplayName}
            </Link>
          ),
      },
      {
        key: 'analysisId',
        name: 'Analysis',
        sortable: true,
        renderCell: (data: { row: PublicAnalysisRow }) =>
          !data.row.studyAvailable ? (
            data.row.displayName
          ) : (
            <Link
              to={makeAnalysisLink(
                data.row.studyId,
                data.row.analysisId,
                data.row.userId
              )}
            >
              {data.row.displayName}
            </Link>
          ),
      },
      {
        key: 'description',
        name: 'Description',
        sortable: true,
        renderCell: (data: { row: PublicAnalysisRow }) => (
          <OverflowingTextCell
            key={data.row.analysisId}
            value={data.row.description}
          />
        ),
        width: '25em',
      },
      {
        key: 'userName',
        name: 'Author',
        sortable: true,
      },
      {
        key: 'userOrganization',
        name: 'Organization',
        sortable: true,
      },
      {
        key: 'creationTime',
        name: 'Created',
        sortable: true,
        renderCell: (data: { row: PublicAnalysisRow }) =>
          convertISOToDisplayFormat(data.row.creationTime),
      },
      {
        key: 'modificationTime',
        name: 'Modified',
        sortable: true,
        renderCell: (data: { row: PublicAnalysisRow }) =>
          convertISOToDisplayFormat(data.row.modificationTime),
      },
    ],
    [makeAnalysisLink, makeStudyLink]
  );

  const tableUiState = useMemo(() => ({ sort: tableSort }), [tableSort]);

  const tableEventHandlers = useMemo(
    () => ({
      onSort: (column: any, direction: any) => {
        setTableSort({ columnKey: column?.key, direction });
      },
    }),
    [setTableSort]
  );

  const tableOptions = useMemo(
    () => ({
      toolbar: true,
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
            {unfilteredRows.length === 0
              ? 'There are no public analyses available'
              : 'There are no public analyses that match your search'}
          </div>
        </div>
      ),
      deriveRowClassName: (row: PublicAnalysisRow) =>
        row.isExample ? 'ExampleRow' : undefined,
    }),
    [unfilteredRows]
  );

  const tableState = useMemo(
    () =>
      createTableState({
        rows: sortedRows,
        columns,
        uiState: tableUiState,
        eventHandlers: tableEventHandlers,
        options: tableOptions,
      }),
    [sortedRows, columns, tableUiState, tableEventHandlers, tableOptions]
  );

  return (
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
          label="Search public analyses"
          inputProps={{ size: 50 }}
          value={searchText}
          onChange={onFilterFieldChange}
        />
        <span>
          Showing {filteredRows.length} of {unfilteredRows.length} analyses
        </span>
      </div>
      {offerExampleSortControl && (
        <FormControlLabel
          control={
            <Switch
              color="primary"
              size="small"
              checked={exampleSort}
              onChange={(e) => setExampleSort(e.target.checked)}
            />
          }
          label="Sort examples to top"
          style={{
            padding: '1em',
          }}
        />
      )}
    </Mesa.Mesa>
  );
}
