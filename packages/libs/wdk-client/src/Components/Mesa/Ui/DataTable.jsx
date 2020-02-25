import { debounce } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import HeadingRow from 'wdk-client/Components/Mesa/Ui/HeadingRow';
import DataRowList from 'wdk-client/Components/Mesa/Ui/DataRowList';
import { makeClassifier, combineWidths } from 'wdk-client/Components/Mesa/Utils/Utils';

const dataTableClass = makeClassifier('DataTable');

class DataTable extends React.Component {
  constructor (props) {
    super(props);
    this.widthCache = {};
    this.state = { dynamicWidths: null, tableWrapperWidth: null };
    this.renderPlainTable = this.renderPlainTable.bind(this);
    this.renderStickyTable = this.renderStickyTable.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getInnerCellWidth = this.getInnerCellWidth.bind(this);
    this.hasSelectionColumn = this.hasSelectionColumn.bind(this);
    this.shouldUseStickyHeader = this.shouldUseStickyHeader.bind(this);
    this.handleTableBodyScroll = this.handleTableBodyScroll.bind(this);
    this.setDynamicWidths = this.setDynamicWidths.bind(this);
    this.resizeId = -1;
    this.mainRef = null;
  }

  shouldUseStickyHeader () {
    const { options } = this.props;
    if (!options || !options.useStickyHeader) return false;
    if (!options.tableBodyMaxHeight) return console.error(`
      "useStickyHeader" option enabled but no maxHeight for the table is set.
      Use a css height as the "tableBodyMaxHeight" option to use this setting.
    `);
    return true;
  }

  componentDidMount () {
    this.setDynamicWidths();
    this.attachLoadEventHandlers();
    this.attachResizeHandler();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.rows !== prevProps.rows ||
      this.props.columns.map(c => c.name).toString() !== prevProps.columns.map(c => c.name).toString()
    ) {
      this.setDynamicWidths();
      this.attachLoadEventHandlers();
    }
  }

  componentWillUnmount() {
    this.removeResizeHandler();
  }

  attachLoadEventHandlers() {
    if (this.bodyNode == null) return;
    this.bodyNode.querySelectorAll('img, iframe, object').forEach(node => {
      if (node.complete) return;
      node.addEventListener('load', this.setDynamicWidths);
    });
  }

  attachResizeHandler() {
    this.resizeId = setInterval(() => {
      if (this.mainRef == null || this.cachedWidth === this.mainRef.clientWidth) return;
      this.setDynamicWidths();
      this.cachedWidth = this.mainRef.clientWidth;
    }, 250);
  }

  removeResizeHandler() {
    clearInterval(this.resizeId);
  }

  setDynamicWidths () {
    // noop if rows or filteredRows is empty
    if (this.props.rows.length === 0 || this.props.filteredRows.length === 0) return;

    this.setState({ dynamicWidths: null, tableWrapperWidth: null }, () => {
      this.widthCache = {};
      const { columns } = this.props;
      const hasSelectionColumn = this.hasSelectionColumn();
      const { contentTable, getInnerCellWidth } = this;
      if (!contentTable) return;
      const contentCells = Array.from(contentTable.querySelectorAll('tbody > tr:first-child > td'));

      if (contentCells.length === 0) {
        return;
      }

      if (hasSelectionColumn) {
        contentCells.shift();
      }

      const dynamicWidths = columns.map((c, i) => getInnerCellWidth(contentCells[i], c) - (hasSelectionColumn && !i ? 1 : 0));
      console.debug('dynamicWidths updating', dynamicWidths);
      this.setState({ dynamicWidths }, () => {
        window.dispatchEvent(new CustomEvent('MesaReflow'));
        const tableWrapperWidth = this.bodyNode && this.bodyNode.clientWidth;
        this.setState({ tableWrapperWidth });
      });
    });
  }

  getInnerCellWidth (cell, { key }) {
    if (key && key in this.widthCache) return this.widthCache[key];
    return this.widthCache[key] = cell.clientWidth;
  }

  hasSelectionColumn () {
    const { options, eventHandlers } = this.props;
    return typeof options.isRowSelected === 'function'
      && typeof eventHandlers.onRowSelect === 'function'
      && typeof eventHandlers.onRowDeselect === 'function';
  }

  handleTableBodyScroll () {
    const offset = this.bodyNode.scrollLeft;
    this.headerNode.scrollLeft = offset;
    window.dispatchEvent(new CustomEvent('MesaScroll'));
  }

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  renderStickyTable () {
    const { options, columns, rows, filteredRows, actions, eventHandlers, uiState } = this.props;
    const { dynamicWidths, tableWrapperWidth } = this.state;
    const newColumns = columns.every(({ width }) => width) || !dynamicWidths || dynamicWidths.length == 0
      ? columns
      : columns.map((column, index) => Object.assign({}, column, { width: dynamicWidths[index] }));
    const bodyWrapperStyle = { maxHeight: options ? options.tableBodyMaxHeight : null };
    const wrapperStyle = { minWidth: dynamicWidths ? combineWidths(columns.map(({ width }) => width)) : null };
    const headerWrapperStyle = { width: tableWrapperWidth, display: dynamicWidths == null ? 'none' : 'block' };
    const tableLayout = { tableLayout: dynamicWidths ? 'fixed' : 'auto' };
    const tableProps = { options, rows, filteredRows, actions, eventHandlers, uiState, columns: newColumns };
    return (
      <div ref={node => this.mainRef = node} className="MesaComponent">
        <div className={dataTableClass()} style={wrapperStyle}>
          <div className={dataTableClass('Sticky')} style={wrapperStyle}>
            <div
              style={headerWrapperStyle}
              ref={node => this.headerNode = node}
              className={dataTableClass('Header')}>
              <table
                cellSpacing={0}
                cellPadding={0}
                style={tableLayout}
              >
                <HeadingRow {...tableProps} />
              </table>
            </div>
            <div
              style={bodyWrapperStyle}
              ref={node => this.bodyNode = node}
              className={dataTableClass('Body')}
              onScroll={this.handleTableBodyScroll}>
              <table
                cellSpacing={0}
                cellPadding={0}
                style={tableLayout}
                ref={node => this.contentTable = node}>
                {dynamicWidths == null ? <HeadingRow {...tableProps} /> : null}
                <DataRowList {...tableProps} />
              </table>
            </div>

          </div>
        </div>
      </div>
    );
  }

  renderPlainTable () {
    const { props } = this;
    return (
      <div className="MesaComponent">
        <div className={dataTableClass()}>
          <table cellSpacing="0" cellPadding="0">
            <HeadingRow {...props} />
            <DataRowList {...props} />
          </table>
        </div>
      </div>
    );
  }

  render () {
    const { shouldUseStickyHeader, renderStickyTable, renderPlainTable } = this;
    return shouldUseStickyHeader() ? renderStickyTable() : renderPlainTable();
  }
}

DataTable.propTypes = {
  rows: PropTypes.array,
  columns: PropTypes.array,
  options: PropTypes.object,
  actions: PropTypes.arrayOf(PropTypes.shape({
    element: PropTypes.oneOfType([ PropTypes.func, PropTypes.node, PropTypes.element ]),
    handler: PropTypes.func,
    callback: PropTypes.func
  })),
  uiState: PropTypes.object,
  eventHandlers: PropTypes.objectOf(PropTypes.func)
};

export default DataTable;
