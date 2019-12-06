import React, { useCallback, useMemo, } from 'react';

import { orderBy } from 'lodash';

import { RealTimeSearchBox, Link, Icon } from 'wdk-client/Components';
import { MesaState, Mesa } from 'wdk-client/Components/Mesa';
import { MesaSortObject, MesaColumn } from 'wdk-client/Core/CommonTypes';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { StrategySummary } from 'wdk-client/Utils/WdkUser';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { OverflowingTextCell } from 'wdk-client/Views/Strategy/OverflowingTextCell';
import { formatDateTimeString } from 'wdk-client/Views/Strategy/StrategyUtils';

import 'wdk-client/Views/Strategy/PublicStrategies.scss';

const cx = makeClassNameHelper('PublicStrategies');

// FIXME This should be pulled from the model.xml's "exampleStratsAuthor" property
const EXAMPLE_AUTHOR = 'VEuPathDB Example';

interface Props {
  searchTerm: string;
  sort?: MesaSortObject;
  prioritizeExamples: boolean;
  publicStrategySummaries: StrategySummary[];
  recordClassesByUrlSegment: Record<string, RecordClass>;
  onSearchTermChange: (newSearchTerm: string) => void;
  onSortChange: (newSort: MesaSortObject) => void;
  onPriorityChange: (newPriority: boolean) => void;
}

export const PublicStrategies = ({
  searchTerm,
  sort = { columnKey: 'lastModified', direction: 'desc' } as MesaSortObject,
  prioritizeExamples,
  publicStrategySummaries,
  recordClassesByUrlSegment,
  onSearchTermChange,
  onSortChange,
  onPriorityChange
}: Props) => {
  const onPriorityCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onPriorityChange(e.target.checked);
  }, [ onPriorityChange ]);

  const recordClassToDisplayString = useCallback(
    (urlSegment: string | null) => urlSegment ? recordClassesByUrlSegment[urlSegment].displayNamePlural : '', 
    [ recordClassesByUrlSegment ]
  );

  const mesaColumns = useMemo(() => makeMesaColumns(recordClassToDisplayString), [ recordClassToDisplayString ]);

  const mesaRows = useMemo(() => makeMesaRows(
    publicStrategySummaries, sort, recordClassToDisplayString, prioritizeExamples), 
    [ publicStrategySummaries, sort, recordClassToDisplayString, prioritizeExamples ]
  );
  const mesaFilteredRows = useMemo(() => makeMesaFilteredRows(
    mesaRows, mesaColumns, searchTerm, recordClassToDisplayString), 
    [ mesaRows, mesaColumns, searchTerm, recordClassToDisplayString ]
  );

  const mesaOptions = useMemo(() => makeMesaOptions(), []);
  const mesaActions = useMemo(() => makeMesaActions(), []);
  const mesaEventHandlers = useMemo(() => makeMesaEventHandlers(onSortChange), [ onSortChange ]);
  const mesaUiState = useMemo(() => makeMesaUiState(sort), [ sort ]);

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
    <div className={cx()}>
      <div className={cx('--Info')}>
        <Icon type="info" />{' '}
        <div>
          To make one of your strategies public, go to <strong>All Strategies</strong> and click its Public checkbox.&nbsp;
          Public strategies are visible to the community.
        </div>
      </div>
      <Mesa state={mesaState}>
        <div className={cx('--SearchGroup')}>
          <h3 className={cx('--SearchTitle')}>{`Public Stategies & Examples (${publicStrategySummaries.length})`}</h3>
          <RealTimeSearchBox
            searchTerm={searchTerm}
            onSearchTermChange={onSearchTermChange}
            placeholderText="Filter strategies"
          />
        </div>
        <div className={cx('--PriorityCheckbox')}>
          <input 
            id="public_strategies_priority_checkbox" 
            checked={prioritizeExamples}
            onChange={onPriorityCheckboxChange} type="checkbox" 
          />
          {' '}
          <label htmlFor="public_strategies_priority_checkbox">
            Sort VEuPathDB Example Strategies To Top
          </label>
        </div>
      </Mesa>
    </div>
  );
};

interface RenderCellProps<T> {
  row: StrategySummary;
  value: T;
}

function makeMesaColumns(recordClassToDisplayString: (urlSegment: string | null) => string): MesaColumn<keyof StrategySummary>[] {
  return [
    {
      key: 'name',
      name: 'Strategies',
      className: cx('--NameCell'),
      sortable: true,
      renderCell: (props: RenderCellProps<string>) => 
        <Link to={`/workspace/strategies/import/${props.row.signature}`}>
          {props.value}
        </Link>,
      width: '15em'
    },
    {
      key: 'recordClassName',
      name: 'Returns',
      className: cx('--RecordClassCell'),
      sortable: true,
      renderCell: (props: RenderCellProps<string | null>) => 
        recordClassToDisplayString(props.value)
    },
    {
      key: 'description',
      name: 'Description',
      className: cx('--DescriptionCell'),
      sortable: true,
      renderCell: (props: RenderCellProps<string | undefined>) => 
        <OverflowingTextCell {...props} key={props.row.strategyId} />,
      width: '25em'
    },
    {
      key: 'author',
      name: 'Author',
      className: cx('--AuthorCell'),
      sortable: true
    },
    {
      key: 'organization',
      name: 'Organization',
      className: cx('--OrganizatiohCell'),
      sortable: true
    },
    {
      key: 'lastModified',
      name: 'Modified',
      className: cx('--LastModifiedCell'),
      sortable: true,
      renderCell: (props: RenderCellProps<string>) => 
        formatDateTimeString(props.value)
    }
  ];
}

function makeMesaRows(
  publicStrategies: Props['publicStrategySummaries'], 
  sort: MesaSortObject, 
  recordClassToDisplayString: (urlSegment: string | null) => string,
  prioritizeExamples: boolean
) {
  const sortColumnValue = sort.columnKey === 'recordClassName'
    ? (row: StrategySummary) => recordClassToDisplayString(row.recordClassName)
    : sort.columnKey;

  const sortPriorityValue = (row: StrategySummary) => row.author === EXAMPLE_AUTHOR ? 0 : 1;

  return prioritizeExamples
    ? orderBy(publicStrategies, [ sortPriorityValue, sortColumnValue, ], [ 'asc', sort.direction ])
    : orderBy(publicStrategies, [ sortColumnValue ], [ sort.direction ])
}

function makeMesaFilteredRows(
  rows: Props['publicStrategySummaries'], 
  columns: MesaColumn<keyof StrategySummary>[],
  searchTerm: string, 
  recordClassToDisplayString: (urlSegment: string | null) => string
) {  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  return !normalizedSearchTerm
    ? rows
    : rows.filter(
        row => columns.some(({ key: columnKey }) =>
          columnKey === 'recordClassName'
            ? recordClassToDisplayString(row.recordClassName).toLowerCase().includes(normalizedSearchTerm)
            : columnKey === 'lastModified'
            ? formatDateTimeString(row.lastModified).includes(normalizedSearchTerm)
            : (row[columnKey] || '').toString().toLowerCase().includes(normalizedSearchTerm))
      );
}

function makeMesaOptions() {
  return {
    toolbar: true,
    useStickyHeader: true,
    tableBodyMaxHeight: 'calc(80vh - 200px)',
    deriveRowClassName: (strategy: StrategySummary) => strategy.author === EXAMPLE_AUTHOR ? cx('--ExampleRow') : undefined
  };
}

function makeMesaActions() {
  return [

  ];
}

function makeMesaEventHandlers(onSortChange: Props['onSortChange']) {
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
