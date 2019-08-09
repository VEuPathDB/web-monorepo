import { groupBy, orderBy, partition, truncate } from 'lodash';
import React from 'react';

import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import StrategyHeader from 'wdk-client/Views/Strategy/StrategyHeader';
import { Link } from 'react-router-dom';
import { MesaState, Mesa } from 'wdk-client/Components/Mesa';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import Tabs from 'wdk-client/Components/Tabs/Tabs';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import './AllStrategies.scss';
import { MesaSortObject } from 'wdk-client/Core/CommonTypes';

const cx = makeClassNameHelper('AllStrategies');

interface BatchOperation {
  (ids: number[]): void;
}

interface Props {
  strategies: StrategySummary[];
  recordClasses: RecordClass[];
  
  activeTab?: string;
  setActiveTab: (tabId: string) => void;
  
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
  const { strategies, recordClasses, activeTab, setActiveTab } = props;
  const strategiesByRecordClass = groupBy(strategies, 'recordClassName');
  const tabs = recordClasses
    .map((rc): [ RecordClass, StrategySummary[] | undefined ] => [rc, strategiesByRecordClass[rc.urlSegment]])
    .filter((entry): entry is [ RecordClass, StrategySummary[]] => entry[1] != null)
    .map(([ rc, strategies ]) => ({
      key: rc.urlSegment,
      display: <React.Fragment>{rc.displayNamePlural} ({strategies.length.toLocaleString()})</React.Fragment>,
      content: <StrategiesTab {...props} strategies={strategies} tableIdPrefix={rc.urlSegment} />
    }))
  
  if (tabs.length === 0) return (
    <div>You do not have any strategies.</div>
  );

  return (
    <React.Fragment>
      <StrategyHeader/>
      <Tabs
        activeTab={activeTab || tabs[0].key}
        tabs={tabs}
        onTabSelected={setActiveTab}
        containerClassName={cx()}
      />
    </React.Fragment>
  )
}

type TabContentProps = Props & {
  tableIdPrefix: string;
};

function StrategiesTab(props: TabContentProps) {
  const [ savedStrategies, unsavedStrategies ] = partition(props.strategies, (strategy: StrategySummary) => strategy.isSaved);
  const content = [
    { strategies: savedStrategies, isSaved: true },
    { strategies: unsavedStrategies, isSaved: false }
  ].map(({ strategies, isSaved }) => {
    const tableId = props.tableIdPrefix + '_' + (isSaved ? 'saved' : 'unsaved');
    return strategies.length > 0 && (
      <StrategiesTable
        key={isSaved ? 'saved' : 'unsaved'}
        title={`${isSaved ? 'Saved' : 'Unsaved'} Strategies (${strategies.length.toLocaleString()})`}
        strategies={strategies}
        selection={props.selectionByTableId[tableId]}
        addToSelection={ids => props.addToSelection(tableId, ids)}
        removeFromSelection={ids => props.removeFromSelection(tableId, ids)}
        opened={props.openedStrategies}
        addToOpened={props.addToOpenedStrategies}
        removeFromOpened={props.removeFromOpenedStrategies}
        sort={props.sortByTableId[tableId]}
        onSort={(sort: MesaSortObject) => props.onSort(tableId, sort)}
        updatePublicStatus={props.updatePublicStatus}
        deleteStrategies={props.deleteStrategies}
      />
    )
  });
  return (
    <React.Fragment>
      {content}
    </React.Fragment>
  )
}

interface CellRenderProps<T> {
  row: StrategySummary;
  value: T;
}

interface TableProps {
  title: string;
  strategies: StrategySummary[];

  updatePublicStatus: (id: number, isPublic: boolean) => void;
  
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

    updatePublicStatus,

    selection = [],
    addToSelection,
    removeFromSelection,

    opened = [],
    addToOpened,
    removeFromOpened,

    deleteStrategies,

    sort = { columnKey: 'lastModified', direction: 'desc' },
    onSort

  } = props;
  
  const mesaColumns = [
    {
      key: 'name',
      name: 'Strategy',
      className: cx('--TableCell', 'name'),
      sortable: true,
      renderCell: (({ row, value }: CellRenderProps<string>) =>
        <React.Fragment>
          <Link to={`/workspace/strategies/${row.strategyId}/${row.rootStepId}`}>{value}</Link>&nbsp;
          {!row.isValid && <i className={`${cx('--InvalidIcon')} fa fa-ban`} />}
        </React.Fragment>
      )
    },
    {
      key: 'nameOfFirstStep',
      name: 'First Step',
      className: cx('--TableCell', 'nameOfFirstStep'),
      sortable: true,
      renderCell: TruncatedText
    },
    {
      key: 'description',
      name: 'Description',
      className: cx('--TableCell', 'description'),
      renderCell: TruncatedText
    },
    {
      key: 'isPublic',
      name: 'Public',
      className: cx('--TableCell', 'isPublic'),
      sortable: true,
      renderCell: ({ row, value }: CellRenderProps<boolean>) =>
        <input
          type="checkbox"
          title={row.isSaved ? 'Make this strategy public for others to discover on the Public Strategies page.' : 'Only saved strategies can be made public.'}
          checked={value}
          disabled={!row.isSaved}
          onChange={(e) => updatePublicStatus(row.strategyId, e.target.checked)}
        />
    },
    {
      key: 'createdTime',
      name: 'Created',
      className: cx('--TableCell', 'createdTime'),
      sortable: true,
    },
    {
      key: 'lastModified',
      name: 'Last Modified',
      className: cx('--TableCell', 'lastModified'),
      sortable: true,
    },
    {
      key: 'releaseVersion',
      name: 'Version',
      className: cx('--TableCell', 'releaseVersion'),
      sortable: true,
    },
    {
      key: 'estimatedSize',
      name: 'Size',
      className: cx('--TableCell', 'estimatedSize'),
      sortable: true,
      renderCell: ({ value }: CellRenderProps<number|undefined>) => value == null ? '?' : value.toLocaleString()
    }
  ];
  
  const mesaActions = [
    {
      selectionRequired: true,
      element: <button type="button" className="btn">Open</button>,
      callback: makeActionCallback(addToOpened, removeFromSelection)
    },
    {
      selectionRequired: true,
      element: <button type="button" className="btn">Close</button>,
      callback: makeActionCallback(removeFromOpened, removeFromSelection)
    },
    {
      selectionRequired: true,
      element: <button type="button" className="btn">Delete</button>,
      callback: makeActionCallback(deleteStrategies, removeFromSelection)
    }
  ];

    
  const mesaOptions = {
    useStickyHeader: true,
    tableBodyMaxHeight: 'calc(80vh - 200px)',
    isRowSelected: (row: StrategySummary) => selection.includes(row.strategyId),
    deriveRowClassName: (strategy: StrategySummary) => opened.includes(strategy.strategyId) ? cx('--OpenedRow') : undefined
  };
    
  const mesaEventHandlers = {
    // sort
    onSort: ({ key }: { key: string }, direction: MesaSortObject['direction']) => {
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
      addToSelection(rows.map(row => row.strategyId));
    },
    onMultipleRowDeselect: (rows: StrategySummary[]) => {
      removeFromSelection(rows.map(row => row.strategyId));
    },
  
  };

  const uiState = {
    sort,
  };

  const mesaRows = orderBy(props.strategies, [sort.columnKey], [sort.direction]);
  
  const tableState = MesaState.create({
    rows: mesaRows,
    columns: mesaColumns,
    options: mesaOptions,
    actions: mesaActions,
    eventHandlers: mesaEventHandlers,
    uiState
  });

  return (
    <React.Fragment>
      <Mesa state={tableState}>
        <h3 className={cx('--Title')}>{props.title}</h3>
      </Mesa>
    </React.Fragment>
  )
}

function TruncatedText({ value, length = 50 }: { value: string, length?: number }) {
  const truncated = truncate(value, { length });
  const title = value !== truncated ? value : '';
  return (
    <span title={title}>{truncated}</span>
  )
}

function makeActionCallback(...operations: BatchOperation[]) {
  return function callback(selection: StrategySummary[]) {
    const ids = selection.map(s => s.strategyId);
    for (const operation of operations) operation(ids);
  }
}
