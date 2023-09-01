import $ from 'jquery';
import RealTimeSearchBox from '../../Components/SearchBox/RealTimeSearchBox';
import { isEqual, once, uniqueId, uniqBy } from 'lodash';
import React, {
  Component,
  PureComponent,
  ReactElement,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import {
  formatAttributeValue,
  lazy,
  wrappable,
} from '../../Utils/ComponentUtils';
import { containsAncestorNode } from '../../Utils/DomUtils';
import {
  areTermsInStringRegexString,
  parseSearchQueryString,
} from '../../Utils/SearchUtils';
import CheckboxList from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';
import { LinksPosition } from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import '../../Components/DataTable/DataTable.css';
import HelpIcon from '../Icon/HelpIcon';
import Tooltip from '../Overlays/Tooltip';
import TabbableContainer from '../Display/TabbableContainer';
import { ErrorBoundary } from '../../Controllers';

const expandColumn = {
  data: undefined,
  className: 'wdk-DataTableCell wdk-DataTableCell__childRowToggle',
  orderable: false,
  title: '<button class="wdk-DataTableCellExpand"></button>',
  defaultContent: '<div class="wdk-DataTableCellExpand"></div>',
};

type ColumnDef = {
  name: string;
  displayName: string;
  help?: string;
  sortType?: string;
  isDisplayable?: boolean;
  isSortable?: boolean;
};

type Row = { [key: string]: any };

type SortingDef = {
  name: string;
  direction: 'ASC' | 'DESC';
};

type ChildRowProps = {
  rowIndex: number;
  rowData: Object;
};

type Props = {
  /**
   * Array of descriptors used for table column headers.
   * `name` is used as a key for looking up cell data in `data`.
   * `displayName` is an optional property used for the header text (`name` is
   * used as a fallback).
   */
  columns: ColumnDef[];

  /**
   * The data to display in the table. An array of objects whose keys correspond
   * to the `name` property in the `columns` prop.
   */
  data: Row[];

  /**
   * Default sorting for the table. Each item indicates the column and direction.
   */
  sorting?: SortingDef[];

  onSortingChange?: (sorting: SortingDef[]) => void;

  /** width of the table - if a string, treated as a CSS unit; if a number, treated as px */
  width?: string | number;

  /** height of the table - if a string, treated as a CSS unit; if a number, treated as px */
  height?: string | number;

  /** can users search the table */
  searchable?: boolean;

  /**
   * Determines the body of child rows. If this is provided, each table row will
   * be rendered with an expansion toggle. This can be a string, a function, or
   * a React Component. If it is a function, the function will receive the same
   * props argument that the React Component would receive as props:
   *
   *    props: {
   *      rowIndex: number;
   *      rowData: Object;
   *    }
   */
  childRow?: string | ((props: ChildRowProps) => ReactElement<ChildRowProps>);

  /** Array of row ids that should be expanded */
  expandedRows?: number[];

  /** Called when expanded rows change */
  onExpandedRowsChange?: (indexes: number[]) => void;

  getRowId: (row: Row) => number;

  /** Called when the underlying DataTable has been drawn */
  onDraw: (table: HTMLTableElement) => void;

  /**
   * If this prop is not provided, the search term
   * will be maintained "internally" by this component.
   */
  searchTerm?: string;

  /** Called when the search term has changed */
  onSearchTermChange?: (newSearchTerm: string) => void;
};

interface State {
  childRows: [HTMLElement, ChildRowProps][];
  selectedColumnFilters: string[];
  showFieldSelector: boolean;
  /** Used to display row counts to user */
  numberOfRowsVisible: number | null;
}

/**
 * Sortable table for WDK-formatted data.
 *
 * This uses DataTables jQuery plugin
 */
class DataTable extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.onColumnFilterChange = this.onColumnFilterChange.bind(this);
    this.toggleFilterFieldSelector = this.toggleFilterFieldSelector.bind(this);
  }

  /** Default DataTables jQuery plugin options. */
  static defaultDataTableOpts = {
    dom: 'lript',
    autoWidth: false,
    deferRender: true,
    paging: false,
    searching: true,
    language: {
      info: 'Showing _TOTAL_ ',
      infoFiltered: 'of _MAX_ ',
      infoEmpty: 'Showing 0 ',
      infoPostFix: 'rows',
    },
  };

  state: State = {
    childRows: [],
    selectedColumnFilters: [],
    showFieldSelector: false,
    numberOfRowsVisible: null,
  };

  _childRowContainers: Map<HTMLTableRowElement, HTMLElement> = new Map();

  _isRedrawing: boolean = false;

  _dataTable?: DataTables.Api;

  _searchTerm = '';

  node: HTMLElement | null = null;

  columns: DataTables.ColumnSettings[] = [];

  componentDidMount() {
    // this._childRowContainers = new Map();
    this._setup();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this._dataTable == null) return;

    let columnsChanged = didPropChange(this, prevProps, 'columns');
    let dataChanged = didPropChange(this, prevProps, 'data');
    let sortingChanged = didPropChange(this, prevProps, 'sorting');
    let widthChanged = didPropChange(this, prevProps, 'width');
    let heightChanged = didPropChange(this, prevProps, 'height');
    let expandedRowsChanged = didPropChange(this, prevProps, 'expandedRows');
    let searchTermChanged = didPropChange(this, prevProps, 'searchTerm');
    let columnFiltersChanged = didStateChange(
      this,
      prevState,
      'selectedColumnFilters'
    );

    this._isRedrawing = true;

    if (columnsChanged || dataChanged || heightChanged) {
      this._destroy(this._dataTable);
      this._setup();
    } else {
      let needsRedraw = false;

      if (sortingChanged) {
        this._updateSorting(this._dataTable);
        needsRedraw = true;
      }

      if (widthChanged) {
        this._updateWidth(this._dataTable);
        needsRedraw = true;
      }

      if (expandedRowsChanged) {
        this._updateExpandedRows(this._dataTable);
      }

      if (columnFiltersChanged || searchTermChanged) {
        const indexesOfSelectedFilters = this.state.selectedColumnFilters.map(
          (colFilter) =>
            this.props.columns.findIndex((col) => col.name === colFilter)
        );
        this._updateSearch(
          this._dataTable,
          this.props.searchTerm ?? this._searchTerm,
          indexesOfSelectedFilters
        );
      }

      if (needsRedraw && this._dataTable) {
        this._dataTable.draw();
      }
    }

    this._isRedrawing = false;
  }

  componentWillUnmount() {
    if (this._dataTable) this._destroy(this._dataTable);
  }

  // prop change handlers
  // --------------------

  /** Initialize datatable plugin and set up handlers for creating child rows */
  _setup() {
    if (this.node == null) return;

    let {
      childRow,
      data,
      sorting = [],
      searchable = true,
      height,
      width,
    } = this.props;

    let initialSearchTerm = this.props.searchTerm ?? this._searchTerm;

    let columns = (this.columns =
      childRow != null
        ? [expandColumn, ...formatColumns(this.props.columns)]
        : formatColumns(this.props.columns));

    let order = formatSorting(
      columns,
      sorting.length === 0
        ? [{ name: this.props.columns[0].name, direction: 'ASC' }]
        : sorting
    );

    let tableOpts = Object.assign({}, DataTable.defaultDataTableOpts, {
      columns,
      data,
      order,
      searching: searchable,
      info: searchable,
      headerCallback: once((thead: HTMLTableHeaderCellElement) => {
        const $ths = $(thead).find('th');
        const offset = childRow ? 1 : 0;
        if (childRow) {
          $ths.eq(0).attr('title', 'Show or hide all row details');
        }
        this.props.columns
          .filter((column) => column.isDisplayable)
          .forEach((column, index) => {
            if (column.help != null) {
              $ths
                .eq(index + offset)
                .append('&nbsp;')
                .append(
                  $(
                    `
                <div class="HelpTrigger">
                  <i class="fa fa-question-circle"></i>
                </div>
              `.trim()
                  )
                    .attr('title', column.help)
                    .click((e) => e.stopPropagation())
                    .qtip({
                      hide: {
                        fixed: true,
                        delay: 500,
                      },
                      style: {
                        classes: 'qtip-wdk',
                      },
                    })
                );
            }
          });
      }),
      createdRow: (row: HTMLTableRowElement) => {
        row.classList.add('wdk-DataTableRow');
        if (childRow) {
          row.classList.add('wdk-DataTableRow__expandable');
          row.tabIndex = 0;
        }
      },
    });

    if (height != null)
      Object.assign(tableOpts, {
        scrollY: height,
        scrollX: true,
        scrollCollapse: !childRow,
      });

    const dataTable = (this._dataTable = $(document.createElement('table'))
      .addClass('wdk-DataTable')
      .width(width || '')
      .appendTo(this.node)
      // click handler for expand single row
      .on('click keydown', '.wdk-DataTableRow__expandable', (event) => {
        // ignore keydown events if the key is not Enter
        if (event.type === 'keydown' && event.key !== 'Enter') {
          return;
        }

        let tr = event.currentTarget;

        // ignore event if a link, button, or input element is clicked
        if (
          containsAncestorNode(
            event.target,
            (node) => $(node).is('a,:button,:input'),
            tr
          )
        ) {
          return;
        }

        // ignore event if text has been selected
        const selection = window.getSelection();
        if (
          selection &&
          selection.toString() &&
          containsAncestorNode(
            selection.anchorNode,
            (currNode) => currNode.parentNode === tr
          )
        ) {
          return;
        }

        let row = dataTable.row(tr);
        if (row.child.isShown()) {
          this._hideChildRow(dataTable, row.node() as HTMLTableRowElement);
        } else {
          this._renderChildRow(dataTable, row.node() as HTMLTableRowElement);
        }
        this._updateChildRowClassNames(dataTable);
        this._callExpandedRowsCallback(dataTable);
      })
      // click handler for expand all rows
      .on('click', 'th .wdk-DataTableCellExpand', () => {
        // if all are shown, then hide all, otherwise show any that are hidden
        let allShown = areAllChildRowsShown(dataTable);
        for (let tr of dataTable.rows().nodes().toArray()) {
          if (allShown) this._hideChildRow(dataTable, tr);
          else this._renderChildRow(dataTable, tr);
        }
        this._updateChildRowClassNames(dataTable);
        this._callExpandedRowsCallback(dataTable);
      })
      .on('order.dt', () => {
        if (
          this._isRedrawing ||
          !this.props.onSortingChange ||
          !this._dataTable
        )
          return;

        let sorting = this._dataTable.order().map((entry) => ({
          name: columns[entry[0] as number].data as string,
          direction: (entry[1] as string).toUpperCase() as 'ASC' | 'DESC',
        }));
        this.props.onSortingChange(sorting);
      })
      .on('draw.dt', (e) => {
        this.props.onDraw?.(e.target as HTMLTableElement);
      })
      .DataTable(tableOpts as any));

    if (searchable && initialSearchTerm) {
      this._updateSearch(dataTable, initialSearchTerm, []);
    }

    if (childRow != null) {
      this._dataTable.draw();
      this._updateExpandedRows(dataTable);
    }
  }

  _updateSearch(
    dataTable: DataTables.Api,
    searchTerm: string,
    indexesOfSelectedFilters: number[]
  ) {
    // reset search criteria to sync state/props with the jquery table render
    dataTable.columns().search('');
    const queryTerms = parseSearchQueryString(searchTerm);
    const searchTermRegex = areTermsInStringRegexString(queryTerms);
    if (!indexesOfSelectedFilters.length) {
      dataTable.search(searchTermRegex, true, false, true).draw();
    } else {
      dataTable
        .columns(indexesOfSelectedFilters)
        .search(searchTermRegex, true, false, true)
        .draw();
    }
    /** set row count after .draw() for correct count */
    this.setState((state) => ({
      ...state,
      numberOfRowsVisible: dataTable.page.info().recordsDisplay,
    }));
  }

  _updateSorting(dataTable: DataTables.Api) {
    dataTable.order(formatSorting(this.columns, this.props.sorting));
  }

  _updateWidth(dataTable: DataTables.Api) {
    $(dataTable.table('').node()).width(this.props.width || '');
    dataTable.columns.adjust();
  }

  _updateExpandedRows(dataTable: DataTables.Api) {
    let { getRowId, expandedRows = [] } = this.props;

    dataTable.rows().every((index) => {
      let row = dataTable.row(index);
      let tr = row.node() as HTMLTableRowElement;
      let data = row.data() as Row;
      if (expandedRows.includes(getRowId(data))) {
        this._renderChildRow(dataTable, tr);
      } else {
        this._hideChildRow(dataTable, tr);
      }
    });
    this._updateChildRowClassNames(dataTable);
  }

  /** Update class names of child row expand buttons based on datatable state */
  _updateChildRowClassNames(dataTable: DataTables.Api) {
    let allShown = true;
    for (let tr of dataTable.rows().nodes().toArray()) {
      let row = dataTable.row(tr);
      let isShown = Boolean(row.child.isShown());
      $(tr).toggleClass('wdk-DataTableRow__expanded', isShown);
      allShown = allShown && isShown;
    }
    $(dataTable.table('').node())
      .find('th .wdk-DataTableCellExpand')
      .closest('tr')
      .toggleClass('wdk-DataTableRow__expanded', allShown);
  }

  /** Append child row container node to table row and show it */
  _renderChildRow(
    dataTable: DataTables.Api,
    tableRowNode: HTMLTableRowElement,
    openRow = true
  ) {
    let { childRow } = this.props;
    if (childRow == null) return;
    let row = dataTable.row(tableRowNode);
    let childRowContainer = this._getChildRowContainer(tableRowNode);
    if (row.child() == null) row.child(childRowContainer);
    if (openRow && !row.child.isShown()) {
      row.child.show();
      tableRowNode.setAttribute('aria-expanded', 'true');
    }
    if (typeof childRow === 'string') {
      childRowContainer.innerHTML = childRow;
    } else {
      let props = { rowIndex: row.index(), rowData: row.data() };
      this.setState((state) => ({
        ...state,
        childRows: uniqBy(
          [...state.childRows, [childRowContainer, props]],
          ([node]) => node
        ),
      }));
    }
  }

  /** Hide child row */
  _hideChildRow(dataTable: DataTables.Api, tableRowNode: HTMLTableRowElement) {
    let row = dataTable.row(tableRowNode);
    row.child.hide();
    tableRowNode.setAttribute('aria-expanded', 'false');
  }

  _callExpandedRowsCallback(dataTable: DataTables.Api) {
    let { onExpandedRowsChange } = this.props;
    if (onExpandedRowsChange == null) return;

    let expandedRows = dataTable
      .rows()
      .indexes()
      .toArray()
      .reduce((expandedRows, index) => {
        let row = dataTable.row(index);
        if (row.child.isShown()) {
          expandedRows.push(this.props.getRowId(row.data() as Row));
        }
        return expandedRows;
      }, []);
    onExpandedRowsChange(expandedRows);
  }

  /** Get child row container from cache, or create and add to cache first */
  _getChildRowContainer(tableRowNode: HTMLTableRowElement) {
    if (!this._childRowContainers.has(tableRowNode)) {
      const container = document.createElement('div');
      container.id = uniqueId('DataTableChildRow');
      tableRowNode.setAttribute('aria-controls', container.id);
      this._childRowContainers.set(tableRowNode, container);
    }
    return this._childRowContainers.get(tableRowNode) as HTMLElement;
  }

  /** Unmount all child row components and destroy the datatable instance */
  _destroy(dataTable: DataTables.Api) {
    dataTable.destroy(true);
    this._childRowContainers.clear();
  }

  onColumnFilterChange(value: string[]) {
    this.setState((state) => ({
      ...state,
      selectedColumnFilters: value,
    }));
  }

  toggleFilterFieldSelector() {
    this.setState((state) => ({
      ...state,
      showFieldSelector: !state.showFieldSelector,
    }));
  }

  render() {
    let { searchable = true, childRow: ChildRow, columns } = this.props;
    const filterAttributes = columns
      .filter((col) => col.isDisplayable)
      .map((col) => ({ display: col.displayName, value: col.name }));
    return (
      <div className="MesaComponent">
        {searchable && (
          <>
            <div style={{ display: 'flex' }}>
              <RealTimeSearchBox
                searchTerm={this.props.searchTerm ?? this._searchTerm}
                className="wdk-DataTableSearchBox"
                placeholderText="Search this table..."
                onSearchTermChange={(searchTerm: string) => {
                  // _updateSearch is called in componentDidUpdate when props.searchTerm changes
                  this.props.onSearchTermChange?.(searchTerm);

                  if (this.props.searchTerm != null) {
                    this._searchTerm = '';
                  } else {
                    this._searchTerm = searchTerm;
                    // JM: unclear if this is used, but _updateSearch will be called when props.searchTerm does not exist
                    this._dataTable &&
                      this._updateSearch(
                        this._dataTable,
                        searchTerm,
                        this.state.selectedColumnFilters.map((colFilter) =>
                          this.props.columns.findIndex(
                            (col) => col.name === colFilter
                          )
                        )
                      );
                  }
                }}
                delayMs={0}
                iconName=""
                cancelBtnRightMargin="3em"
              />
              <div
                style={{
                  position: 'relative',
                  width: 0,
                  right: '2.75em',
                  top: '0.25em',
                }}
              >
                <Tooltip content="Show search fields">
                  <button
                    className="fa fa-caret-down"
                    style={{ background: 'none', border: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      this.toggleFilterFieldSelector();
                    }}
                  />
                </Tooltip>
              </div>
              <HelpIcon>
                <div>
                  <ul>
                    <li>
                      The data sets in your refined list will contain ALL your
                      terms (or phrases, when using double quotes), in ANY of
                      the selected fields.
                    </li>
                    <li>
                      Click on the arrow inside the box to select/unselect
                      fields.{' '}
                    </li>
                    <li>
                      Your terms are matched at the start; for example, the term{' '}
                      <i>typ</i> will match{' '}
                      <i>
                        <u>typ</u>ically
                      </i>{' '}
                      and{' '}
                      <i>
                        <u>typ</u>e
                      </i>
                      , but <strong>not</strong>{' '}
                      <i>
                        <u>atyp</u>ical
                      </i>
                      .
                    </li>
                    <li>
                      Your terms may include * wildcards; for example, the term{' '}
                      <i>*typ</i> will match{' '}
                      <i>
                        <u>typ</u>ically
                      </i>
                      ,{' '}
                      <i>
                        <u>typ</u>e
                      </i>
                      , and{' '}
                      <i>
                        a<u>typ</u>ical
                      </i>
                      .
                    </li>
                  </ul>
                </div>
              </HelpIcon>
              <div className="wdk-DataTableCountsContainer">
                <span>
                  <strong>
                    {this.state.numberOfRowsVisible ?? this.props.data.length}
                  </strong>{' '}
                  rows
                </span>{' '}
                {(this.state.numberOfRowsVisible === 0 ||
                  this.state.numberOfRowsVisible) &&
                  this.state.numberOfRowsVisible < this.props.data.length && (
                    <span className="MesaComponent faded">
                      (filtered from a total of {this.props.data.length})
                    </span>
                  )}
              </div>
            </div>
            {this.state.showFieldSelector && (
              <DataTableFilterSelector
                filterAttributes={filterAttributes}
                selectedColumnFilters={this.state.selectedColumnFilters}
                onColumnFilterChange={this.onColumnFilterChange}
                toggleFilterFieldSelector={this.toggleFilterFieldSelector}
                containerClassName="wdk-Answer-filterFieldSelector"
              />
            )}
          </>
        )}
        <div
          ref={(node) => (this.node = node)}
          className="wdk-DataTableContainer"
        />
        {this.state.childRows.map(
          ([node, childRowProps]) =>
            ChildRow &&
            createPortal(
              <ErrorBoundary
                renderError={() => <h3>We're sorry, something went wrong.</h3>}
              >
                <ChildRow {...childRowProps} />
              </ErrorBoundary>,
              node
            )
        )}
      </div>
    );
  }
}

const withLibs = lazy<Props>(async function () {
  // @ts-ignore
  await import('!!script-loader!../../../vendored/datatables');
  // @ts-ignore
  // prettier-ignore
  await import('!!script-loader!../../../vendored/datatables-natural-type-plugin');
});
export default wrappable(withLibs(DataTable));

// helpers
// -------

/** helper to determine if all child rows are visible */
function areAllChildRowsShown(dataTable: DataTables.Api) {
  return dataTable
    .rows()
    .indexes()
    .toArray()
    .every((i: number) => !!dataTable.row(i).child.isShown());
}

/** Map WDK table attribute fields to datatable data format */
function formatColumns(columns: ColumnDef[]): DataTables.ColumnSettings[] {
  return columns.map((column) => ({
    data: column.name,
    className: 'wdk-DataTableCell wdk-DataTableCell__' + column.name,
    title: column.displayName || column.name,
    type: column.sortType || 'natural-ci',
    visible: column.isDisplayable,
    searchable: column.isDisplayable,
    orderable: column.isSortable,
    render(data: any, type: string) {
      let value = formatAttributeValue(data);
      if (type === 'display' && value != null) {
        return '<div class="wdk-DataTableCellContent">' + value + '</div>';
      }
      return value || '';
    },
  }));
}

/** Map WDK table sorting to datatable data format */
function formatSorting(
  columns: DataTables.ColumnSettings[],
  sorting: SortingDef[] = []
) {
  return sorting.length === 0
    ? [[0, 'asc']]
    : sorting.map((sort) => {
        let index = columns.findIndex((column) => column.data === sort.name);
        if (index === -1) {
          console.warn(
            'Could not determine sort index for the column ' + sort.name
          );
          return [];
        }
        return [index, sort.direction.toLowerCase()];
      });
}

/** Return boolean indicating if a prop's value has changed. */
function didPropChange(
  component: Component<Props, any>,
  prevProps: Props,
  propName: keyof Props
) {
  return !isEqual(component.props[propName], prevProps[propName]);
}

/** Return boolean indicating if a state's value has changed. */
function didStateChange(
  component: Component<Props, State>,
  prevState: State,
  stateName: keyof State
) {
  return !isEqual(component.state[stateName], prevState[stateName]);
}

type DataFilterAttribute = {
  value: string;
  display: string;
};

type DataTableProps = {
  filterAttributes: DataFilterAttribute[];
  selectedColumnFilters: DataFilterAttribute['value'][];
  onColumnFilterChange: (value: DataFilterAttribute['value'][]) => void;
  toggleFilterFieldSelector: () => void;
  containerClassName: string;
};

function DataTableFilterSelector({
  filterAttributes,
  selectedColumnFilters,
  onColumnFilterChange,
  toggleFilterFieldSelector,
  containerClassName,
}: DataTableProps) {
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      toggleFilterFieldSelector();
    }
  };

  const handleDocumentClick = (e: MouseEvent) => {
    const clickedElement = e.target as HTMLElement;
    if (!clickedElement.closest(`.${containerClassName}`)) {
      toggleFilterFieldSelector();
    }
  };

  return (
    <TabbableContainer
      autoFocus
      onKeyDown={handleKeyPress}
      className={containerClassName}
    >
      <CheckboxList
        items={filterAttributes}
        // must ensure referential equality, thus unable to simply pass in selectedColumnFilters as the value prop
        value={filterAttributes
          .filter((attr) => selectedColumnFilters.includes(attr.value))
          .map((attr) => attr.value)}
        onChange={onColumnFilterChange}
        linksPosition={LinksPosition.Top}
      />
      <div className="wdk-Answer-filterFieldSelectorCloseIconWrapper">
        <button
          className="fa fa-close wdk-Answer-filterFieldSelectorCloseIcon"
          onClick={toggleFilterFieldSelector}
        />
      </div>
    </TabbableContainer>
  );
}
