import React from 'react';

import DataCell from './DataCell';
import SelectionCell from './SelectionCell';
import ExpansionCell from './ExpansionCell';
import { makeClassifier } from '../Utils/Utils';
import { MesaStateProps } from '../types';

const dataRowClass = makeClassifier('DataRow');

const EXTRA_COLUMNS_FOR_EXPAND_AND_SELECT = 2;
const EXTRA_COLUMNS_FOR_EXPAND = 1;

interface DataRowProps<Row extends Record<PropertyKey, any>, Key = string>
  extends MesaStateProps<Row, Key> {
  row: Row;
  rowIndex: number;
}

interface DataRowState {
  expanded: boolean;
}

class DataRow<
  Row extends Record<PropertyKey, any>,
  Key = string
> extends React.PureComponent<DataRowProps<Row, Key>, DataRowState> {
  constructor(props: DataRowProps<Row, Key>) {
    super(props);
    this.state = { expanded: false };
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleRowMouseOver = this.handleRowMouseOver.bind(this);
    this.handleRowMouseOut = this.handleRowMouseOut.bind(this);
    this.expandRow = this.expandRow.bind(this);
    this.collapseRow = this.collapseRow.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentWillReceiveProps(newProps: DataRowProps<Row, Key>): void {
    const { row } = this.props;
    if (newProps.row !== row) this.collapseRow();
  }

  expandRow(): void {
    const { options } = this.props;
    if (!options || !options.inline || options.inlineUseTooltips) return;
    this.setState({ expanded: true });
  }

  collapseRow(): void {
    const { options } = this.props;
    if (!options || !options.inline || options.inlineUseTooltips) return;
    this.setState({ expanded: false });
  }

  handleRowClick(): void {
    const { row, rowIndex, options } = this.props;
    if (!options) return;
    const { inline, onRowClick, inlineUseTooltips } = options;
    if (!inline && !onRowClick) return;
    if (inline && !inlineUseTooltips)
      this.setState({ expanded: !this.state.expanded });
    if (typeof onRowClick === 'function') onRowClick(row, rowIndex);
  }

  handleRowMouseOver(): void {
    const { row, rowIndex, options } = this.props;
    if (!options) return;
    const { onRowMouseOver } = options;

    if (typeof onRowMouseOver === 'function') {
      onRowMouseOver(row, rowIndex);
    }
  }

  handleRowMouseOut(): void {
    const { row, rowIndex, options } = this.props;
    if (!options) return;
    const { onRowMouseOut } = options;

    if (typeof onRowMouseOut === 'function') {
      onRowMouseOut(row, rowIndex);
    }
  }

  render() {
    const { row, rowIndex, columns, options, eventHandlers, uiState } =
      this.props;
    const { expanded } = this.state;
    const { columnDefaults, childRow, getRowId } = options ?? {};
    const inline = options && options.inline ? !expanded : false;

    const selectionProps =
      options &&
      eventHandlers &&
      typeof options.isRowSelected === 'function' &&
      typeof eventHandlers.onRowSelect === 'function' &&
      typeof eventHandlers.onRowDeselect === 'function'
        ? {
            isRowSelected: options.isRowSelected,
            options,
            eventHandlers,
          }
        : null;

    const hasSelectionColumn = selectionProps != null;

    const expansionProps =
      childRow != null &&
      eventHandlers?.onExpandedRowsChange != null &&
      uiState?.expandedRows != null &&
      getRowId != null
        ? {
            onExpandedRowsChange: eventHandlers.onExpandedRowsChange,
            expandedRows: uiState.expandedRows,
            getRowId: getRowId,
          }
        : null;

    const hasExpansionColumn = expansionProps != null;

    const showChildRow =
      hasExpansionColumn &&
      uiState &&
      uiState.expandedRows &&
      getRowId &&
      uiState.expandedRows.includes(getRowId(row));
    const childRowColSpan =
      columns.length +
      (hasSelectionColumn
        ? EXTRA_COLUMNS_FOR_EXPAND_AND_SELECT
        : EXTRA_COLUMNS_FOR_EXPAND);

    const rowStyle = !inline
      ? {}
      : { whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis' as const };
    let className = dataRowClass(undefined, inline ? 'inline' : '');

    const { deriveRowClassName } = options || {};
    if (typeof deriveRowClassName === 'function') {
      let derivedClassName = deriveRowClassName(row);
      className +=
        typeof derivedClassName === 'string' ? ' ' + derivedClassName : '';
    }

    const sharedProps = { row, inline, options, rowIndex };

    return (
      <>
        <tr
          id={getRowId ? 'row_id_' + getRowId(row) : undefined}
          className={className
            .concat(showChildRow ? ' _childIsExpanded' : '')
            .concat(hasExpansionColumn ? ' _isExpandable' : '')}
          tabIndex={this.props.options?.onRowClick ? -1 : undefined}
          style={rowStyle}
          onClick={this.handleRowClick}
          onMouseOver={this.handleRowMouseOver}
          onMouseOut={this.handleRowMouseOut}
        >
          {expansionProps && (
            <ExpansionCell
              key="_expansion"
              rows={[]}
              row={row}
              {...expansionProps}
              inert={false}
              heading={false}
            />
          )}
          {selectionProps && (
            <SelectionCell key="_selection" row={row} {...selectionProps} />
          )}
          {columns.map((column, columnIndex) => {
            let finalColumn = column;
            if (typeof columnDefaults === 'object')
              finalColumn = Object.assign({}, columnDefaults, column);
            return (
              <DataCell
                key={`${column.key}-${columnIndex}`}
                column={finalColumn}
                columnIndex={columnIndex}
                {...sharedProps}
              />
            );
          })}
        </tr>
        {showChildRow && (
          <tr
            className={className + ' _isExpandable'}
            tabIndex={this.props.options?.onRowClick ? -1 : undefined}
            style={rowStyle}
            onClick={this.handleRowClick}
            onMouseOver={this.handleRowMouseOver}
            onMouseOut={this.handleRowMouseOut}
          >
            <DataCell
              key={`childRow-${rowIndex}`}
              column={{
                style: {},
                width: undefined,
                className: '',
                key: 'childRow-test' as unknown as Key,
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

export default DataRow;
