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
    this.state = { dynamicWidths: null };
    this.renderPlainTable = this.renderPlainTable.bind(this);
    this.renderStickyTable = this.renderStickyTable.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getInnerCellWidth = this.getInnerCellWidth.bind(this);
    this.hasSelectionColumn = this.hasSelectionColumn.bind(this);
    this.shouldUseStickyHeader = this.shouldUseStickyHeader.bind(this);
    this.handleTableBodyScroll = this.handleTableBodyScroll.bind(this);
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
  }

  componentDidUpdate(prevProps) {
    if (this.props && this.props.columns && this.props.columns !== prevProps.columns)
      this.setState({ dynamicWidths: null }, () => this.setDynamicWidths()); // eslint-disable-line react/no-did-update-set-state
  }

  setDynamicWidths () {
    const { columns } = this.props;
    const hasSelectionColumn = this.hasSelectionColumn();
    const { headingTable, contentTable, getInnerCellWidth } = this;
    if (!headingTable || !contentTable) return;
    const headingCells = Array.from(headingTable.getElementsByTagName('th'));
    const contentCells = Array.from(contentTable.getElementsByTagName('td'));

    if (hasSelectionColumn) {
      headingCells.shift();
      contentCells.shift();
    }
    const dynamicWidths = columns.map((c, i) => getInnerCellWidth(contentCells[i], headingCells[i], c) - (hasSelectionColumn && !i ? 1 : 0));
    this.setState({ dynamicWidths }, () => {
      window.dispatchEvent(new CustomEvent('MesaReflow'));
    });
  }

  getInnerCellWidth (cell, headingCell, { key }) {
    if (key && key in this.widthCache) return this.widthCache[key];

    const contentWidth = cell.clientWidth;
    const headingWidth = headingCell.clientWidth;
    const higher = Math.max(contentWidth, headingWidth);
    return this.widthCache[key] = higher;
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
    const { dynamicWidths } = this.state;
    const newColumns = columns.every(({ width }) => width) || !dynamicWidths || dynamicWidths.length == 0
      ? columns
      : columns.map((column, index) => Object.assign({}, column, { width: dynamicWidths[index] }));
    const maxHeight = { maxHeight: options ? options.tableBodyMaxHeight : null };
    const maxWidth = { minWidth: dynamicWidths ? combineWidths(columns.map(({ width }) => width)) : null };
    const tableLayout = { tableLayout: dynamicWidths ? 'fixed' : 'auto' };
    const tableProps = { options, rows, filteredRows, actions, eventHandlers, uiState, columns: newColumns };
    return (
      <div className="MesaComponent">
        <div className={dataTableClass()} style={maxWidth}>
          <div className={dataTableClass('Sticky')} style={maxWidth}>
            <div
              ref={node => this.headerNode = node}
              className={dataTableClass('Header')}>
              <table
                cellSpacing={0}
                cellPadding={0}
                style={tableLayout}
                ref={node => this.headingTable = node}>
                <HeadingRow {...tableProps} />
              </table>
            </div>
            <div
              style={maxHeight}
              ref={node => this.bodyNode = node}
              className={dataTableClass('Body')}
              onScroll={this.handleTableBodyScroll}>
              <table
                cellSpacing={0}
                cellPadding={0}
                style={tableLayout}
                ref={node => this.contentTable = node}>
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
