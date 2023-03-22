import { bindAll, curry, escapeRegExp, get, keyBy } from 'lodash';
import naturalSort from 'natural-sort';
import React from 'react';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { MesaController as Mesa } from 'wdk-client/Components/Mesa';
import RealTimeSearchBox from 'wdk-client/Components/SearchBox/RealTimeSearchBox';
import StackedBar from 'wdk-client/Components/AttributeFilter/StackedBar';
import { toPercentage, getOperationDisplay, isRange, shouldAddFilter, findAncestorFields } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';
import { preorderSeq } from 'wdk-client/Utils/TreeUtils';
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';

const cx = makeClassNameHelper('wdk-MultiFieldFilter');

const getCountType = curry((countType, summary, value) =>
  get(summary.valueCounts.find(count => count.value === value), countType, NaN))
const getCount = getCountType('count');
const getFilteredCount = getCountType('filteredCount');

export default class MultiFieldFilter extends React.Component {

  constructor(props) {
    super(props);
    bindAll(this, [
      'deriveRowClassName',
      'handleTableSort',
      'renderDisplayHeadingName',
      'renderDisplayHeadingSearch',
      'renderDisplayCell',
      'renderCountCell',
      'renderDistributionCell',
      'renderPercentCell'
    ]);
    this.state = { operation: 'intersect' };
  }

  getFieldByTerm(term) {
    return preorderSeq(this.props.fieldTree)
      .map(node => node.field)
      .find(field => field.term === term);
  }
  // Event handlers

  // Invoke callback with filters array
  handleLeafFilterChange(field, value, includeUnknown, valueCounts) {
    const multiFilter = this.getOrCreateFilter(this.props, this.state);
    const leafFilter = { field: field.term, type: field.type, isRange: isRange(field), value, includeUnknown };
    const otherLeafFilters = multiFilter.value.filters.filter(filter => filter.field !== field.term);
    const shouldAdd = shouldAddFilter(leafFilter, valueCounts, this.props.selectByDefault);
    const filter = {
      ...multiFilter,
      value: {
        ...multiFilter.value,
        filters: otherLeafFilters.concat(shouldAdd ? [leafFilter] : [])
      }
    };
    const otherFilters = this.props.filters.filter(filter => filter.field !== this.props.activeField.term);
    const nextFilters = otherFilters.concat(filter.value.filters.length > 0 ? [filter] : []);

    this.props.onFiltersChange(nextFilters);
  }

  handleTableSort(column, direction) {
    this.props.onMemberSort(this.props.activeField, { columnKey: column.key, direction });
  }

  setOperation(operation) {
    this.setState({ operation });
    const filter = this.getOrCreateFilter(this.props, this.state);
    if (filter.value.filters.length > 0) {
      const otherFilters = this.props.filters.filter(filter => filter.field !== this.props.activeField.term);
      const nextFilters = otherFilters.concat([{ ...filter, value: { ...filter.value, operation } }]);
      this.props.onFiltersChange(nextFilters);
    }
  }

  getOrCreateFilter(props, state) {
    const { term: field, type, isRange } = props.activeField;
    const filter = props.filters.find(filter => filter.field === props.activeField.term);
    return filter != null ? filter : {
      field,
      type,
      isRange,
      value: {
        operation: state.operation,
        filters: []
      },
      includeUnknown: false // not sure we need this for multi filter
    }
  }

  deriveRowClassName(row) {
    return cx(
      'Row',
      row.value == null ? 'summary' : 'value',
      row.isSelected && 'selected',
      row.isLast && 'last-value',
      (row.value == null
        ? row.summary.internalsFilteredCount
        : get(row.summary.valueCounts.find(count => count.value === row.value), 'filteredCount', 0)
      ) > 0 ? 'enabled' : 'disabled'
    );
  }

  renderDisplayHeadingName() {
    return this.props.activeField.display;
  }

  renderDisplayHeadingSearch() {
    return (
      <div
        style={{
          width: '15em',
          fontSize: '.8em',
          fontWeight: 'normal',
        }}
        onMouseUp={event => {
          event.stopPropagation();
        }}
      >
        <RealTimeSearchBox
          searchTerm={this.props.activeFieldState.searchTerm}
          placeholderText="Find items"
          onSearchTermChange={searchTerm => this.props.onMemberSearch(this.props.activeField, searchTerm)}
        />
      </div>
    )
  }

  renderDisplayCell({ row }) {
    return (
      <div className={cx('ValueContainer')}>
        <div>
          {row.value == null && this.getFieldByTerm(row.summary.term).display}
        </div>
        <div>
          {this.renderRowValue(row)}
        </div>
      </div>
    )
  }

  renderCountCell({ key, row }) {
    const internalsCount = key === 'count' ? row.summary.internalsCount : row.summary.internalsFilteredCount;
    const count = row.value == null
      ? internalsCount
      : (key === 'count' ? getCount(row.summary, row.value) : getFilteredCount(row.summary, row.value));
    return (
      <React.Fragment>
        <div>
          {count.toLocaleString()}
        </div>
        <div>
          <small>({toPercentage(count, internalsCount || this.props.dataCount)}%)</small>
        </div>
      </React.Fragment>
    );
  }

  renderDistributionCell({ row }) {
    const unknownCount = this.props.dataCount - row.summary.internalsCount;
    const notAll = (row.value == null);
    let percent = 0;

    if (notAll) // NOT all (displayName) have data for this row/variable
    { percent = Math.round(row.summary.internalsCount * 100 / this.props.dataCount); }

    return !notAll // all (displayName) have data for this variable
      ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <StackedBar
            count={getCount(row.summary, row.value)}
            filteredCount={getFilteredCount(row.summary, row.value)}
            populationSize={row.summary.internalsCount || this.props.dataCount}
            fillBarColor={this.props.fillBarColor}
            fillFilteredBarColor={this.props.fillFilteredBarColor}
          />
        </div>
      )
      : unknownCount > 0 && (
        <div style={{ fontWeight: 300 }}>
          <b>{toPercentage(row.summary.internalsCount, this.props.dataCount).toLocaleString()}% of {this.props.dataCount.toLocaleString()}</b> {this.props.displayName} have data
        </div>
      )
  }

  renderPercentCell({ row }) {
    return row.value != null && (
      <small>
        ({toPercentage(getFilteredCount(row.summary, row.value), getCount(row.summary, row.value))}%)
      </small>
    )
  }

  renderRowValue(row) {
    const { value, filter, summary, isSelected } = row;
    if (value == null) return null;
    const filterValue = get(filter, 'value', []);
    const handleChange = event =>
      this.handleLeafFilterChange(
        this.getFieldByTerm(summary.term),
        (event.target.checked
          ? [value].concat(filterValue)
          : filterValue.filter(item => item !== value)
        ),
        false,
        summary.valueCounts
      );
    return (
      <label>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleChange}
        /> {value}
      </label>
    )
  }

  render() {
    const { searchTerm = '' } = this.props.activeFieldState;
    const searchRe = new RegExp(escapeRegExp(searchTerm), 'i');
    const filter = this.getOrCreateFilter(this.props, this.state);
    const leafFilters = get(this.props.filters.find(filter => filter.field === this.props.activeField.term), 'value.filters', []);
    const filtersByField = keyBy(leafFilters, 'field');

    const hasRowWithRemaining = this.props.activeFieldState.leafSummaries
      .some(summary => summary.internalsFilteredCount > 0);

    const hasNoData = this.props.activeFieldState.leafSummaries
      .every(summary => summary.internalsCount === 0);

    const rows = Seq.from(this.props.activeFieldState.leafSummaries)
      .flatMap(summary => [
        {
          summary,
          filter: filtersByField[summary.term]
        },
        ...summary.valueCounts.map((data, index) => ({
          summary,
          value: data.value,
          filter: filtersByField[summary.term],
          isSelected: get(filtersByField, [summary.term, 'value'], []).includes(data.value),
          isLast: index === summary.valueCounts.length - 1
        }))
      ])

    const filteredRows = rows
      .filter(({ summary }) =>
        findAncestorFields(this.props.fieldTree, summary.term)
          .dropWhile(field => field.term !== this.props.activeField.term)
          .drop(1)
          .some(field => searchRe.test(field.display)))

    return (
      <div className={cx()}>
        {(!hasRowWithRemaining || hasNoData) && (
          <Banner banner={{
            type: 'warning',
            message: (hasNoData
              ? 'There is no data available for this variable.'
              : 'Given prior selections, there is no remaining data available for this variable.'
            ),
            pinned: true
          }} />
        )}
        <div style={{ margin: '.5em 0' }}>
          Find {this.props.displayName} with <select
            value={this.getOrCreateFilter(this.props, this.state).value.operation}
            onChange={e => this.setOperation(e.target.value)}
          >
            <option value="union">{getOperationDisplay('union')}</option>
            <option value="intersect">{getOperationDisplay('intersect')}</option>
          </select> of the options selected below.
        </div>
        <Mesa
          options={{
            useStickyHeader: true,
            tableBodyMaxHeight: '80vh',
            deriveRowClassName: this.deriveRowClassName
          }}
          uiState={{
            sort: this.props.activeFieldState.sort
          }}
          eventHandlers={{
            onSort: this.handleTableSort
          }}
          rows={rows.toArray()}
          filteredRows={filteredRows.toArray()}
          columns={[
            {
              key: 'display',
              sortable: true,
              // width: '40%',
              wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
              renderHeading: [this.renderDisplayHeadingName, this.renderDisplayHeadingSearch],
              renderCell: this.renderDisplayCell
            },
            {
              key: 'filteredCount',
              className: cx('CountCell'),
              sortable: true,
              width: '13em',
              helpText: (
                <div>
                  The number of <em>{this.props.displayName}</em> that match the filters applied for other variables<br />
                  and that have the given value
                </div>
              ),
              wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
              name: <div style={{ textAlign: 'center' }}>Subset of <i>{this.props.displayName}</i></div>,
              renderCell: this.renderCountCell
            },
            {
              key: 'count',
              className: cx('CountCell'),
              sortable: true,
              width: '13em',
              helpText: (
                <div>
                  The number of <em>{this.props.displayName}</em> in the dataset that have the given value
                </div>
              ),
              wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
              name: <div style={{ textAlign: 'center' }}>All <i>{this.props.displayName}</i></div>,
              renderCell: this.renderCountCell
            },
            {
              key: 'distribution',
              name: 'Distribution',
              width: '30%',
              helpText: (
                <div>
                  The subset of <em>{this.props.displayName}</em> that have the given value when other filters have been applied
                </div>
              ),
              renderCell: this.renderDistributionCell
            },
            {
              key: '%',
              width: '4em',
              name: '%',
              helpText: (
                <div>
                  The subset of <em>{this.props.displayName}</em> out of all <em>{this.props.displayName}</em> that have the given value
                </div>
              ),
              renderCell: this.renderPercentCell
            }
          ]}
        />
      </div>
    );
  }

}
