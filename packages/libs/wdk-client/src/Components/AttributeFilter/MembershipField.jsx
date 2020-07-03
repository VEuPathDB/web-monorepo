import { bindAll, debounce, difference, escapeRegExp, get, has, isFunction, memoize } from 'lodash';
import React from 'react';
import Toggle from 'wdk-client/Components/Icon/Toggle';
import { MesaController as Mesa } from 'wdk-client/Components/Mesa';
import RealTimeSearchBox from 'wdk-client/Components/SearchBox/RealTimeSearchBox';
import ErrorBoundary from 'wdk-client/Core/Controllers/ErrorBoundary';
import { safeHtml } from 'wdk-client/Utils/ComponentUtils';
import { findAncestorNode } from 'wdk-client/Utils/DomUtils';
import FilterLegend from 'wdk-client/Components/AttributeFilter/FilterLegend';
import StackedBar from 'wdk-client/Components/AttributeFilter/StackedBar';
import UnknownCount from 'wdk-client/Components/AttributeFilter/UnknownCount';


const UNKNOWN_ELEMENT = <em>Not specified</em>;

class MembershipField extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {};
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleGroupBySelected = this.handleGroupBySelected.bind(this);
    this.mapMouseTargetToTooltipState = debounce(this.mapMouseTargetToTooltipState, 250);
    this.state = { showDisabledTooltip: false };
  }

  handleMouseOver(event) {
    const { target, originalTarget } = event;
    this.mapMouseTargetToTooltipState(target, originalTarget);
  }

  handleMouseLeave() {
    this.setState({ showDisabledTooltip: false, top: undefined, left: undefined })
    this.mapMouseTargetToTooltipState.cancel();
  }

  handleGroupBySelected() {
    this.props.onMemberSort(
      this.props.activeField,
      Object.assign({}, this.props.activeFieldState.sort, {
        groupBySelected: !this.props.activeFieldState.sort.groupBySelected
      })
    );
  }

  isSortEnabled() {
    return (
      has(this.props, 'activeFieldState.sort') &&
      isFunction(this.props.onMemberSort)
    );
  }

  mapMouseTargetToTooltipState(element, root) {
    const disabledRow = findAncestorNode(
      element,
      isDisabledRow,
      root
    );
    const showDisabledTooltip = disabledRow != null;
    const { top, left } = disabledRow == null ? {} : disabledRow.getBoundingClientRect();

    this.setState({
      showDisabledTooltip,
      tooltipTop: top + 20,
      tooltipLeft: left + 40
    })
  }

  render() {
    return (
      <ErrorBoundary>
        <div className="membership-filter" onMouseOver={this.handleMouseOver} onMouseLeave={this.handleMouseLeave}>
          {this.props.filter == null ? (
            <div className="membership-actions">
              <div className="membership-action__no-filters">
                <em>Check items below to apply this filter</em>
              </div>
              <div className="membership-action">
                <UnknownCount {...this.props} />
              </div>
            </div>
          )
            : this.isSortEnabled() ? (
              <div className="membership-actions">
                <div className="membership-action membership-action__group-selected">
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0
                    }}
                    type="button"
                    onClick={this.handleGroupBySelected}
                  >
                    <Toggle
                      on={this.props.activeFieldState.sort.groupBySelected}
                    /> Keep checked values at top
                  </button>
                </div>
                <div className="membership-action">
                  <UnknownCount {...this.props} />
                </div>
              </div>
            ) : null}

          {this.state.showDisabledTooltip &&
            <div
              className="disabled-tooltip"
              style={{
                left: this.state.tooltipLeft,
                top: this.state.tooltipTop
              }}
            >
              This item is unavailable because your previous filters have removed these {this.props.displayName}.
            </div>
          }

          <MembershipTable {...this.props} />
        </div>
      </ErrorBoundary>
    )
  }

}

/**
 * Membership activeField component
 */
class MembershipTable extends React.PureComponent {
  static getHelpContent(props) {
    var displayName = props.displayName;
    var fieldDisplay = props.activeField.display;
    return (
      <div>
        You may add or remove {displayName} with specific {fieldDisplay} values
        from your overall selection by checking or unchecking the corresponding
        checkboxes.
      </div>
    );
  }

  constructor(props) {
    super(props);
    bindAll(this,
      'deriveRowClassName',
      'handleRemoveAll',
      'handleRowClick',
      'handleRowDeselect',
      'handleRowSelect',
      'handleSearchTermChange',
      'handleSelectAll',
      'handleSort',
      'handlePageChange',
      'handleRowsPerPageChange',
      'isItemSelected',
      'renderCheckboxCell',
      'renderCheckboxHeading',
      'renderDistributionCell',
      'renderFilteredCountCell',
      'renderFilteredCountHeading1',
      'renderFilteredCountHeading2',
      'renderPrecentageCell',
      'renderUnfilteredCountCell',
      'renderUnfilteredCountHeading1',
      'renderUnfilteredCountHeading2',
      'renderValueCell',
      'renderValueHeading',
      'renderValueHeadingSearch',
      'toFilterValue',
      'getRows',
      'getFilteredRows'
    );
    this.getKnownValues = memoize(this.getKnownValues);
    this.isItemSelected = memoize(this.isItemSelected);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.activeFieldState.summary !== nextProps.activeFieldState.summary) {
      this.getKnownValues.cache.clear();
    }
    if (this.props.filter !== nextProps.filter) {
      this.isItemSelected.cache.clear();
    }
  }

  toFilterValue(value) {
    return this.props.activeField.type === 'string' ? String(value)
      : this.props.activeField.type === 'number' ? Number(value)
      : this.props.activeField.type === 'date' ? Date(value)
      : value;
  }

  getRows(){
     return this.props.activeFieldState.summary.valueCounts;
  }

  getKnownValues() {
    return this.getRows()
      .filter(({ value }) => value != null)
      .map(({ value }) => value);
  }

  getValuesForFilter() {
    return get(this.props, 'filter.value');
  }

  getFilteredRows() {
    const searchTerm = this.props.activeFieldState.searchTerm;
    const usePagination = this.isPaginationEnabled();
    const { totalRows, totalPages, currentPage, rowsPerPage} = this.props.activeFieldState.pagination;
    let rows = this.getRows();

    if (usePagination && ! searchTerm) {
      rows = rows.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      );
    }
    if (searchTerm !== ''){
      let re = new RegExp(escapeRegExp(searchTerm), 'i');
      rows = rows.filter(entry => re.test(entry.value));
      // When searching, pagination doesn't work, but we still show at most rowsPerPage
      if (usePagination){
         rows = rows.slice(0, rowsPerPage);
      }
    }
    return rows;
  }

  deriveRowClassName(item) {
    const selectedClassName = (
      item.filteredCount > 0 &&
      (this.props.filter == null || this.isItemSelected(item))
    ) ? 'member__selected' : '';

    const disabledClassName = item.filteredCount === 0
      ? 'member__disabled' : '';

    return `member ${selectedClassName} ${disabledClassName}`;
  }

  isItemSelected(item) {
    let { filter, selectByDefault } = this.props;

    return filter == null ? selectByDefault
      // value is null (ie, unknown) and includeUnknown selected
      : item.value == null ? filter.includeUnknown
      // filter.value is null (ie, all known values), or filter.value includes value
      : filter.value == null || filter.value.includes(item.value);
  }

  isSortEnabled() {
    return (
      has(this.props, 'activeFieldState.sort') &&
      isFunction(this.props.onMemberSort)
    );
  }

  isPaginationEnabled(){
    return (
      this.getRows().length > 100 &&
      has(this.props, 'activeFieldState.pagination') &&
      isFunction(this.props.onMemberPaginationChange)
    );
  }

  isSearchEnabled() {
    return (
      this.getRows().length > 10 &&
      has(this.props, 'activeFieldState.searchTerm') &&
      isFunction(this.props.onMemberSearch)
    );
  }

  handleItemClick(item, addItem = !this.isItemSelected(item)) {
    let { selectByDefault } = this.props;
    let { value, filteredCount } = item;

    if (filteredCount === 0) {
      // Don't do anything since item is "disabled"
      return;
    }

    if (value == null) {
      this.handleUnknownChange(addItem);
    }
    else {
      const currentFilterValue = this.props.filter == null
        ? (selectByDefault ? this.getKnownValues() : [])
        : this.getValuesForFilter() || this.getKnownValues();
      const filterValue = addItem
        ? currentFilterValue.concat(value)
        : currentFilterValue.filter(v => v !== value);

      this.emitChange(filterValue.length === this.getKnownValues().length
        ? undefined
        : filterValue);
    }
  }

  handleRowClick(item) {
    this.handleItemClick(item);
  }

  handleRowSelect(item) {
    this.handleItemClick(item, true);
  }

  handleRowDeselect(item) {
    this.handleItemClick(item, false);
  }

  handleUnknownChange(addUnknown) {
    this.emitChange(this.getValuesForFilter(), addUnknown);
  }

  handleSelectAll() {
    const allValues = this.getKnownValues();

    const disabledValues = this.props.activeFieldState.summary.valueCounts
      .filter(entry => entry.filteredCount === 0)
      .map(entry => entry.value);

    const filterValues = this.getValuesForFilter();

    const value = this.isSearchEnabled()
      ? difference(
        this.getFilteredRows(this.props.activeFieldState.searchTerm)
          .map(entry => entry.value),
        disabledValues
      ).concat(filterValues || [])
      : ( disabledValues.length === 0 && filterValues == null
        ? undefined
        : difference(allValues, disabledValues).concat(filterValues || []));

    this.emitChange(value);
  }

  handleRemoveAll() {
    this.emitChange([]);
  }

  handleSort({ key: columnKey }, direction) {
    let nextSort = { columnKey, direction };
    let sort = Object.assign({}, this.props.activeFieldState.sort, nextSort);
    this.props.onMemberSort(this.props.activeField, sort);
  }

  handlePageChange(nextPage) {
    this.props.onMemberPaginationChange(
      this.props.activeField,
      {...this.props.activeFieldState.pagination, currentPage: nextPage}
    );
  }

  handleRowsPerPageChange(nextRowsPerPage) {
    const {totalRows, currentPage, rowsPerPage} = this.props.activeFieldState.pagination;

    // try preserve what the user is looking at
    // example: if we're on page 11 and make the page size twice as large, we should now be on page 6
    const rowsBeforeFirstRowOnCurrentPage = (currentPage - 1)  * rowsPerPage;
    const numFullPagesContainingRowsBeforeFirstRowOnCurrentPage = Math.floor(rowsBeforeFirstRowOnCurrentPage / nextRowsPerPage);
    const newCurrentPage = 1 + numFullPagesContainingRowsBeforeFirstRowOnCurrentPage;
    this.props.onMemberPaginationChange(
      this.props.activeField,
      { ...this.props.activeFieldState.pagination,
        rowsPerPage: nextRowsPerPage,
        totalPages: Math.ceil(totalRows / nextRowsPerPage),
        currentPage: newCurrentPage
      }
    );
  }

  handleSearchTermChange(searchTerm) {
    this.props.onMemberSearch(this.props.activeField, searchTerm);
  }

  emitChange(value, includeUnknown = get(this.props, 'filter.includeUnknown', false)) {
    this.props.onChange(this.props.activeField, value, includeUnknown,
      this.getRows());
  }

  renderCheckboxHeading() {
    const availableItems = this.getRows()
      .filter(member => member.filteredCount > 0);
    const allAvailableChecked = availableItems
      .every(member => this.isItemSelected(member));
    const someAvailableChecked = availableItems
      .some(member => this.isItemSelected(member));
    
    const showChecked = availableItems.length > 0 && allAvailableChecked;
    const showIndeterminate = availableItems.length > 0 && someAvailableChecked && ! allAvailableChecked;

     const onClick = () =>
      allAvailableChecked ? this.handleRemoveAll() : this.handleSelectAll();
    return (
      <input
        type="checkbox"
        disabled={availableItems.length === 0}
        checked={showChecked}
        ref={el => el && (el.indeterminate = showIndeterminate)}
        onChange={onClick} />
    );
  }

  renderCheckboxCell({ row }) {
    const isChecked = this.isItemSelected(row);
    const isDisabled = row.filteredCount === 0;
    const onClick = () =>
      isChecked ? this.handleRowDeselect(row) : this.handleRowSelect(row);
    return (
      <input type="checkbox" checked={isChecked} onChange={onClick} disabled={isDisabled} />
    );
  }

  renderValueHeading() {
    return this.props.activeField.display;
  }

  renderValueHeadingSearch() {
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
          onSearchTermChange={this.handleSearchTermChange}
        />
      </div>
    );
  }

  renderValueCell({ value }) {
    return (
      <div>{value == null ? UNKNOWN_ELEMENT : safeHtml(String(value))}</div>
    );
  }

  renderCountHeading1(qualifier) {
    return (
      <div style={{display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <div>{qualifier}</div>
        <div style={{marginLeft: '.6ex', maxWidth: '6em', overflow: 'hidden', textOverflow: 'ellipsis'}}>{this.props.displayName}</div>
      </div>
    );
  }

  renderCountHeading2(internalsCount) {
    return (
      <div>
        {internalsCount.toLocaleString()}
        <small style={{ display: 'inline-block', width: '50%', textAlign: 'center' }}>(100%)</small>
      </div>
    );
  }

  renderCountCell(value, internalsCount) {
    return (
      <div>
        {value.toLocaleString()}
        &nbsp;
        {internalsCount != null && (
          <small style={{ display: 'inline-block', width: '50%', textAlign: 'center' }}>
            ({value === 0 || internalsCount ===  0 ? 0 : Math.round(value/internalsCount * 100)}%)
          </small>
        )}
      </div>
    );
  }

  renderFilteredCountHeading1() {
    return this.renderCountHeading1('Remaining');
  }

  renderFilteredCountHeading2() {
    return this.renderCountHeading2(this.props.activeFieldState.summary.internalsFilteredCount);
  }

  renderFilteredCountCell({ value }) {
    return this.renderCountCell(value, this.props.activeFieldState.summary.internalsFilteredCount);
  }

  renderUnfilteredCountHeading1() {
    return this.renderCountHeading1('');
  }

  renderUnfilteredCountHeading2() {
    return this.renderCountHeading2(this.props.activeFieldState.summary.internalsCount);
  }

  renderUnfilteredCountCell({ value }) {
    return this.renderCountCell(value, this.props.activeFieldState.summary.internalsCount);
  }

  renderDistributionCell({ row }) {
    return (
      <StackedBar
        count={row.count}
        filteredCount={row.filteredCount}
        populationSize={this.props.activeFieldState.summary.internalsCount || this.props.dataCount}
      />
    );
  }

  renderPrecentageCell({ row }) {
    return (
      <small title={`Remaining "${row.value}" / All "${row.value}"`}>
        ({Math.round(row.filteredCount / row.count * 100)}%)
      </small>
    );
  }

  render() {
    var useSort = this.isSortEnabled();
    var useSearch = this.isSearchEnabled();
    var usePagination = this.isPaginationEnabled();

    const {pagination, searchTerm, uiStateOther} = this.props.activeFieldState;

    const uiState = Object.assign({},
      uiStateOther,
      useSearch && searchTerm
      ? {searchTerm}
      : {},
      usePagination 
      ? { 
        pagination: Object.assign({}, pagination, 
          { disallowClick: !! (useSearch && searchTerm) }
          )
        }
      : {}
    );
      
    const eventHandlers = Object.assign(
      {
      // onRowSelect: this.handleRowSelect,
      // onRowDeselect: this.handleRowDeselect,
      // onMultipleRowSelect: this.handleToggleSelectAll,
      // onMultipleRowDeselect: this.handleRemoveAll,
      onSort: this.handleSort
      },
      usePagination ? {
          onPageChange: this.handlePageChange,
          onRowsPerPageChange: this.handleRowsPerPageChange
      } : {}
    );
    return (
      <Mesa
        options={{
          // isRowSelected: this.isItemSelected,
          deriveRowClassName: this.deriveRowClassName,
          onRowClick: this.handleRowClick,
          useStickyHeader: true,
          tableBodyMaxHeight: '80vh'
        }}
        uiState={uiState}
        actions={[]}
        eventHandlers={eventHandlers}
        rows={this.getRows()}
        filteredRows={this.getFilteredRows()}
        columns={[
          {
            key: 'checked',
            sortable: false,
            width: '32px',
            renderHeading: this.renderCheckboxHeading,
            renderCell: this.renderCheckboxCell
          },
          {
            key: 'value',
            inline: true,
            sortable: useSort,
            wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
            renderHeading: useSearch
              ? [this.renderValueHeading, this.renderValueHeadingSearch]
              : this.renderValueHeading,
            renderCell: this.renderValueCell
          },
          {
            key: 'filteredCount',
            sortable: useSort,
            width: '12em',
            helpText: (
              <div>
                The number of <em>{this.props.displayName}</em> that match the criteria chosen for other qualities, <br />
                and that have the given <em>{this.props.activeField.display}</em> value.
                </div>
            ),
            wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
            renderHeading: this.props.activeFieldState.summary.internalsFilteredCount != null
              ? [this.renderFilteredCountHeading1, this.renderFilteredCountHeading2]
              : this.renderFilteredCountHeading1,
            renderCell: this.renderFilteredCountCell
          },
          {
            key: 'count',
            sortable: useSort,
            width: '12em',
            helpText: (
              <div>
                The number of <em>{this.props.displayName}</em> with the
                  given <em>{this.props.activeField.display}</em> value.
                </div>
            ),
            wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
            renderHeading: this.props.activeFieldState.summary.internalsCount != null
              ? [this.renderUnfilteredCountHeading1, this.renderUnfilteredCountHeading2]
              : this.renderUnfilteredCountHeading1,
            renderCell: this.renderUnfilteredCountCell
          },
          {
            key: 'distribution',
            name: 'Distribution',
            width: '30%',
            helpText: <FilterLegend {...this.props} />,
            renderCell: this.renderDistributionCell
          },
          {
            key: '%',
            name: '',
            width: '4em',
            helpText: (
              <div>
                <em>Remaining {this.props.displayName}</em> out of <em>Total {this.props.displayName}</em><br />
                with the given <em>{this.props.activeField.display}</em> value.
                </div>
            ),
            renderCell: this.renderPrecentageCell
          }
        ]}
      >
      </Mesa>
    );
  }

}

export default MembershipField

/** @param {HTMLElement} element */
function isDisabledRow(element) {
  return element.classList.contains('member__disabled');
}
