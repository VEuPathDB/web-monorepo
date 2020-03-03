import { bindAll, curry, escapeRegExp, get, keyBy } from 'lodash';
import naturalSort from 'natural-sort';
import React from 'react';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import Icon from 'wdk-client/Components/Icon/IconAlt';
import { MesaController as Mesa } from 'wdk-client/Components/Mesa';
import RealTimeSearchBox from 'wdk-client/Components/SearchBox/RealTimeSearchBox';
import StackedBar from 'wdk-client/Components/AttributeFilter/StackedBar';
import { getOperationDisplay, isRange, shouldAddFilter, findAncestorFields } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';
import { preorderSeq } from 'wdk-client/Utils/TreeUtils';
import Banner from 'wdk-client/Components/Banners/Banner';
import UnknownCount from 'wdk-client/Components/AttributeFilter/UnknownCount';

const cx = makeClassNameHelper('wdk-MultiFieldFilter');

const getCountType = curry((countType, summary, value) =>
  get(summary.valueCounts.find(count => count.value === value), countType, NaN))
const getCount = getCountType('count');
const getFilteredCount = getCountType('filteredCount');
const toPercentage = (num, denom) => Math.round(num / denom * 100)

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

  // Update counts for subfilters if the filter operation changes
  componentDidUpdate(prevProps, prevState) {
    const prevFilter = this.getOrCreateFilter(prevProps, prevState);
    const filter = this.getOrCreateFilter(this.props, this.state);
    if (prevFilter.value.operation !== filter.value.operation) {
      this.props.onFieldCountUpdateRequest(this.props.activeField.term);
    }
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
      : ( key === 'count' ? getCount(row.summary, row.value) : getFilteredCount(row.summary, row.value) );
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

    if( notAll ) // NOT all (displayName) have data for this row/variable 
      {  percent = Math.round(row.summary.internalsCount*100/this.props.dataCount); }
  
    return !notAll // all (displayName) have data for this variable
      ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <StackedBar
            count={getCount(row.summary, row.value)}
            filteredCount={getFilteredCount(row.summary, row.value)}
            populationSize={row.summary.internalsCount || this.props.dataCount}
          />
        </div>
      )
      : unknownCount > 0 && (
        <div style={{ fontWeight: 300 }}>
          <b>{percent}% of {this.props.dataCount.toLocaleString()}</b> {this.props.displayName} have data  
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
        ( event.target.checked
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
    const values = Seq.from(this.props.activeFieldState.summary)
      .flatMap(summary => summary.valueCounts)
      .map(count => count.value)
      .uniq()
      .toArray()
      .sort(naturalSort());
    const { searchTerm = '' } = this.props.activeFieldState;
    const searchRe = new RegExp(escapeRegExp(searchTerm), 'i');
    const filter = this.getOrCreateFilter(this.props, this.state);
    const leafFilters = get(this.props.filters.find(filter => filter.field === this.props.activeField.term), 'value.filters', []);
    const filtersByField = keyBy(leafFilters, 'field');

    const hasRowWithRemaining = Seq.from(this.props.activeFieldState.summary)
      .some(summary => summary.internalsFilteredCount > 0);

    const rows = Seq.from(this.props.activeFieldState.summary)
      .flatMap(summary => [
        {
          summary,
          filter: filtersByField[summary.term]
        },
        ...values.map((value, index) => ({
          summary,
          value,
          filter: filtersByField[summary.term],
          isSelected: get(filtersByField, [ summary.term, 'value' ], []).includes(value),
          isLast: index === values.length - 1
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
        <button
          type="button"
          className={cx('UpdateCountsButton') + " btn"}
          disabled={(
            filter.value.operation === 'union' ||
            !this.props.activeFieldState.multiLeafInvalid ||
            this.props.activeFieldState.loading
          )}
          onClick={() => this.props.onFieldCountUpdateRequest(this.props.activeField.term)}
          title={filter.value.operation === 'union'
            ? 'When "any" is chosen, the selected options below do not impact each other.'
            : 'Update the counts of the options in the table below.'}
        >
          {this.props.activeFieldState.loading
            ? <div><Icon fa="circle-o-notch" className="fa-spin"/> Loading...</div>
            : 'Update counts'}
        </button>

        {/*
          padding: .5em;
          border: 1px solid #cccccc;
          border-radius: 6px;
          background: #fbfbf1;
        */}
        {!hasRowWithRemaining && (
          <Banner banner={{
            type: 'warning',
            message: 'Given prior selections, there is no remaining data available for this variable.',
            pinned: true
          }}/>
        )}
        <div style={{ margin: '.5em 0' }}>
          Find {this.props.displayName} with <select
            value={this.getOrCreateFilter(this.props, this.state).value.operation}
            onChange={e => this.setOperation(e.target.value) }
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
              width: '22em',
              wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
              renderHeading: [ this.renderDisplayHeadingName, this.renderDisplayHeadingSearch ],
              renderCell: this.renderDisplayCell
            },
            {
              key: 'filteredCount',
              className: cx('CountCell'),
              sortable: true,
              width: '11em',
              name: <div>Remaining {this.props.displayName}</div>,
              renderCell: this.renderCountCell
            },
            {
              key: 'count',
              className: cx('CountCell'),
              sortable: true,
              width: '11em',
              name: <div>All {this.props.displayName}</div>,
              renderCell: this.renderCountCell
            },
            {
              key: 'distribution',
              name: 'Distribution',
              renderCell: this.renderDistributionCell
            },
            {
              key: '%',
              width: '4em',
              name: '%',
              renderCell: this.renderPercentCell
            }
          ]}
        />
      </div>
    );
  }

}
