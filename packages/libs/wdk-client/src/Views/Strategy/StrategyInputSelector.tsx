import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';

import { orderBy } from 'lodash';

import { Loading, RealTimeSearchBox } from 'wdk-client/Components';
import Mesa, { MesaState } from 'wdk-client/Components/Mesa'
import { MesaSortObject, MesaColumn } from 'wdk-client/Core/CommonTypes';
import { RootState } from 'wdk-client/Core/State/Types';
import { useWdkEffect } from 'wdk-client/Service/WdkService';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { StrategySummary, StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { OverflowingTextCell } from 'wdk-client/Views/Strategy/OverflowingTextCell';

import 'wdk-client/Views/Strategy/StrategyInputSelector.scss';

const cx = makeClassNameHelper('StrategyInputSelector');

type StateProps = {
  openedStrategies?: Set<number>;
};

type OwnProps = {
  onStrategySelected: (strategyId: number) => void,
  primaryInput: StrategyDetails,
  secondaryInputRecordClass: RecordClass,
  selectedStrategyId?: number
};

type Props = StateProps & OwnProps;

type StrategyInputCellProps<T> = {
  value: T,
  row: StrategySummary
};

const StrategyInputSelectorView = ({
  openedStrategies,
  onStrategySelected,
  primaryInput,
  secondaryInputRecordClass,
  selectedStrategyId
}: Props) => {
  const [ strategies, setStrategies ] = useState<StrategySummary[] | undefined>(undefined);

  useWdkEffect(wdkService => {
    wdkService.getStrategies().then(setStrategies);
  }, []);

  const openedStrategyChoices = useMemo(
    () => strategies && openedStrategies && strategies.filter(
      ({ recordClassName, strategyId }) => (
        recordClassName === secondaryInputRecordClass.urlSegment &&
        openedStrategies.has(strategyId) &&
        strategyId !== primaryInput.strategyId
      )
    ),
    [ strategies, openedStrategies ]
  );

  const savedStrategyChoices = useMemo(
    () => strategies && strategies.filter(
      ({ isSaved, recordClassName, strategyId }) => (
        recordClassName === secondaryInputRecordClass.urlSegment &&
        isSaved &&
        strategyId !== primaryInput.strategyId
      )
    ),
    [ strategies ]
  );

  return (
    !savedStrategyChoices ||
    !openedStrategyChoices ||
    selectedStrategyId !== undefined
  )
    ? <Loading />
    : (
      <div className={cx()}>
        {
          openedStrategyChoices.length > 0 &&
          <div className={cx('--OpenedStrategies')}>
            <StrategyInputSelectorTable
              tableTitle="Opened Strategies"
              strategyChoices={openedStrategyChoices}
              onStrategySelected={onStrategySelected}
            />
          </div>
        }
        {
          savedStrategyChoices.length > 0 &&
          <div className={cx('--SavedStrategies')}>
            <StrategyInputSelectorTable
              tableTitle="Saved Strategies"
              strategyChoices={savedStrategyChoices}
              onStrategySelected={onStrategySelected}
            />
          </div>
        }
      </div>
    );
};

const mapStateToProps = ({ strategyWorkspace }: RootState): StateProps => ({
  openedStrategies: strategyWorkspace.openedStrategies && new Set(strategyWorkspace.openedStrategies)
});

export const StrategyInputSelector = connect(mapStateToProps)(StrategyInputSelectorView);

type StrategyInputSelectorTableProps = {
  tableTitle: string,
  strategyChoices: StrategySummary[],
  onStrategySelected: (strategyId: number) => void
}

const StrategyInputSelectorTable = ({
  tableTitle,
  strategyChoices,
  onStrategySelected
}: StrategyInputSelectorTableProps) => {
  const [ sort, setSort ] = useState<MesaSortObject>({ columnKey: 'name', direction: 'asc' });
  const [ searchTerm, setSearchTerm ] = useState('');

  const mesaColumns = useMemo(() => makeMesaColumns(onStrategySelected), [ onStrategySelected ]);
  const mesaRows = useMemo(() => makeMesaRows(strategyChoices, sort), [ strategyChoices, sort ]);
  const mesaFilteredRows = useMemo(
    () => makeMesaFilteredRows(mesaRows, mesaColumns, searchTerm),
    [ mesaRows, mesaColumns, searchTerm ]
  );

  const mesaOptions = useMemo(() => makeMesaOptions(), []);
  const mesaActions = useMemo(() => makeMesaActions(), []);
  const mesaEventHandlers = useMemo(() => makeMesaEventHandlers(setSort), [ setSort ]);
  const mesaUiState = useMemo(() => makeMesaUiState(sort), [ sort ]);

  const mesaState = MesaState.create({
    columns: mesaColumns,
    rows: mesaRows,
    filteredRows: mesaFilteredRows,
    options: mesaOptions,
    actions: mesaActions,
    eventHandlers: mesaEventHandlers,
    uiState: mesaUiState
  });

  return (
    <Mesa state={mesaState}>
      <div className={cx('--SearchGroup')}>
      <h3 className={cx('--SearchTitle')}>{`${tableTitle} (${strategyChoices.length})`}</h3>
      <RealTimeSearchBox
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        placeholderText="Filter strategies"
      />
      </div>
    </Mesa>
  );
};

function makeMesaColumns(onStrategySelected: (strategyId: number) => void): MesaColumn<'name' | 'description'>[] {
  return [
    {
      key: 'name',
      name: 'Strategy',
      width: '20em',
      renderCell: (cellProps: StrategyInputCellProps<string>) =>
        <a onClick={(e) => {
          e.preventDefault();
          onStrategySelected(cellProps.row.strategyId);
        }} href="#">
            {cellProps.row.name}{cellProps.row.isSaved ? '' : ' *'}
        </a>,
      sortable: true
    },
    {
      key: 'description',
      name: 'Description',
      renderCell: (cellProps: StrategyInputCellProps<string | undefined>) =>
        <OverflowingTextCell {...cellProps} key={cellProps.row.strategyId} />,
      sortable: true
    }
  ];
}

function makeMesaRows(
  strategies: StrategySummary[], 
  sort: MesaSortObject
) {
  return orderBy(strategies, [ sort.columnKey ], [ sort.columnKey ]);
}

function makeMesaFilteredRows(
  rows: StrategySummary[],
  columns: MesaColumn<'name' | 'description'>[],
  searchTerm: string
) {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  return !normalizedSearchTerm
    ? rows
    : rows.filter(
        row => columns.some(({ key: columnKey }) => 
          (row[columnKey] || '').toLowerCase().includes(normalizedSearchTerm))
      );
}

function makeMesaOptions() {
  return {
    toolbar: true,
    useStickyHeader: true,
    tableBodyMaxHeight: '40vh',
  };
}

function makeMesaActions() {
  return [

  ];
}

function makeMesaEventHandlers(onSortChange: (sort: MesaSortObject) => void) {
  return {
    onSort: ({ key }: { key: string }, direction: MesaSortObject['direction']) => {
      onSortChange({ columnKey: key, direction });
    }
  };
};

function makeMesaUiState(sort: MesaSortObject) {
  return { 
    sort 
  };
}
