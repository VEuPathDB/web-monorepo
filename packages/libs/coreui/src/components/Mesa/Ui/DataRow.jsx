import React from 'react';
import PropTypes from 'prop-types';

import DataCell from './DataCell';
import SelectionCell from './SelectionCell';
import ExpansionCell from './ExpansionCell';
import { makeClassifier } from '../Utils/Utils';

const dataRowClass = makeClassifier('DataRow');

const EXTRA_COLUMNS_FOR_EXPAND_AND_SELECT = 2;
const EXTRA_COLUMNS_FOR_EXPAND = 1;

class DataRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleRowMouseOver = this.handleRowMouseOver.bind(this);
    this.handleRowMouseOut = this.handleRowMouseOut.bind(this);
    this.expandRow = this.expandRow.bind(this);
    this.collapseRow = this.collapseRow.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { row } = this.props;
    if (newProps.row !== row) this.collapseRow();
  }

  expandRow() {
    const { options } = this.props;
    if (!options.inline || options.inlineUseTooltips) return;
    this.setState({ expanded: true });
  }

  collapseRow() {
    const { options } = this.props;
    if (!options.inline || options.inlineUseTooltips) return;
    this.setState({ expanded: false });
  }

  handleRowClick() {
    const { row, rowIndex, options } = this.props;
    const { inline, onRowClick, inlineUseTooltips } = options;
    if (!inline && !onRowClick) return;
    if (inline && !inlineUseTooltips)
      this.setState({ expanded: !this.state.expanded });
    if (typeof onRowClick === 'function') onRowClick(row, rowIndex);
  }

  handleRowMouseOver() {
    const { row, rowIndex, options } = this.props;
    const { onRowMouseOver } = options;

    if (typeof onRowMouseOver === 'function') {
      onRowMouseOver(row, rowIndex);
    }
  }

  handleRowMouseOut() {
    const { row, rowIndex, options } = this.props;
    const { onRowMouseOut } = options;

    if (typeof onRowMouseOut === 'function') {
      onRowMouseOut(row, rowIndex);
    }
  }

  render() {
    const { row, rowIndex, columns, options, eventHandlers, uiState } =
      this.props;
    const { expanded } = this.state;
    const { columnDefaults, childRow, getRowId } = options ? options : {};
    const inline = options.inline ? !expanded : false;

    const hasSelectionColumn =
      typeof options.isRowSelected === 'function' &&
      typeof eventHandlers.onRowSelect === 'function' &&
      typeof eventHandlers.onRowDeselect === 'function';

    const hasExpansionColumn =
      childRow != null &&
      eventHandlers?.onExpandedRowsChange != null &&
      uiState?.expandedRows != null &&
      getRowId != null;

    const showChildRow =
      hasExpansionColumn && uiState.expandedRows.includes(getRowId(row));
    const childRowColSpan =
      columns.length +
      (hasSelectionColumn
        ? EXTRA_COLUMNS_FOR_EXPAND_AND_SELECT
        : EXTRA_COLUMNS_FOR_EXPAND);

    const rowStyle = !inline
      ? {}
      : { whiteSpace: 'nowrap', textOverflow: 'ellipsis' };
    let className = dataRowClass(null, inline ? 'inline' : '');

    const { deriveRowClassName } = options;
    if (typeof deriveRowClassName === 'function') {
      let derivedClassName = deriveRowClassName(row);
      className +=
        typeof derivedClassName === 'string' ? ' ' + derivedClassName : '';
    }

    const sharedProps = { row, inline, options, rowIndex };

    return (
      <>
        <tr
          className={className
            .concat(showChildRow ? ' _childIsExpanded' : '')
            .concat(hasExpansionColumn ? ' _isExpandable' : '')}
          tabIndex={this.props.options.onRowClick ? -1 : undefined}
          style={rowStyle}
          onClick={this.handleRowClick}
          onMouseOver={this.handleRowMouseOver}
          onMouseOut={this.handleRowMouseOut}
        >
          {hasExpansionColumn && (
            <ExpansionCell
              key="_expansion"
              row={row}
              onExpandedRowsChange={eventHandlers.onExpandedRowsChange}
              expandedRows={uiState.expandedRows}
              getRowId={getRowId}
            />
          )}
          {hasSelectionColumn && (
            <SelectionCell
              key="_selection"
              row={row}
              eventHandlers={eventHandlers}
              isRowSelected={options.isRowSelected}
            />
          )}
          {columns.map((column, columnIndex) => {
            if (typeof columnDefaults === 'object')
              column = Object.assign({}, columnDefaults, column);
            return (
              <DataCell
                key={`${column.key}-${columnIndex}`}
                column={column}
                columnIndex={columnIndex}
                {...sharedProps}
              />
            );
          })}
        </tr>
        {showChildRow && (
          <tr
            className={className + ' _isExpandable'}
            tabIndex={this.props.options.onRowClick ? -1 : undefined}
            style={rowStyle}
            onClick={this.handleRowClick}
            onMouseOver={this.handleRowMouseOver}
            onMouseOut={this.handleRowMouseOut}
          >
            <DataCell
              key={`childRow-${rowIndex}`}
              column={{
                style: {},
                width: null,
                className: '',
                key: 'childRow-test',
              }}
              columnIndex={null}
              isChildRow={true}
              childRowColSpan={childRowColSpan}
              {...sharedProps}
            />
          </tr>
        )}
      </>
    );
  }
}

DataRow.propTypes = {
  row: PropTypes.object.isRequired,
  rowIndex: PropTypes.number.isRequired,
  columns: PropTypes.array.isRequired,

  options: PropTypes.object,
  actions: PropTypes.array,
  eventHandlers: PropTypes.object,
};

export default DataRow;
