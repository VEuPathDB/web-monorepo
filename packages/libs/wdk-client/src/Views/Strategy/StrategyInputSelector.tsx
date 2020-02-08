import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';

import { orderBy } from 'lodash';

import { Loading, RealTimeSearchBox } from 'wdk-client/Components';
import Mesa, { MesaState } from 'wdk-client/Components/Mesa'
import { MesaSortObject, MesaColumn } from 'wdk-client/Core/CommonTypes';
import { RootState } from 'wdk-client/Core/State/Types';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import WdkService from 'wdk-client/Service/WdkService';
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
  onStrategySelected: (strategyId: number, strategyName: string) => void,
  primaryInput: StrategyDetails,
  secondaryInputRecordClass: RecordClass
};

type Props = StateProps & OwnProps;

type OptionalMesaSortObject = MesaSortObject | null;

type StrategyInputCellProps<T> = {
  value: T,
  row: StrategySummary
};

const StrategyInputSelectorView = ({
  openedStrategies,
  onStrategySelected,
  primaryInput,
  secondaryInputRecordClass
}: Props) => {
  const strategies = useWdkService(getStrategies);

  // FIXME: Find a nicer way of dealing with the "equivalence" of genes and transcripts.
  const homogeneousSecondaryInputRecordClasses = useMemo(() => {
    return ['gene', 'transcript'].includes(secondaryInputRecordClass.urlSegment)
      ? [ 'gene', 'transcript' ]
      : [ secondaryInputRecordClass.urlSegment ];
  }, [ secondaryInputRecordClass ]);

  const strategyChoices = useMemo(
    () => (
      strategies &&
      openedStrategies &&
      [...strategies]
        .filter(
          // We only provide opened and saved strategies as choices
          ({ isSaved, recordClassName, strategyId }) => (
            recordClassName != null &&
            homogeneousSecondaryInputRecordClasses.includes(recordClassName) &&
            (openedStrategies.has(strategyId) || isSaved) &&
            strategyId !== primaryInput.strategyId
          )
        )
        .sort(
          // Opened strategies are sorted to the top
          ({ strategyId: strategyIdA }, { strategyId: strategyIdB }) =>
            openedStrategies.has(strategyIdA) === openedStrategies.has(strategyIdB)
              ? 0
              : openedStrategies.has(strategyIdA)
              ? -1
              : 1
        )
    ),
    [ homogeneousSecondaryInputRecordClasses, strategies, openedStrategies ]
  );

  return strategyChoices == null || openedStrategies == null
    ? <Loading />
    : <div className={cx()}>
        {
          strategyChoices.length === 0
            ? <div className={cx('--NoAvailableStrategies')}>
                You have no other open or saved {secondaryInputRecordClass.displayName} strategies
              </div>
            : <div className={cx('--StrategyChoices')}>
                <StrategyInputSelectorTable
                  tableTitle="Opened & Saved Strategies"
                  strategyChoices={strategyChoices}
                  onStrategySelected={onStrategySelected}
                  openedStrategies={openedStrategies}
                  showFilter={strategyChoices.length > 10}
                />
              </div>
        }
      </div>;
};

function getStrategies(wdkService: WdkService) {
  return wdkService.getStrategies();
}

const mapStateToProps = ({ strategyWorkspace }: RootState): StateProps => ({
  openedStrategies: strategyWorkspace.openedStrategies && new Set(strategyWorkspace.openedStrategies)
});

export const StrategyInputSelector = connect(mapStateToProps)(StrategyInputSelectorView);

type StrategyInputSelectorTableProps = {
  tableTitle: string,
  strategyChoices: StrategySummary[],
  onStrategySelected: (strategyId: number, strategyName: string) => void,
  openedStrategies: Set<number>,
  showFilter: boolean
}

const StrategyInputSelectorTable = ({
  tableTitle,
  strategyChoices,
  onStrategySelected,
  openedStrategies,
  showFilter
}: StrategyInputSelectorTableProps) => {
  const [ sort, setSort ] = useState<OptionalMesaSortObject>(null);
  const [ searchTerm, setSearchTerm ] = useState('');

  const mesaColumns = useMemo(() => makeMesaColumns(onStrategySelected), [ onStrategySelected ]);
  const mesaRows = useMemo(() => makeMesaRows(strategyChoices, sort), [ strategyChoices, sort ]);
  const mesaFilteredRows = useMemo(
    () => makeMesaFilteredRows(mesaRows, mesaColumns, searchTerm),
    [ mesaRows, mesaColumns, searchTerm ]
  );

  const mesaOptions = useMemo(() => makeMesaOptions(openedStrategies), [ openedStrategies ]);
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
        className={cx('--SearchBox', !showFilter && 'hide')}
      />
      </div>
    </Mesa>
  );
};

function makeMesaColumns(onStrategySelected: (strategyId: number, strategyName: string) => void): MesaColumn<'name' | 'description'>[] {
  return [
    {
      key: 'name',
      name: 'Strategy',
      width: '25em',
      renderCell: (cellProps: StrategyInputCellProps<string>) =>
        <a onClick={(e) => {
          e.preventDefault();
          onStrategySelected(cellProps.row.strategyId, cellProps.row.name);
        }} href="#">
            {cellProps.row.name}{cellProps.row.isSaved ? '' : ' *'}
        </a>,
      sortable: true
    },
    {
      key: 'description',
      name: 'Description',
      width: '25em',
      renderCell: (cellProps: StrategyInputCellProps<string | undefined>) =>
        <OverflowingTextCell {...cellProps} key={cellProps.row.strategyId} />,
      sortable: true
    }
  ];
}

function makeMesaRows(
  strategyChoices: StrategySummary[],
  sort: OptionalMesaSortObject
) {
  return sort === null
    ? strategyChoices
    : orderBy(strategyChoices, [ sort.columnKey ], [ sort.direction ]);
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

function makeMesaOptions(openedStrategies: Set<number>) {
  return {
    toolbar: true,
    useStickyHeader: true,
    tableBodyMaxHeight: '40vh',
    deriveRowClassName: (strategy: StrategySummary) =>
      openedStrategies.has(strategy.strategyId) ? cx('--OpenedRow') : undefined
  };
}

function makeMesaActions() {
  return [

  ];
}

function makeMesaEventHandlers(onSortChange: (sort: OptionalMesaSortObject) => void) {
  return {
    onSort: ({ key }: { key: string }, direction: MesaSortObject['direction']) => {
      onSortChange({ columnKey: key, direction });
    }
  };
};

function makeMesaUiState(sort: OptionalMesaSortObject) {
  return { 
    sort 
  };
}
