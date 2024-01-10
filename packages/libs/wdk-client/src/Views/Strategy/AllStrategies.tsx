import { groupBy, last, orderBy, partition, truncate } from 'lodash';
import React, { useMemo } from 'react';

import { StrategySummary } from '../../Utils/WdkUser';
import { formatDateTimeString } from '../../Views/Strategy/StrategyUtils';
import { Link } from 'react-router-dom';
import { MesaState, Mesa } from '@veupathdb/coreui/lib/components/Mesa';
import { RecordClass } from '../../Utils/WdkModel';
import Tabs from '../../Components/Tabs/Tabs';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';

import { MesaSortObject } from '../../Core/CommonTypes';
import RealTimeSearchBox from '../../Components/SearchBox/RealTimeSearchBox';
import { StrategyControls } from '../../Views/Strategy/StrategyControls';

import Icon from '../../Components/Icon/IconAlt';
import LoadingOverlay from '../../Components/Loading/LoadingOverlay';

import './AllStrategies.scss';
import Tooltip from '../../Components/Overlays/Tooltip';
import { OverflowingTextCell } from '../../Views/Strategy/OverflowingTextCell';

const cx = makeClassNameHelper('AllStrategies');

interface BatchOperation {
  (ids: number[]): void;
}

interface Props {
  strategiesLoading?: boolean;
  strategies: StrategySummary[];
  recordClasses: RecordClass[];

  goToStrategy: (strategyId: number, stepId?: number) => void;

  activeTab?: string;
  setActiveTab: (tabId: string) => void;

  searchTermsByTableId: Record<string, string | undefined>;
  setSearchTerm: (tableId: string, searchTerm: string) => void;

  updatePublicStatus: (id: number, isPublic: boolean) => void;

  deleteStrategies: BatchOperation;

  selectionByTableId: Record<string, number[] | undefined>;
  addToSelection: (tableId: string, ids: number[]) => void;
  removeFromSelection: (tableId: string, ids: number[]) => void;

  openedStrategies?: number[];
  addToOpenedStrategies: BatchOperation;
  removeFromOpenedStrategies: BatchOperation;

  sortByTableId: Record<string, MesaSortObject | undefined>;
  onSort: (tableId: string, sort: MesaSortObject) => void;
}

export default function AllStrategies(props: Props) {
  const {
    strategies,
    recordClasses,
    activeTab,
    setActiveTab,
    strategiesLoading,
  } = props;
  const strategiesByRecordClass = useMemo(
    () => groupBy(strategies, 'recordClassName'),
    [strategies]
  );
  const tabs = recordClasses
    .map((rc): [RecordClass, StrategySummary[] | undefined] => [
      rc,
      strategiesByRecordClass[rc.urlSegment],
    ])
    .filter(
      (entry): entry is [RecordClass, StrategySummary[]] => entry[1] != null
    )
    .map(([rc, strategies]) => ({
      key: rc.urlSegment,
      display: (
        <React.Fragment>
          {rc.displayNamePlural} ({strategies.length.toLocaleString()})
        </React.Fragment>
      ),
      content: (
        <StrategiesTab
          {...props}
          strategies={strategies}
          tableIdPrefix={rc.urlSegment}
        />
      ),
    }));

  if (tabs.length === 0) return <div>You do not have any strategies.</div>;

  return (
    <React.Fragment>
      <div className={cx()}>
        {strategiesLoading && (
          <LoadingOverlay>Updating strategies</LoadingOverlay>
        )}
        <Tabs
          activeTab={activeTab || tabs[0].key}
          tabs={tabs}
          onTabSelected={setActiveTab}
          containerClassName={cx()}
        />
      </div>
    </React.Fragment>
  );
}

type TabContentProps = Props & {
  tableIdPrefix: string;
};

function StrategiesTab(props: TabContentProps) {
  const [savedStrategies, unsavedStrategies] = partition(
    props.strategies,
    (strategy: StrategySummary) => strategy.isSaved
  );
  const content = [
    { strategies: unsavedStrategies, isSaved: false },
    { strategies: savedStrategies, isSaved: true },
  ].map(({ strategies, isSaved }) => {
    const tableId = props.tableIdPrefix + '_' + (isSaved ? 'saved' : 'unsaved');
    return (
      strategies.length > 0 && (
        <StrategiesTable
          key={isSaved ? 'saved' : 'unsaved'}
          isSaved={isSaved}
          title={`${
            isSaved ? 'Saved' : 'Draft'
          } Strategies (${strategies.length.toLocaleString()})`}
          searchTerm={props.searchTermsByTableId[tableId]}
          setSearchTerm={(searchTerm) =>
            props.setSearchTerm(tableId, searchTerm)
          }
          strategies={strategies}
          goToStrategy={props.goToStrategy}
          selection={props.selectionByTableId[tableId]}
          addToSelection={(ids) => props.addToSelection(tableId, ids)}
          removeFromSelection={(ids) => props.removeFromSelection(tableId, ids)}
          opened={props.openedStrategies}
          addToOpened={props.addToOpenedStrategies}
          removeFromOpened={props.removeFromOpenedStrategies}
          sort={props.sortByTableId[tableId]}
          onSort={(sort: MesaSortObject) => props.onSort(tableId, sort)}
          updatePublicStatus={props.updatePublicStatus}
          deleteStrategies={props.deleteStrategies}
        />
      )
    );
  });
  return (
    <React.Fragment>
      <div className={cx('--Info')}>
        <Icon fa="info-circle" className={cx('--InfoIcon')} />
        <div>
          <strong>Strategy results are not stored</strong>, only the strategy
          steps and parameter values are.&nbsp;
          <strong>Results might change</strong> with subsequent releases of the
          site if the underlying data has changed.
        </div>
      </div>
      {content}
    </React.Fragment>
  );
}

interface CellRenderProps<T> {
  row: StrategySummary;
  value: T;
}

const invalidIcon = (
  <Tooltip content="Indicates that a strategy is invalid. You can fix errors by opening your strategy and updating steps marked as invalid.">
    <i className={`${cx('--InvalidIcon')} fa fa-ban`} />
  </Tooltip>
);

function makeColumns(
  isSaved: boolean,
  updatePublicStatus: TableProps['updatePublicStatus']
) {
  return [
    {
      key: 'isValid',
      name: invalidIcon,
      className: cx('--TableCell', 'isValid'),
      renderCell: ({ value }: CellRenderProps<boolean>) =>
        value ? null : invalidIcon,
      sortable: true,
    },
    {
      key: 'name',
      name: 'Strategy',
      className: cx('--TableCell', 'name'),
      sortable: true,
      renderCell: ({ row, value }: CellRenderProps<string>) => {
        const path = row.isValid
          ? `${row.strategyId}/${row.rootStepId}`
          : row.strategyId;
        return (
          <React.Fragment>
            <Link to={`/workspace/strategies/${path}`}>{value}</Link>
          </React.Fragment>
        );
      },
      width: '25em',
    },
    {
      key: 'description',
      name: 'Description',
      className: cx('--TableCell', 'description'),
      renderCell: ({ value, row }: CellRenderProps<string>) => (
        <OverflowingTextCell
          value={value || row.nameOfFirstStep || ''}
          key={row.strategyId}
        />
      ),
      width: '25em',
    },
    {
      key: 'leafAndTransformStepCount',
      name: '# steps',
      className: cx('--TableCell', 'leafAndTransformStepCount'),
      sortable: true,
    },
    {
      key: 'actions',
      name: 'Actions',
      className: cx('--TableCell', 'actions'),
      renderCell: ({ row }: CellRenderProps<void>) => (
        <StrategyControls strategyId={row.strategyId} />
      ),
    },
    {
      key: 'isPublic',
      name: 'Public',
      className: cx('--TableCell', 'isPublic'),
      sortable: true,
      renderCell: ({ row, value }: CellRenderProps<boolean>) => (
        <input
          type="checkbox"
          title={
            row.isSaved
              ? 'Make this strategy public for others to discover on the Public Strategies page.'
              : 'Only saved strategies can be made public.'
          }
          checked={value}
          disabled={!row.isSaved}
          onChange={(e) => updatePublicStatus(row.strategyId, e.target.checked)}
        />
      ),
    },
    {
      key: 'createdTime',
      name: 'Created',
      className: cx('--TableCell', 'createdTime'),
      sortable: true,
      renderCell: formatDateTime,
      width: '9em',
    },
    {
      key: 'lastModified',
      name: 'Modified',
      className: cx('--TableCell', 'lastModified'),
      sortable: true,
      renderCell: formatDateTime,
      width: '9em',
    },
    {
      key: 'releaseVersion',
      name: 'Version',
      className: cx('--TableCell', 'releaseVersion'),
      sortable: true,
    },
    {
      key: 'estimatedSize',
      name: 'Result size',
      className: cx('--TableCell', 'estimatedSize'),
      sortable: true,
      renderCell: ({ value }: CellRenderProps<number | undefined>) =>
        value == null ? '?' : value.toLocaleString(),
    },
  ];
}

function makeActions(
  addToOpened: TableProps['addToOpened'],
  goToStrategy: TableProps['goToStrategy'],
  removeFromOpened: TableProps['removeFromOpened'],
  removeFromSelection: TableProps['removeFromSelection'],
  deleteStrategies: TableProps['deleteStrategies']
) {
  const handleOpen = makeActionCallback(addToOpened, removeFromSelection);
  return [
    {
      selectionRequired: true,
      element: (
        <button type="button" className="btn">
          Open
        </button>
      ),
      callback: (selection: StrategySummary[]) => {
        const target = last(selection);
        handleOpen(selection);
        if (target) goToStrategy(target.strategyId, target.rootStepId);
      },
    },
    {
      selectionRequired: true,
      element: (
        <button type="button" className="btn">
          Close
        </button>
      ),
      callback: makeActionCallback(removeFromOpened, removeFromSelection),
    },
    {
      selectionRequired: true,
      element: (
        <button type="button" className="btn">
          Delete
        </button>
      ),
      callback: makeActionCallback(deleteStrategies, removeFromSelection),
    },
  ];
}

function makeMesaOptions(
  selection: TableProps['selection'] = [],
  opened: TableProps['opened'] = []
) {
  return {
    useStickyHeader: true,
    tableBodyMaxHeight: 'calc(80vh - 200px)',
    isRowSelected: (row: StrategySummary) => selection.includes(row.strategyId),
    deriveRowClassName: (strategy: StrategySummary) =>
      opened.includes(strategy.strategyId) ? cx('--OpenedRow') : undefined,
  };
}

function makeMesaEventHandlers(
  onSort: TableProps['onSort'],
  addToSelection: TableProps['addToSelection'],
  removeFromSelection: TableProps['removeFromSelection']
) {
  return {
    // sort
    onSort: (
      { key }: { key: string },
      direction: MesaSortObject['direction']
    ) => {
      onSort({ columnKey: key, direction });
    },

    // selection
    onRowSelect: (row: StrategySummary) => {
      addToSelection([row.strategyId]);
    },
    onRowDeselect: (row: StrategySummary) => {
      removeFromSelection([row.strategyId]);
    },
    onMultipleRowSelect: (rows: StrategySummary[]) => {
      addToSelection(rows.map((row) => row.strategyId));
    },
    onMultipleRowDeselect: (rows: StrategySummary[]) => {
      removeFromSelection(rows.map((row) => row.strategyId));
    },
  };
}

function makeMesaUiState(sort: MesaSortObject) {
  return { sort };
}

function makeMesaRows(
  strategies: TableProps['strategies'],
  sort: MesaSortObject
) {
  return orderBy(strategies, [sort.columnKey], [sort.direction]);
}

function makeMesaFilteredRows(
  rows: TableProps['strategies'],
  searchTerm: string
) {
  if (!searchTerm) return rows;
  return rows.filter(
    (strategy) =>
      strategy.name.toLowerCase().includes(searchTerm) ||
      (strategy.nameOfFirstStep &&
        strategy.nameOfFirstStep.toLowerCase().includes(searchTerm)) ||
      (strategy.description &&
        strategy.description.toLowerCase().includes(searchTerm))
  );
}

interface TableProps {
  title: string;
  strategies: StrategySummary[];
  isSaved: boolean;

  updatePublicStatus: (id: number, isPublic: boolean) => void;

  goToStrategy: (strategyId: number, stepId?: number) => void;

  searchTerm?: string;
  setSearchTerm: (searchTerm: string) => void;

  selection: number[] | undefined;
  addToSelection: BatchOperation;
  removeFromSelection: BatchOperation;

  opened?: number[];
  addToOpened: BatchOperation;
  removeFromOpened: BatchOperation;

  deleteStrategies: BatchOperation;

  sort?: MesaSortObject;
  onSort: (sort: MesaSortObject) => void;
}

function StrategiesTable(props: TableProps) {
  const {
    isSaved,
    updatePublicStatus,
    goToStrategy,

    strategies,

    selection = [],
    addToSelection,
    removeFromSelection,

    searchTerm = '',
    setSearchTerm,

    opened = [],
    addToOpened,
    removeFromOpened,

    deleteStrategies,

    sort = { columnKey: 'lastModified', direction: 'desc' } as MesaSortObject,
    onSort,
  } = props;

  const mesaColumns = useMemo(
    () => makeColumns(isSaved, updatePublicStatus),
    [isSaved, updatePublicStatus]
  );
  const mesaActions = useMemo(
    () =>
      makeActions(
        addToOpened,
        goToStrategy,
        removeFromOpened,
        removeFromSelection,
        deleteStrategies
      ),
    [
      addToOpened,
      goToStrategy,
      removeFromOpened,
      removeFromSelection,
      deleteStrategies,
    ]
  );
  const mesaOptions = useMemo(
    () => makeMesaOptions(selection, opened),
    [selection, opened]
  );
  const mesaEventHandlers = useMemo(
    () => makeMesaEventHandlers(onSort, addToSelection, removeFromSelection),
    [onSort, addToSelection, removeFromSelection]
  );
  const uiState = useMemo(() => makeMesaUiState(sort), [sort]);
  const mesaRows = useMemo(
    () => makeMesaRows(strategies, sort),
    [strategies, sort]
  );
  const mesaFilteredRows = useMemo(
    () => makeMesaFilteredRows(mesaRows, searchTerm.toLowerCase()),
    [mesaRows, searchTerm]
  );

  const tableState = MesaState.create({
    rows: mesaRows,
    filteredRows: mesaFilteredRows,
    columns: mesaColumns,
    options: mesaOptions,
    actions: mesaActions,
    eventHandlers: mesaEventHandlers,
    uiState,
  });

  return (
    <React.Fragment>
      <Mesa state={tableState}>
        <h3 className={cx('--Title')}>{props.title}</h3>
        <RealTimeSearchBox
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          placeholderText="Filter strategies"
        />
      </Mesa>
    </React.Fragment>
  );
}

function TruncatedText({
  value,
  length = 50,
}: {
  value: string;
  length?: number;
}) {
  const truncated = truncate(value, { length });
  const title = value !== truncated ? value : '';
  return <span title={title}>{truncated}</span>;
}

function formatDateTime(props: CellRenderProps<string>) {
  return formatDateTimeString(props.value);
}

function makeActionCallback(...operations: BatchOperation[]) {
  return function callback(selection: StrategySummary[]) {
    const ids = selection.map((s) => s.strategyId);
    for (const operation of operations) operation(ids);
  };
}
