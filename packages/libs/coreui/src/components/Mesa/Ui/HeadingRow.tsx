import React, { ReactNode } from 'react';
import ExpansionCell from './ExpansionCell';

import HeadingCell from './HeadingCell';
import SelectionCell from './SelectionCell';
import { MesaStateProps, MesaColumn } from '../types';

interface HeadingRowProps<Row, Key = string>
  extends Pick<
    MesaStateProps<Row, Key>,
    'columns' | 'uiState' | 'eventHandlers' | 'options' | 'actions'
  > {
  filteredRows: Row[];
  offsetLeft?: number;
}

interface ColumnDefaults {
  [key: string]: any;
}

type HeadingRowColumn<Row, Key = string> = MesaColumn<Row, Key> & {
  renderHeading?:
    | boolean
    | ((
        column: MesaColumn<Row, Key>,
        columnIndex: number,
        components: any
      ) => ReactNode)
    | ReactNode[];
};

class HeadingRow<Row, Key = string> extends React.PureComponent<
  HeadingRowProps<Row, Key>
> {
  render() {
    const {
      filteredRows,
      options,
      columns,
      uiState,
      eventHandlers,
      offsetLeft,
    } = this.props;
    const { isRowSelected, columnDefaults, childRow, getRowId } = options ?? {};
    const { sort, expandedRows } = uiState ?? {};
    const { onRowSelect, onRowDeselect, onExpandedRowsChange } =
      eventHandlers ?? {};
    const hasSelectionColumn = [
      isRowSelected,
      onRowSelect,
      onRowDeselect,
    ].every((fn) => typeof fn === 'function');

    const hasExpansionColumn =
      childRow != null &&
      onExpandedRowsChange != null &&
      expandedRows != null &&
      getRowId != null;

    const rowCount = columns.reduce((count, column) => {
      const col = column as HeadingRowColumn<Row, Key>;
      const thisCount = Array.isArray(col.renderHeading)
        ? col.renderHeading.length
        : 1;
      return Math.max(thisCount, count);
    }, 1);

    const headingRows = new Array(rowCount).fill({}).map((blank, index) => {
      const isFirstRow = !index;
      const cols = columns.map((col) => {
        const column = col as HeadingRowColumn<Row, Key>;
        const output: any = { ...column };
        if (Array.isArray(column.renderHeading)) {
          output.renderHeading =
            column.renderHeading.length > index
              ? column.renderHeading[index]
              : false;
        } else if (!isFirstRow) {
          output.renderHeading = false;
        }
        return output as HeadingRowColumn<Row, Key>;
      });
      return { cols, isFirstRow };
    });

    return (
      <thead>
        {headingRows.map(({ cols, isFirstRow }, index) => {
          return (
            <tr className="Row HeadingRow" key={index}>
              {hasExpansionColumn && (
                <ExpansionCell
                  inert={!isFirstRow}
                  heading={true}
                  key="_expansion"
                  rows={filteredRows}
                  row={filteredRows[0]}
                  getRowId={getRowId as any}
                  onExpandedRowsChange={onExpandedRowsChange}
                  expandedRows={expandedRows}
                />
              )}
              {hasSelectionColumn && isRowSelected && (
                <SelectionCell
                  inert={!isFirstRow}
                  heading={true}
                  key="_selection"
                  rows={filteredRows}
                  options={options as any}
                  eventHandlers={eventHandlers as any}
                  isRowSelected={isRowSelected}
                />
              )}
              {cols.map((column, columnIndex) => {
                let mergedColumn = column;
                if (typeof columnDefaults === 'object')
                  mergedColumn = { ...columnDefaults, ...column };
                return (
                  <HeadingCell
                    sort={sort as any}
                    key={`${String(mergedColumn.key)}-${columnIndex}`}
                    primary={isFirstRow}
                    column={mergedColumn}
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
