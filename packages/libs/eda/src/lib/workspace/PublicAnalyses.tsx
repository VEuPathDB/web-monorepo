import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router';

import {
  FormControlLabel,
  Switch,
  TextField,
  makeStyles,
} from '@material-ui/core';
import { keyBy, orderBy } from 'lodash';

import {
  Link,
  Loading,
  Mesa,
  SaveableTextEditor,
} from '@veupathdb/wdk-client/lib/Components';
import { create as createTableState } from '@veupathdb/coreui/lib/components/Mesa/Utils/MesaState';
import {
  MesaColumn,
  MesaSortObject,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { stripHTML } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { OverflowingTextCell } from '@veupathdb/wdk-client/lib/Views/Strategy/OverflowingTextCell';

import { useDebounce } from '../core/hooks/debouncing';
import {
  AnalysisClient,
  PromiseHookState,
  PromiseResult,
  PublicAnalysisSummary,
  StudyRecord,
  useEditablePublicAnalysisList,
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
  analysisClient: AnalysisClient;
  publicAnalysisListState: PromiseHookState<PublicAnalysisSummary[]>;
  studyRecords: StudyRecord[] | undefined;
  makeAnalysisLink: (analysisId: string) => string;
  exampleAnalysesAuthors?: number[];
}

export function PublicAnalyses({
  publicAnalysisListState,
  studyRecords,
  ...tableProps
}: Props) {
  const styles = useStyles();
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);

  return (
    <div className={styles.root}>
      <h1>Public Analyses</h1>
      <PromiseResult state={publicAnalysisListState}>
        {(publicAnalysisList) =>
          studyRecords == null || user == null ? (
            <Loading />
          ) : (
            <PublicAnalysesTable
              {...tableProps}
              userId={user.id}
              studyRecords={studyRecords}
              publicAnalysisList={publicAnalysisList}
            />
          )
        }
      </PromiseResult>
    </div>
  );
}

interface TableProps extends Omit<Props, 'publicAnalysisListState'> {
  userId: number;
  publicAnalysisList: PublicAnalysisSummary[];
  studyRecords: StudyRecord[];
}

interface PublicAnalysisRow extends PublicAnalysisSummary {
  studyAvailable: boolean;
  studyDisplayName: string;
  studyDisplayNameHTML: string;
  creationTimeDisplay: string;
  modificationTimeDisplay: string;
  isExample: boolean;
}

function PublicAnalysesTable({
  analysisClient,
  publicAnalysisList,
  studyRecords,
  makeAnalysisLink,
  exampleAnalysesAuthors,
  userId,
}: TableProps) {
  const { publicAnalysesState, updateAnalysis } = useEditablePublicAnalysisList(
    publicAnalysisList,
    analysisClient
  );

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

    return publicAnalysesState.map((publicAnalysis) => ({
      ...publicAnalysis,
      studyAvailable: Boolean(studiesById[publicAnalysis.studyId]),
      studyDisplayName: stripHTML(
        studiesById[publicAnalysis.studyId]?.displayName ?? 'Unknown study'
      ),
      studyDisplayNameHTML:
        studiesById[publicAnalysis.studyId]?.displayName ?? 'Unknown study',
      creationTimeDisplay: convertISOToDisplayFormat(
        publicAnalysis.creationTime
      ),
      modificationTimeDisplay: convertISOToDisplayFormat(
        publicAnalysis.modificationTime
      ),
      isExample: !!exampleAnalysesAuthors?.includes(publicAnalysis.userId),
    }));
  }, [publicAnalysesState, studyRecords, exampleAnalysesAuthors]);

  const offerExampleSortControl = useMemo(
    () =>
      unfilteredRows.some((row) => row.isExample) &&
      unfilteredRows.some((row) => !row.isExample),
    [unfilteredRows]
  );

  const searchableColumns = useMemo(
    () =>
      [
        'studyDisplayName',
        'displayName',
        'description',
        'userName',
        'userOrganization',
        'creationTimeDisplay',
        'modificationTimeDisplay',
      ] as const,
    []
  );

  const filteredRows = useMemo(() => {
    if (!debouncedSearchText) {
      return unfilteredRows;
    }

    const normalizedSearchText = debouncedSearchText.toLowerCase();

    return unfilteredRows.filter((row) =>
      searchableColumns.some((columnKey) =>
        row[columnKey]?.toLowerCase().includes(normalizedSearchText)
      )
    );
  }, [searchableColumns, unfilteredRows, debouncedSearchText]);

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
          safeHtml(data.row.studyDisplayNameHTML),
      },
      {
        key: 'analysisId',
        name: 'Analysis',
        sortable: true,
        style: { maxWidth: '200px' },
        renderCell: (data: { row: PublicAnalysisRow }) => (
          <div style={{ display: 'block', maxWidth: '100%' }}>
            <SaveableTextEditor
              key={data.row.analysisId}
              value={data.row.displayName}
              readOnly={!data.row.studyAvailable || data.row.userId !== userId}
              displayValue={(value) =>
                !data.row.studyAvailable ? (
                  value
                ) : (
                  <Link to={makeAnalysisImportLink(makeAnalysisLink, data.row)}>
                    {value}
                  </Link>
                )
              }
              onSave={(newName) => {
                if (newName) {
                  updateAnalysis(data.row.analysisId, { displayName: newName });
                }
              }}
            />
          </div>
        ),
      },
      {
        key: 'description',
        name: 'Description',
        sortable: true,
        renderCell: (data: { row: PublicAnalysisRow }) => {
          const analysisId = data.row.analysisId;
          const descriptionStr = data.row.description ?? '';

          return exampleAnalysesAuthors?.includes(userId) &&
            data.row.userId === userId ? (
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
          data.row.creationTimeDisplay,
      },
      {
        key: 'modificationTime',
        name: 'Modified',
        sortable: true,
        renderCell: (data: { row: PublicAnalysisRow }) =>
          data.row.modificationTimeDisplay,
      },
    ],
    [makeAnalysisLink, updateAnalysis, exampleAnalysesAuthors, userId]
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
        offerExampleSortControl && row.isExample ? 'ExampleRow' : undefined,
    }),
    [unfilteredRows, offerExampleSortControl]
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

function makeAnalysisImportLink(
  makeAnalysisLink: Props['makeAnalysisLink'],
  row: PublicAnalysisRow
) {
  return makeAnalysisLink(row.analysisId);
}
