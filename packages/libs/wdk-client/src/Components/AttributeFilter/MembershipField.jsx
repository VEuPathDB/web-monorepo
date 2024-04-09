import {
  bindAll,
  debounce,
  difference,
  escapeRegExp,
  get,
  has,
  isFunction,
  memoize,
  partition,
} from 'lodash';
import React from 'react';
import Toggle from '../../Components/Icon/Toggle';
import { MesaController as Mesa } from '@veupathdb/coreui/lib/components/Mesa';
import RealTimeSearchBox from '../../Components/SearchBox/RealTimeSearchBox';
import ErrorBoundary from '../../Core/Controllers/ErrorBoundary';
import { safeHtml } from '../../Utils/ComponentUtils';
import { findAncestorNode } from '../../Utils/DomUtils';
import StackedBar from '../../Components/AttributeFilter/StackedBar';
import UnknownCount from '../../Components/AttributeFilter/UnknownCount';
import { toPercentage } from '../../Components/AttributeFilter/AttributeFilterUtils';

const UNKNOWN_ELEMENT = <em>Not specified</em>;

class MembershipField extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleGroupBySelected = this.handleGroupBySelected.bind(this);
    this.mapMouseTargetToTooltipState = debounce(
      this.mapMouseTargetToTooltipState,
      250
    );
    this.state = { showDisabledTooltip: false };
  }

  handleMouseOver(event) {
    const { target, originalTarget } = event;
    this.mapMouseTargetToTooltipState(target, originalTarget);
  }

  handleMouseLeave() {
    this.setState({
      showDisabledTooltip: false,
      top: undefined,
      left: undefined,
    });
    this.mapMouseTargetToTooltipState.cancel();
  }

  handleGroupBySelected() {
    this.props.onMemberSort(
      this.props.activeField,
      Object.assign({}, this.props.activeFieldState.sort, {
        groupBySelected: !this.props.activeFieldState.sort.groupBySelected,
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
    const disabledRow = findAncestorNode(element, isDisabledRow, root);
    const showDisabledTooltip = disabledRow != null;
    const { top, left } =
      disabledRow == null ? {} : disabledRow.getBoundingClientRect();

    this.setState({
      showDisabledTooltip,
      tooltipTop: top + 20,
      tooltipLeft: left + 40,
    });
  }

  render() {
    return (
      <ErrorBoundary>
        <div
          className="membership-filter"
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseLeave}
        >
          {this.props.filter == null ? (
            <div className="membership-actions">
              <div className="membership-action__no-filters">
                <em>Check items below to apply this filter</em>
              </div>
              <div className="membership-action">
                <UnknownCount {...this.props} />
              </div>
            </div>
          ) : this.isSortEnabled() ? (
            <div className="membership-actions">
              <div className="membership-action membership-action__group-selected">
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                  }}
                  type="button"
                  onClick={this.handleGroupBySelected}
                >
                  <Toggle
                    on={this.props.activeFieldState.sort.groupBySelected}
                  />{' '}
                  Keep checked values at top
                </button>
              </div>
              <div className="membership-action">
                <UnknownCount {...this.props} />
              </div>
            </div>
          ) : null}

          {this.state.showDisabledTooltip && (
            <div
              className="disabled-tooltip"
              style={{
                left: this.state.tooltipLeft,
                top: this.state.tooltipTop,
              }}
            >
              This item is unavailable because your previous filters have
              removed these {this.props.displayName}.
            </div>
          )}

          <MembershipTable {...this.props} />
        </div>
      </ErrorBoundary>
    );
  }
}

MembershipField.defaultProps = {
  filteredCountHeadingPrefix: 'Remaining',
  unfilteredCountHeadingPrefix: '',
  showInternalMesaCounts: false,
};

function filterBySearchTerm(rows, searchTerm) {
  if (searchTerm !== '') {
    let re = new RegExp(escapeRegExp(searchTerm), 'i');
    return rows.filter((entry) => re.test(entry.value));
  } else {
    return rows;
  }
}
function selectPage(rows, currentPage, rowsPerPage) {
  return rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
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
    bindAll(
      this,
      'deriveRowClassName',
      'handleRowClick',
      'handleRowDeselect',
      'handleRowSelect',
      'handleSearchTermChange',
      'handleSelectAll',
      'handleSort',
      'handleChangeCurrentPage',
      'handleChangeRowsPerPage',
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
      'getRows'
    );
    this.getKnownValues = memoize(this.getKnownValues);
    this.isItemSelected = memoize(this.isItemSelected);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.activeFieldState.summary !== nextProps.activeFieldState.summary
    ) {
      this.getKnownValues.cache.clear();
    }
    if (this.props.filter !== nextProps.filter) {
      this.isItemSelected.cache.clear();
    }
  }

  toFilterValue(value) {
    return this.props.activeField.type === 'string'
      ? String(value)
      : this.props.activeField.type === 'number'
      ? Number(value)
      : this.props.activeField.type === 'date'
      ? Date(value)
      : value;
  }

  getRows() {
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

  deriveRowClassName(item) {
    const selectedClassName =
      item.filteredCount > 0 &&
      (this.props.filter == null || this.isItemSelected(item))
        ? 'member__selected'
        : '';

    const disabledClassName =
      item.filteredCount === 0 ? 'member__disabled' : '';

    return `member ${selectedClassName} ${disabledClassName}`;
  }

  isItemSelected(item) {
    let { filter, selectByDefault } = this.props;

    return filter == null
      ? selectByDefault
      : // value is null (ie, unknown) and includeUnknown selected
      item.value == null
      ? filter.includeUnknown
      : // filter.value is null (ie, all known values), or filter.value includes value
        filter.value == null || filter.value.includes(item.value);
  }

  isSortEnabled() {
    return (
      has(this.props, 'activeFieldState.sort') &&
      isFunction(this.props.onMemberSort)
    );
  }

  isPaginationEnabled() {
    return (
      this.getRows().length > 100 &&
      has(this.props, 'activeFieldState.currentPage') &&
      isFunction(this.props.onMemberChangeCurrentPage)
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
    } else {
      const currentFilterValue =
        this.props.filter == null
          ? selectByDefault
            ? this.getKnownValues()
            : []
          : this.getValuesForFilter() || this.getKnownValues();
      const filterValue = addItem
        ? currentFilterValue.concat(value)
        : currentFilterValue.filter((v) => v !== value);

      this.setSelections(
        filterValue.length === this.getKnownValues().length
          ? undefined
          : filterValue
      );
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
    this.setSelections(this.getValuesForFilter() ?? [], addUnknown);
  }

  handleSelectAll() {
    const allRows = this.getRows();
    const searchTerm =
      this.isSearchEnabled() && this.props.activeFieldState.searchTerm;

    if (!searchTerm) {
      if (
        allRows.some(
          (row) => row.filteredCount > 0 && !this.isItemSelected(row)
        )
      ) {
        // At least one row isn't selected. Select all rows.
        this.setSelections(
          allRows
            .filter((row) => row.filteredCount > 0 && row.value != null)
            .map((row) => row.value),
          true
        );
      } else {
        // All rows are selected. Deselect all rows.
        this.setSelections([], false);
      }
    } else {
      const selectableRows = allRows.filter((row) => row.filteredCount > 0);
      const selectedValues = selectableRows
        .filter((row) => this.isItemSelected(row))
        .map((row) => row.value);
      // Values in the search results that are selectable
      const selectableResultValues = filterBySearchTerm(
        selectableRows,
        searchTerm
      ).map((row) => row.value);
      const [selectedResultValues, unselectedResultValues] = partition(
        selectableResultValues,
        (value) => selectedValues.includes(value)
      );

      if (unselectedResultValues.length > 0) {
        // Select all search result values, preserving selections outside the search results
        this.setSelections([...selectedValues, ...unselectedResultValues]);
      } else {
        // Deselect all search result values, preserving selections outside the search results
        this.setSelections(difference(selectedValues, selectedResultValues));
      }
    }
  }

  handleSort({ key: columnKey }, direction) {
    let nextSort = { columnKey, direction };
    let sort = Object.assign({}, this.props.activeFieldState.sort, nextSort);
    this.props.onMemberSort(this.props.activeField, sort);
  }

  handleSearchTermChange(searchTerm) {
    // When we are not on page 1, we need to determine if our currentPage position remains viable
    // or if it should get reset to page 1 (see note in TableFilter.tsx's handleSearch callback definition)
    if (this.props.activeFieldState.currentPage !== 1) {
      const numberOfFilteredRows = filterBySearchTerm(
        this.getRows(),
        searchTerm
      ).length;
      const shouldResetPaging =
        numberOfFilteredRows <=
        this.props.activeFieldState.rowsPerPage *
          (this.props.activeFieldState.currentPage - 1);
      this.props.onMemberSearch(
        this.props.activeField,
        searchTerm,
        shouldResetPaging
      );
    }
    this.props.onMemberSearch(this.props.activeField, searchTerm);
  }

  handleChangeCurrentPage(newCurrentPage) {
    this.props.onMemberChangeCurrentPage(
      this.props.activeField,
      newCurrentPage
    );
  }

  handleChangeRowsPerPage(newRowsPerPage) {
    this.props.onMemberChangeRowsPerPage(
      this.props.activeField,
      newRowsPerPage
    );
  }

  setSelections(
    value,
    includeUnknown = get(this.props, 'filter.includeUnknown', false)
  ) {
    this.props.onChange(
      this.props.activeField,
      value,
      includeUnknown,
      this.getRows()
    );
  }

  renderCheckboxHeading() {
    const availableItems = this.getRows().filter(
      (member) => member.filteredCount > 0
    );
    const allAvailableChecked = availableItems.every((member) =>
      this.isItemSelected(member)
    );
    const someAvailableChecked = availableItems.some((member) =>
      this.isItemSelected(member)
    );

    const showChecked = availableItems.length > 0 && allAvailableChecked;
    const showIndeterminate =
      availableItems.length > 0 && someAvailableChecked && !allAvailableChecked;

    return (
      <input
        type="checkbox"
        disabled={availableItems.length === 0}
        checked={showChecked}
        ref={(el) => el && (el.indeterminate = showIndeterminate)}
        onChange={this.handleSelectAll}
      />
    );
  }

  renderCheckboxCell({ row }) {
    const isChecked = this.isItemSelected(row);
    const isDisabled = row.filteredCount === 0;
    const onClick = () =>
      isChecked ? this.handleRowDeselect(row) : this.handleRowSelect(row);
    return (
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onClick}
        disabled={isDisabled}
      />
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
        onMouseUp={(event) => {
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
      <div
        style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}
      >
        <div>{qualifier}</div>
        <div
          style={{
            marginLeft: '.6ex',
            maxWidth: '6em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontStyle: 'italic',
          }}
        >
          {this.props.displayName}
        </div>
      </div>
    );
  }

  renderCountHeading2(internalsCount) {
    return (
      <div>
        {internalsCount.toLocaleString()}
        <small
          style={{ display: 'inline-block', width: '50%', textAlign: 'center' }}
        >
          (100%)
        </small>
      </div>
    );
  }

  renderCountCell(value, internalsCount) {
    return (
      <div>
        {value.toLocaleString()}
        &nbsp;
        {internalsCount != null && (
          <small
            style={{
              display: 'inline-block',
              width: '50%',
              textAlign: 'center',
            }}
          >
            (
            {value === 0 || internalsCount === 0
              ? 0
              : toPercentage(value, internalsCount)}
            %)
          </small>
        )}
      </div>
    );
  }

  renderFilteredCountHeading1() {
    return this.renderCountHeading1(this.props.filteredCountHeadingPrefix);
  }

  renderFilteredCountHeading2() {
    return this.renderCountHeading2(
      this.props.activeFieldState.summary.internalsFilteredCount
    );
  }

  renderFilteredCountCell({ value }) {
    return this.renderCountCell(
      value,
      this.props.activeFieldState.summary.internalsFilteredCount
    );
  }

  renderUnfilteredCountHeading1() {
    return this.renderCountHeading1(this.props.unfilteredCountHeadingPrefix);
  }

  renderUnfilteredCountHeading2() {
    return this.renderCountHeading2(
      this.props.activeFieldState.summary.internalsCount
    );
  }

  renderUnfilteredCountCell({ value }) {
    return this.renderCountCell(
      value,
      this.props.activeFieldState.summary.internalsCount
    );
  }

  renderDistributionCell({ row }) {
    return (
      <StackedBar
        count={row.count}
        filteredCount={row.filteredCount}
        populationSize={
          this.props.activeFieldState.summary.internalsCount ||
          this.props.dataCount
        }
        fillBarColor={this.props.fillBarColor}
        fillFilteredBarColor={this.props.fillFilteredBarColor}
      />
    );
  }

  renderPrecentageCell({ row }) {
    return (
      <small title={`Remaining "${row.value}" / All "${row.value}"`}>
        ({Math.round((row.filteredCount / row.count) * 100)}%)
      </small>
    );
  }

  render() {
    var useSort = this.isSortEnabled();
    var useSearch = this.isSearchEnabled();
    var usePagination = this.isPaginationEnabled();
    const { currentPage, rowsPerPage, searchTerm, ...uiStateOther } =
      this.props.activeFieldState;

    const rows = this.getRows();
    let filteredRows = this.getRows();

    if (useSearch) {
      filteredRows = filterBySearchTerm(filteredRows, searchTerm);
    }

    const totalRowsForPagination = Math.max(1, filteredRows.length);

    if (usePagination) {
      filteredRows = selectPage(filteredRows, currentPage, rowsPerPage);
    }

    const uiState = Object.assign(
      {},
      uiStateOther,
      useSearch && searchTerm ? { searchTerm } : {},
      usePagination
        ? {
            pagination: {
              currentPage,
              rowsPerPage,
              totalRows: totalRowsForPagination,
              rowsPerPageOptions: [50, 100, 200, 500, 1000],
              totalPages: Math.ceil(totalRowsForPagination / rowsPerPage),
            },
          }
        : {}
    );

    const eventHandlers = Object.assign(
      {
        // onRowSelect: this.handleRowSelect,
        // onRowDeselect: this.handleRowDeselect,
        // onMultipleRowSelect: this.handleSelectAll,
        onSort: this.handleSort,
      },
      usePagination
        ? {
            onPageChange: this.handleChangeCurrentPage,
            onRowsPerPageChange: this.handleChangeRowsPerPage,
          }
        : {}
    );
    return (
      <Mesa
        options={{
          isRowSelected: this.isItemSelected,
          deriveRowClassName: this.deriveRowClassName,
          onRowClick: this.handleRowClick,
          useStickyHeader: true,
          tableBodyMaxHeight: '80vh',
        }}
        uiState={uiState}
        actions={
          this.props.showInternalMesaCounts
            ? [
                {
                  selectionRequired: false,
                  element() {
                    return null;
                  },
                  callback: () => null,
                },
              ]
            : []
        }
        eventHandlers={eventHandlers}
        rows={rows}
        filteredRows={filteredRows}
        columns={[
          {
            key: 'checked',
            sortable: false,
            width: '32px',
            renderHeading: this.renderCheckboxHeading,
            renderCell: this.renderCheckboxCell,
          },
          {
            key: 'value',
            inline: true,
            sortable: useSort,
            wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
            renderHeading: useSearch
              ? [this.renderValueHeading, this.renderValueHeadingSearch]
              : this.renderValueHeading,
            renderCell: this.renderValueCell,
          },
          {
            key: 'filteredCount',
            sortable: useSort,
            width: '12em',
            helpText: (
              <div>
                The number of <em>{this.props.displayName}</em> that match the
                filters applied for other variables
                <br />
                and have the given <em>
                  {this.props.activeField.display}
                </em>{' '}
                value
              </div>
            ),
            wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
            renderHeading:
              this.props.activeFieldState.summary.internalsFilteredCount != null
                ? [
                    this.renderFilteredCountHeading1,
                    this.renderFilteredCountHeading2,
                  ]
                : this.renderFilteredCountHeading1,
            renderCell: this.renderFilteredCountCell,
          },
          {
            key: 'count',
            sortable: useSort,
            width: '12em',
            helpText: (
              <div>
                The number of <em>{this.props.displayName}</em> in the dataset
                that have the given <em>{this.props.activeField.display}</em>{' '}
                value
              </div>
            ),
            wrapCustomHeadings: ({ headingRowIndex }) => headingRowIndex === 0,
            renderHeading:
              this.props.activeFieldState.summary.internalsCount != null
                ? [
                    this.renderUnfilteredCountHeading1,
                    this.renderUnfilteredCountHeading2,
                  ]
                : this.renderUnfilteredCountHeading1,
            renderCell: this.renderUnfilteredCountCell,
          },
          {
            key: 'distribution',
            name: 'Distribution',
            width: '30%',
            helpText: (
              <div>
                The subset of <em>{this.props.displayName}</em> that have the
                given <em>{this.props.activeField.display}</em> value when other
                filters have been applied
              </div>
            ),
            renderCell: this.renderDistributionCell,
          },
          {
            key: '%',
            name: '',
            width: '4em',
            helpText: (
              <div>
                The subset of <em>{this.props.displayName}</em> out of all{' '}
                <em>{this.props.displayName}</em> that have the given{' '}
                <em>{this.props.activeField.display}</em> value
              </div>
            ),
            renderCell: this.renderPrecentageCell,
          },
        ]}
      ></Mesa>
    );
  }
}

export default MembershipField;

/** @param {HTMLElement} element */
function isDisabledRow(element) {
  return element.classList.contains('member__disabled');
}
