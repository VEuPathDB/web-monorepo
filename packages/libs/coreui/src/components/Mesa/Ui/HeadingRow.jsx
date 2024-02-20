import React from 'react';
import ExpansionCell from './ExpansionCell';

import HeadingCell from './HeadingCell';
import SelectionCell from './SelectionCell';

class HeadingRow extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      filteredRows,
      options,
      columns,
      actions,
      uiState,
      eventHandlers,
      offsetLeft,
    } = this.props;
    const { isRowSelected, columnDefaults, childRow } = options ? options : {};
    const { sort, expandedRows } = uiState ? uiState : {};
    const { onRowSelect, onRowDeselect, onExpandedRowsChange } = eventHandlers
      ? eventHandlers
      : {};
    const hasSelectionColumn = [
      isRowSelected,
      onRowSelect,
      onRowDeselect,
    ].every((fn) => typeof fn === 'function');

    const hasExpansionColumn = [
      childRow,
      expandedRows,
      onExpandedRowsChange,
    ].every((prop) => prop != null);

    const rowCount = columns.reduce((count, column) => {
      const thisCount = Array.isArray(column.renderHeading)
        ? column.renderHeading.length
        : 1;
      return Math.max(thisCount, count);
    }, 1);

    const headingRows = new Array(rowCount).fill({}).map((blank, index) => {
      const isFirstRow = !index;
      const cols = columns.map((col) => {
        const output = Object.assign({}, col);
        if (Array.isArray(col.renderHeading)) {
          output.renderHeading =
            col.renderHeading.length > index ? col.renderHeading[index] : false;
        } else if (!isFirstRow) {
          output.renderHeading = false;
        }
        return output;
      });
      return { cols, isFirstRow };
    });

    return (
      <thead>
        {headingRows.map(({ cols, isFirstRow }, index) => {
          return (
            <tr className="Row HeadingRow" key={index}>
              {hasSelectionColumn ? (
                <SelectionCell
                  inert={!isFirstRow}
                  heading={true}
                  key="_selection"
                  rows={filteredRows}
                  options={options}
                  eventHandlers={eventHandlers}
                  isRowSelected={isRowSelected}
                />
              ) : hasExpansionColumn ? (
                <ExpansionCell
                  inert={!isFirstRow}
                  heading={true}
                  key="_expansion"
                  rows={filteredRows}
                  childRow={childRow}
                  onExpandedRowsChange={onExpandedRowsChange}
                  expandedRows={expandedRows}
                />
              ) : null}
              {cols.map((column, columnIndex) => {
                if (typeof columnDefaults === 'object')
                  column = Object.assign({}, columnDefaults, column);
                return (
                  <HeadingCell
                    sort={sort}
                    key={`${column.key}-${columnIndex}`}
                    primary={isFirstRow}
                    column={column}
                    headingRowIndex={index}
                    offsetLeft={offsetLeft}
                    columnIndex={columnIndex}
                    eventHandlers={eventHandlers}
                  />
                );
              })}
            </tr>
          );
        })}
      </thead>
    );
  }
}

export default HeadingRow;
