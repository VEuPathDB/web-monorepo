import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';

import { orderBy } from 'lodash';

import { Loading, RealTimeSearchBox } from '../../Components';
import Mesa, { MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import { MesaSortObject, MesaColumn } from '../../Core/CommonTypes';
import { RootState } from '../../Core/State/Types';
import { useWdkService } from '../../Hooks/WdkServiceHook';
import WdkService from '../../Service/WdkService';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { RecordClass } from '../../Utils/WdkModel';
import { StrategySummary, StrategyDetails } from '../../Utils/WdkUser';
import { OverflowingTextCell } from '../../Views/Strategy/OverflowingTextCell';

import '../../Views/Strategy/StrategyInputSelector.scss';

const cx = makeClassNameHelper('StrategyInputSelector');

type StateProps = {
  openedStrategies?: Set<number>;
};

type OwnProps = {
  onStrategySelected: (
    strategyId: number,
    strategyName: string,
    recordClassUrlSegment: string
  ) => void;
  primaryInput: StrategyDetails;
  secondaryInputRecordClasses: RecordClass[];
  recordClassesByUrlSegment: Record<string, RecordClass>;
};

type Props = StateProps & OwnProps;

type StrategyInputColumnKey = 'dataType' | 'name' | 'description';
type StrategyInputColumn = MesaColumn<StrategyInputColumnKey>;

type OptionalMesaSortObject = MesaSortObject | null;

type StrategySummaryWithRecordClass = StrategySummary & {
  recordClassName: string;
} & { dataType: string };

type StrategySummaryWithDataType = StrategySummaryWithRecordClass & {
  dataType: string;
};

type StrategyInputCellProps<T> = {
  value: T;
  row: StrategySummaryWithDataType;
};

const StrategyInputSelectorView = ({
  openedStrategies,
  onStrategySelected,
  primaryInput,
  recordClassesByUrlSegment,
  secondaryInputRecordClasses,
}: Props) => {
  const strategies = useWdkService(getStrategies, []);

  // FIXME: Find a nicer way of dealing with the "equivalence" of genes and transcripts.
  const homogeneousSecondaryInputRecordClasses = useMemo(
    () =>
      secondaryInputRecordClasses.flatMap((secondaryInputRecordClass) =>
        ['gene', 'transcript'].includes(secondaryInputRecordClass.urlSegment)
          ? ['gene', 'transcript']
          : [secondaryInputRecordClass.urlSegment]
      ),
    [secondaryInputRecordClasses]
  );

  const strategyChoices = useMemo(
    () =>
      strategies &&
      openedStrategies &&
      [...strategies]
        .filter(
          // We only provide opened and saved strategies as choices
          (strategy): strategy is StrategySummaryWithRecordClass =>
            strategy.recordClassName != null &&
            homogeneousSecondaryInputRecordClasses.includes(
              strategy.recordClassName
            ) &&
            (openedStrategies.has(strategy.strategyId) || strategy.isSaved) &&
            strategy.strategyId !== primaryInput.strategyId
        )
        .map((entryWithNoRecordClassDisplayName) => ({
          ...entryWithNoRecordClassDisplayName,
          dataType: entryWithNoRecordClassDisplayName.recordClassName
            ? recordClassesByUrlSegment[
                entryWithNoRecordClassDisplayName.recordClassName
              ].displayNamePlural
            : '',
        }))
        .sort(
          // Opened strategies are sorted to the top
          ({ strategyId: strategyIdA }, { strategyId: strategyIdB }) =>
            openedStrategies.has(strategyIdA) ===
            openedStrategies.has(strategyIdB)
              ? 0
              : openedStrategies.has(strategyIdA)
              ? -1
              : 1
        ),
    [homogeneousSecondaryInputRecordClasses, strategies, openedStrategies]
  );

  const noAvailableStrategiesMessage =
    'You have no compatible open or saved strategies';

  return strategyChoices == null || openedStrategies == null ? (
    <Loading />
  ) : (
    <div className={cx()}>
      {strategyChoices.length === 0 ? (
        <div className={cx('--NoAvailableStrategies')}>
          {noAvailableStrategiesMessage}
        </div>
      ) : (
        <div className={cx('--StrategyChoices')}>
          <StrategyInputSelectorTable
            tableTitle="Opened & Saved Strategies"
            strategyChoices={strategyChoices}
            onStrategySelected={onStrategySelected}
            openedStrategies={openedStrategies}
            showFilter={strategyChoices.length > 10}
            showDataTypeColumn={secondaryInputRecordClasses.length > 1}
          />
        </div>
      )}
    </div>
  );
};

function getStrategies(wdkService: WdkService) {
  return wdkService.getStrategies();
}

const mapStateToProps = ({ strategyWorkspace }: RootState): StateProps => ({
  openedStrategies:
    strategyWorkspace.openedStrategies &&
    new Set(strategyWorkspace.openedStrategies),
});

export const StrategyInputSelector = connect(mapStateToProps)(
  StrategyInputSelectorView
);

type StrategyInputSelectorTableProps = {
  tableTitle: string;
  strategyChoices: StrategySummaryWithDataType[];
  onStrategySelected: OwnProps['onStrategySelected'];
  openedStrategies: Set<number>;
  showFilter: boolean;
  showDataTypeColumn: boolean;
};

const StrategyInputSelectorTable = ({
  tableTitle,
  strategyChoices,
  onStrategySelected,
  openedStrategies,
  showFilter,
  showDataTypeColumn,
}: StrategyInputSelectorTableProps) => {
  const [sort, setSort] = useState<OptionalMesaSortObject>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const mesaColumns = useMemo(
    () => makeMesaColumns(onStrategySelected, showDataTypeColumn),
    [onStrategySelected, showDataTypeColumn]
  );
  const mesaRows = useMemo(
    () => makeMesaRows(strategyChoices, sort),
    [strategyChoices, sort]
  );
  const mesaFilteredRows = useMemo(
    () => makeMesaFilteredRows(mesaRows, mesaColumns, searchTerm),
    [mesaRows, mesaColumns, searchTerm]
  );

  const mesaOptions = useMemo(
    () => makeMesaOptions(openedStrategies),
    [openedStrategies]
  );
  const mesaActions = useMemo(() => makeMesaActions(), []);
  const mesaEventHandlers = useMemo(
    () => makeMesaEventHandlers(setSort),
    [setSort]
  );
  const mesaUiState = useMemo(() => makeMesaUiState(sort), [sort]);

  const mesaState = MesaState.create({
    columns: mesaColumns,
    rows: mesaRows,
    filteredRows: mesaFilteredRows,
    options: mesaOptions,
    actions: mesaActions,
    eventHandlers: mesaEventHandlers,
    uiState: mesaUiState,
  });

  return (
    <Mesa state={mesaState}>
      <div className={cx('--SearchGroup')}>
        <h3
          className={cx('--SearchTitle')}
        >{`${tableTitle} (${strategyChoices.length})`}</h3>
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

function makeMesaColumns(
  onStrategySelected: OwnProps['onStrategySelected'],
  showDataTypeColumn: boolean
): StrategyInputColumn[] {
  const dataTypeColumn = {
    key: 'dataType' as StrategyInputColumnKey,
    name: 'Data Type',
    width: '8em',
    sortable: true,
  };

  const nameColumn = {
    key: 'name' as StrategyInputColumnKey,
    name: 'Strategy',
    width: '18em',
    renderCell: (cellProps: StrategyInputCellProps<string>) => (
      <a
        onClick={(e) => {
          e.preventDefault();
          onStrategySelected(
            cellProps.row.strategyId,
            cellProps.row.name,
            cellProps.row.recordClassName
          );
        }}
        href="#"
      >
        {cellProps.row.name}
        {cellProps.row.isSaved ? '' : ' *'}
      </a>
    ),
    sortable: true,
  };

  const descriptionColumn = {
    key: 'description' as StrategyInputColumnKey,
    name: 'Description',
    width: '22em',
    renderCell: (cellProps: StrategyInputCellProps<string | undefined>) => (
      <OverflowingTextCell {...cellProps} key={cellProps.row.strategyId} />
    ),
    sortable: true,
  };

  return showDataTypeColumn
    ? [dataTypeColumn, nameColumn, descriptionColumn]
    : [nameColumn, descriptionColumn];
}

function makeMesaRows(
  strategyChoices: StrategySummaryWithDataType[],
  sort: OptionalMesaSortObject
) {
  return sort === null
    ? strategyChoices
    : orderBy(strategyChoices, [sort.columnKey], [sort.direction]);
}

function makeMesaFilteredRows(
  rows: StrategySummaryWithDataType[],
  columns: StrategyInputColumn[],
  searchTerm: string
) {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  return !normalizedSearchTerm
    ? rows
    : rows.filter((row) =>
        columns.some(({ key: columnKey }) =>
          (row[columnKey] || '').toLowerCase().includes(normalizedSearchTerm)
        )
      );
}

function makeMesaOptions(openedStrategies: Set<number>) {
  return {
    toolbar: true,
    useStickyHeader: true,
    tableBodyMaxHeight: '40vh',
    deriveRowClassName: (strategy: StrategySummary) =>
      openedStrategies.has(strategy.strategyId) ? cx('--OpenedRow') : undefined,
  };
}

function makeMesaActions() {
  return [];
}

function makeMesaEventHandlers(
  onSortChange: (sort: OptionalMesaSortObject) => void
) {
  return {
    onSort: (
      { key }: { key: string },
      direction: MesaSortObject['direction']
    ) => {
      onSortChange({ columnKey: key, direction });
    },
  };
}

function makeMesaUiState(sort: OptionalMesaSortObject) {
  return {
    sort,
  };
}
