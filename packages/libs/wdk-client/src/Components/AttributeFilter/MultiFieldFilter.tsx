import { bindAll, curry, escapeRegExp, get, keyBy } from 'lodash';
import naturalSort from 'natural-sort';
import React from 'react';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Seq } from '../../Utils/IterableUtils';
import { MesaController as Mesa } from '@veupathdb/coreui/lib/components/Mesa';
import RealTimeSearchBox from '../../Components/SearchBox/RealTimeSearchBox';
import StackedBar from '../../Components/AttributeFilter/StackedBar';
import {
  toPercentage,
  getOperationDisplay,
  isRange,
  shouldAddFilter,
  findAncestorFields,
} from '../../Components/AttributeFilter/AttributeFilterUtils';
import { preorderSeq } from '../../Utils/TreeUtils';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import {
  Field,
  Filter,
  FieldTreeNode,
  OntologyTermSummary,
  ValueCounts,
  MultiFilterValue,
} from '../../Components/AttributeFilter/Types';

const cx = makeClassNameHelper('wdk-MultiFieldFilter');

/**
 * Props for the MultiFieldFilter component
 */
interface MultiFieldFilterProps {
  activeField: Field;
  activeFieldState: {
    searchTerm?: string;
    leafSummaries: OntologyTermSummary[];
    sort?: {
      columnKey: string;
      direction: 'asc' | 'desc';
    };
    [key: string]: any;
  };
  filters: Filter[];
  fieldTree: FieldTreeNode;
  displayName: string;
  dataCount: number;
  fillBarColor?: string;
  fillFilteredBarColor?: string;
  selectByDefault: boolean;
  onFiltersChange: (filters: Filter[]) => void;
  onMemberSort: (
    field: Field,
    sort: { columnKey: string; direction: string }
  ) => void;
  onMemberSearch: (field: Field, searchTerm: string) => void;
}

/**
 * State for the MultiFieldFilter component
 */
interface MultiFieldFilterState {
  operation: 'union' | 'intersect';
}

/**
 * Type for row data used in Mesa table
 */
interface TableRow {
  summary: OntologyTermSummary;
  value?: string | number | null;
  filter?: Filter;
  isSelected?: boolean;
  isLast?: boolean;
}

const getCountType = curry(
  (countType: string, summary: OntologyTermSummary, value: any) =>
    get(
      summary.valueCounts.find((count) => count.value === value),
      countType,
      NaN
    )
);
const getCount = getCountType('count');
const getFilteredCount = getCountType('filteredCount');

/**
 * Component for filtering multiple fields with intersection/union operations
 */
export default class MultiFieldFilter extends React.Component<
  MultiFieldFilterProps,
  MultiFieldFilterState
> {
  constructor(props: MultiFieldFilterProps) {
    super(props);
    bindAll(this, [
      'deriveRowClassName',
      'handleTableSort',
      'renderDisplayHeadingName',
      'renderDisplayHeadingSearch',
      'renderDisplayCell',
      'renderCountCell',
      'renderDistributionCell',
      'renderPercentCell',
    ]);
    this.state = { operation: 'intersect' };
  }

  getFieldByTerm(term: string): Field | undefined {
    return preorderSeq(this.props.fieldTree)
      .map((node: any) => node.field)
      .find((field: Field) => field.term === term);
  }
  // Event handlers

  // Invoke callback with filters array
  handleLeafFilterChange(
    field: Field,
    value: any,
    includeUnknown: boolean,
    valueCounts: ValueCounts
  ): void {
    const multiFilter = this.getOrCreateFilter(this.props, this.state);
    const leafFilter: Filter = {
      field: field.term,
      type: field.type || '',
      isRange: isRange(field),
      value,
      includeUnknown,
    } as Filter;
    const otherLeafFilters = (
      multiFilter.value as MultiFilterValue
    ).filters.filter((filter) => filter.field !== field.term);
    const shouldAdd = shouldAddFilter(
      leafFilter,
      valueCounts,
      this.props.selectByDefault
    );
    const filter: Filter = {
      ...multiFilter,
      value: {
        ...(multiFilter.value as MultiFilterValue),
        filters: otherLeafFilters.concat(shouldAdd ? [leafFilter as any] : []),
      },
    } as Filter;
    const otherFilters = this.props.filters.filter(
      (f) => f.field !== this.props.activeField.term
    );
    const nextFilters = otherFilters.concat(
      (filter.value as MultiFilterValue).filters.length > 0 ? [filter] : []
    );

    this.props.onFiltersChange(nextFilters);
  }

  handleTableSort(column: any, direction: string): void {
    this.props.onMemberSort(this.props.activeField, {
      columnKey: column.key,
      direction,
    });
  }

  setOperation(operation: 'union' | 'intersect'): void {
    this.setState({ operation });
    const filter = this.getOrCreateFilter(this.props, this.state);
    if ((filter.value as MultiFilterValue).filters.length > 0) {
      const otherFilters = this.props.filters.filter(
        (f) => f.field !== this.props.activeField.term
      );
      const nextFilters = otherFilters.concat([
        {
          ...filter,
          value: { ...(filter.value as MultiFilterValue), operation },
        } as Filter,
      ]);
      this.props.onFiltersChange(nextFilters);
    }
  }

  getOrCreateFilter(
    props: MultiFieldFilterProps,
    state: MultiFieldFilterState
  ): Filter {
    const { term: field, type, isRange: isFieldRange } = props.activeField;
    const filter = props.filters.find(
      (f) => f.field === props.activeField.term
    );
    return filter != null
      ? filter
      : ({
          field,
          type,
          isRange: isFieldRange,
          value: {
            operation: state.operation,
            filters: [],
          },
          includeUnknown: false, // not sure we need this for multi filter
        } as Filter);
  }

  deriveRowClassName(row: TableRow): string {
    return cx(
      'Row',
      row.value == null ? 'summary' : 'value',
      row.isSelected && 'selected',
      row.isLast && 'last-value',
      (row.value == null
        ? row.summary.internalsFilteredCount
        : get(
            row.summary.valueCounts.find((count) => count.value === row.value),
            'filteredCount',
            0
          )) > 0
        ? 'enabled'
        : 'disabled'
    );
  }

  renderDisplayHeadingName(): string {
    return this.props.activeField.display;
  }

  renderDisplayHeadingSearch(): React.ReactNode {
    return (
      <div
        style={{
          width: '15em',
          fontSize: '.8em',
          fontWeight: 'normal',
        }}
        onMouseUp={(event) => {
          event.stopPropagation();
        }}
      >
        <RealTimeSearchBox
          searchTerm={this.props.activeFieldState.searchTerm}
          placeholderText="Find items"
          onSearchTermChange={(searchTerm: string) =>
            this.props.onMemberSearch(this.props.activeField, searchTerm)
          }
        />
      </div>
    );
  }

  renderDisplayCell({ row }: { row: TableRow }): React.ReactNode {
    const displayField =
      row.value == null ? this.getFieldByTerm(row.summary.term) : null;
    return (
      <div className={cx('ValueContainer')}>
        <div>{row.value == null && displayField && displayField.display}</div>
        <div>{this.renderRowValue(row)}</div>
      </div>
    );
  }

  renderCountCell({
    key,
    row,
  }: {
    key: string;
    row: TableRow;
  }): React.ReactNode {
    const internalsCount =
      key === 'count'
        ? row.summary.internalsCount
        : row.summary.internalsFilteredCount;
    const count =
      row.value == null
        ? internalsCount
        : key === 'count'
        ? getCount(row.summary, row.value)
        : getFilteredCount(row.summary, row.value);
    return (
      <React.Fragment>
        <div>{count.toLocaleString()}</div>
        <div>
          <small>
            ({toPercentage(count, internalsCount || this.props.dataCount)}%)
          </small>
        </div>
      </React.Fragment>
    );
  }

  renderDistributionCell({ row }: { row: TableRow }): React.ReactNode {
    const unknownCount = this.props.dataCount - row.summary.internalsCount;
    const notAll = row.value == null;
    let percent = 0;

    if (notAll) {
      // NOT all (displayName) have data for this row/variable
      percent = Math.round(
        (row.summary.internalsCount * 100) / this.props.dataCount
      );
    }

    return !notAll ? ( // all (displayName) have data for this variable
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <StackedBar
          count={getCount(row.summary, row.value)}
          filteredCount={getFilteredCount(row.summary, row.value)}
          populationSize={row.summary.internalsCount || this.props.dataCount}
          fillBarColor={this.props.fillBarColor}
          fillFilteredBarColor={this.props.fillFilteredBarColor}
        />
      </div>
    ) : (
      unknownCount > 0 && (
        <div style={{ fontWeight: 300 }}>
          <b>
            {toPercentage(
              row.summary.internalsCount,
              this.props.dataCount
            ).toLocaleString()}
            % of {this.props.dataCount.toLocaleString()}
          </b>{' '}
          {this.props.displayName} have data
        </div>
      )
    );
  }

  renderPercentCell({ row }: { row: TableRow }): React.ReactNode {
    return (
      row.value != null && (
        <small>
          (
          {toPercentage(
            getFilteredCount(row.summary, row.value),
            getCount(row.summary, row.value)
          )}
          %)
        </small>
      )
    );
  }

  renderRowValue(row: TableRow): React.ReactNode {
    const { value, filter, summary, isSelected } = row;
    if (value == null) return null;
    const filterValue = get(filter, 'value', []) as any[];
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
      this.handleLeafFilterChange(
        this.getFieldByTerm(summary.term)!,
        event.target.checked
          ? [value].concat(filterValue)
          : filterValue.filter((item: any) => item !== value),
        false,
        summary.valueCounts
      );
    return (
      <label>
        <input type="checkbox" checked={isSelected} onChange={handleChange} />{' '}
        {value}
      </label>
    );
  }

  render(): React.ReactNode {
    const { searchTerm = '' } = this.props.activeFieldState;
    const searchRe = new RegExp(escapeRegExp(searchTerm), 'i');
    const filter = this.getOrCreateFilter(this.props, this.state);
    const leafFilters = get(
      this.props.filters.find((f) => f.field === this.props.activeField.term),
      'value.filters',
      []
    );
    const filtersByField = keyBy(leafFilters, 'field');

    const hasRowWithRemaining = this.props.activeFieldState.leafSummaries.some(
      (summary) => summary.internalsFilteredCount > 0
    );

    const hasNoData = this.props.activeFieldState.leafSummaries.every(
      (summary) => summary.internalsCount === 0
    );

    const rows: TableRow[] = Seq.from(this.props.activeFieldState.leafSummaries)
      .flatMap((summary) => [
        {
          summary,
          filter: filtersByField[summary.term],
        } as TableRow,
        ...summary.valueCounts.map(
          (data, index) =>
            ({
              summary,
              value: data.value,
              filter: filtersByField[summary.term],
              isSelected: (
                get(filtersByField, [summary.term, 'value'], []) as any[]
              ).includes(data.value as any),
              isLast: index === summary.valueCounts.length - 1,
            } as TableRow)
        ),
      ])
      .toArray();

    const filteredRows = rows.filter(({ summary }) =>
      findAncestorFields(this.props.fieldTree, summary.term)
        .dropWhile((field: any) => field.term !== this.props.activeField.term)
        .drop(1)
        .some((field: any) => searchRe.test(field.display))
    );

    return (
      <div className={cx()}>
        {(!hasRowWithRemaining || hasNoData) && (
          <Banner
            banner={{
              type: 'warning',
              message: hasNoData
                ? 'There is no data available for this variable.'
                : 'Given prior selections, there is no remaining data available for this variable.',
              pinned: true,
            }}
          />
        )}
        <div style={{ margin: '.5em 0' }}>
          Find {this.props.displayName} with{' '}
          <select
            value={
              (
                this.getOrCreateFilter(this.props, this.state)
                  .value as MultiFilterValue
              ).operation
            }
            onChange={(e) =>
              this.setOperation(e.target.value as 'union' | 'intersect')
            }
          >
            <option value="union">{getOperationDisplay('union')}</option>
            <option value="intersect">
              {getOperationDisplay('intersect')}
            </option>
          </select>{' '}
          of the options selected below.
        </div>
        <Mesa
          options={{
            useStickyHeader: true,
            tableBodyMaxHeight: '80vh',
            deriveRowClassName: this.deriveRowClassName,
          }}
          uiState={{
            sort: this.props.activeFieldState.sort,
          }}
          eventHandlers={{
            onSort: this.handleTableSort,
          }}
          rows={rows}
          filteredRows={filteredRows}
          columns={
            [
              {
                key: 'display',
                sortable: true,
                // width: '40%',
                wrapCustomHeadings: ({ headingRowIndex }: any) =>
                  headingRowIndex === 0,
                renderHeading: [
                  this.renderDisplayHeadingName,
                  this.renderDisplayHeadingSearch,
                ],
                renderCell: this.renderDisplayCell,
              },
              {
                key: 'filteredCount',
                className: cx('CountCell'),
                sortable: true,
                width: '13em',
                helpText: (
                  <div>
                    The number of <em>{this.props.displayName}</em> that match
                    the filters applied for other variables
                    <br />
                    and that have the given value
                  </div>
                ),
                wrapCustomHeadings: ({ headingRowIndex }: any) =>
                  headingRowIndex === 0,
                name: (
                  <div style={{ textAlign: 'center' }}>
                    Subset of <i>{this.props.displayName}</i>
                  </div>
                ),
                renderCell: this.renderCountCell,
              },
              {
                key: 'count',
                className: cx('CountCell'),
                sortable: true,
                width: '13em',
                helpText: (
                  <div>
                    The number of <em>{this.props.displayName}</em> in the
                    dataset that have the given value
                  </div>
                ),
                wrapCustomHeadings: ({ headingRowIndex }: any) =>
                  headingRowIndex === 0,
                name: (
                  <div style={{ textAlign: 'center' }}>
                    All <i>{this.props.displayName}</i>
                  </div>
                ),
                renderCell: this.renderCountCell,
              },
              {
                key: 'distribution',
                name: 'Distribution',
                width: '30%',
                helpText: (
                  <div>
                    The subset of <em>{this.props.displayName}</em> that have
                    the given value when other filters have been applied
                  </div>
                ),
                renderCell: this.renderDistributionCell,
              },
              {
                key: '%',
                width: '4em',
                name: '%',
                helpText: (
                  <div>
                    The subset of <em>{this.props.displayName}</em> out of all{' '}
                    <em>{this.props.displayName}</em> that have the given value
                  </div>
                ),
                renderCell: this.renderPercentCell,
              },
            ] as any
          }
        />
      </div>
    );
  }
}
