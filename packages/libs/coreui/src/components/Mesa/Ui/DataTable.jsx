import React from 'react';
import PropTypes from 'prop-types';

import { isEqual, sum } from 'lodash';
import { defaultMemoize } from 'reselect';

import HeadingRow from './HeadingRow';
import DataRowList from './DataRowList';
import { makeClassifier, combineWidths } from '../Utils/Utils';

const dataTableClass = makeClassifier('DataTable');

class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.widthCache = [];
    this.renderStickyTable = this.renderStickyTable.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.hasSelectionColumn = this.hasSelectionColumn.bind(this);
    this.hasExpansionColumn = this.hasExpansionColumn.bind(this);
    this.shouldUseStickyHeader = this.shouldUseStickyHeader.bind(this);
    this.makeFirstNColumnsSticky = this.makeFirstNColumnsSticky.bind(this);
    this.setDynamicWidths = this.setDynamicWidths.bind(this);
    this.resizeId = -1;
    this.mainRef = null;
  }

  shouldUseStickyHeader() {
    const { options } = this.props;
    if (!options || !options.useStickyHeader) return false;
    if (!options.tableBodyMaxHeight)
      return console.error(`
      "useStickyHeader" option enabled but no maxHeight for the table is set.
      Use a css height as the "tableBodyMaxHeight" option to use this setting.
    `);
    return true;
  }

  makeFirstNColumnsSticky(columns, n) {
    const dynamicWidths = this.widthCache;

    if (n <= columns.length) {
      const stickyColumns = columns.slice(0, n).map((column, index) => {
        const leftOffset = dynamicWidths
          ? sum(dynamicWidths.slice(0, index))
          : 0;

        return {
          ...column,
          moveable: false,
          headingStyle: {
            ...column.headingStyle,
            position: 'sticky',
            left: `${leftOffset}px`,
            zIndex: 2,
          },
          style: {
            ...column.style,
            position: 'sticky',
            left: `${leftOffset}px`,
            zIndex: 1,
          },
          className: `${column.className || ''} StickyColumnCell`,
        };
      });

      return [...stickyColumns, ...columns.slice(n)];
    }

    return columns;
  }

  componentDidMount() {
    this.setDynamicWidths();
    this.attachLoadEventHandlers();
    this.attachResizeHandler();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.columns.map((c) => c.name).toString() !==
        prevProps.columns.map((c) => c.name).toString() ||
      !isEqual(this.props.uiState, prevProps.uiState)
    ) {
      this.setDynamicWidths();
      this.attachLoadEventHandlers();
    }
  }

  componentWillUnmount() {
    this.removeResizeHandler();
  }

  attachLoadEventHandlers() {
    if (this.contentTable == null) return;
    this.contentTable
      .querySelectorAll('img, iframe, object')
      .forEach((node) => {
        if (node.complete) return;
        node.addEventListener('load', (event) => {
          const el = event.target.offsetParent || event.target;
          if (el.scrollWidth > el.clientWidth) this.setDynamicWidths();
        });
      });
  }

  attachResizeHandler() {
    this.resizeId = setInterval(() => {
      if (this.mainRef == null || this.cachedWidth === this.mainRef.clientWidth)
        return;
      this.setDynamicWidths();
      this.cachedWidth = this.mainRef.clientWidth;
    }, 250);
  }

  removeResizeHandler() {
    clearInterval(this.resizeId);
  }

  setDynamicWidths() {
    // noop if rows or filteredRows is empty
    if (this.props.rows.length === 0 || this.props.filteredRows.length === 0)
      return;

    this.setState({ dynamicWidths: null }, () => {
      this.widthCache = [];
      const { contentTable } = this;
      if (!contentTable) return;
      const contentCells = Array.from(
        contentTable.querySelectorAll('tbody > tr:first-child > td')
      );

      if (contentCells.length === 0) {
        return;
      }

      this.widthCache = contentCells.map(
        (cell) => cell.getBoundingClientRect().width
      );
    });
  }

  hasExpansionColumn() {
    const { options, eventHandlers } = this.props;
    return (
      typeof options.childRow === 'function' &&
      typeof eventHandlers.onExpandedRowsChange === 'function'
    );
  }

  hasSelectionColumn() {
    const { options, eventHandlers } = this.props;
    return (
      typeof options.isRowSelected === 'function' &&
      typeof eventHandlers.onRowSelect === 'function' &&
      typeof eventHandlers.onRowDeselect === 'function'
    );
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  renderStickyTable() {
    const {
      options,
      columns,
      rows,
      filteredRows,
      actions,
      eventHandlers,
      uiState,
      headerWrapperStyle,
    } = this.props;
    const newColumns = options.useStickyFirstNColumns
      ? this.makeFirstNColumnsSticky(columns, options.useStickyFirstNColumns)
      : columns;
    const wrapperStyle = {
      maxHeight: options ? options.tableBodyMaxHeight : null,
    };
    const tableStyle = {
      tableLayout: 'auto',
    };
    const tableProps = {
      options,
      rows,
      filteredRows,
      actions,
      eventHandlers,
      uiState,
      columns: newColumns,
    };
    return (
      <div ref={(node) => (this.mainRef = node)} className="MesaComponent">
        <div
          className={dataTableClass(null, [
            options.useStickyHeader ? 'Sticky' : undefined,
            options.marginContent ? 'HasMargin' : undefined,
          ])}
          style={wrapperStyle}
        >
          <table
            cellSpacing={0}
            cellPadding={0}
            style={tableStyle}
            ref={(node) => (this.contentTable = node)}
          >
            <HeadingRow {...tableProps} />
            <DataRowList {...tableProps} />
          </table>
          {this.props.options.marginContent && (
            <div className={dataTableClass('Margin')}>
              {this.props.options.marginContent}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    return this.renderStickyTable();
  }
}

DataTable.propTypes = {
  rows: PropTypes.array,
  filteredRows: PropTypes.array,
  headerWrapperStyle: PropTypes.object,
  columns: PropTypes.array,
  options: PropTypes.object,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      element: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.node,
        PropTypes.element,
      ]),
      handler: PropTypes.func,
      callback: PropTypes.func,
    })
  ),
  uiState: PropTypes.object,
  eventHandlers: PropTypes.objectOf(PropTypes.func),
};

export default DataTable;
