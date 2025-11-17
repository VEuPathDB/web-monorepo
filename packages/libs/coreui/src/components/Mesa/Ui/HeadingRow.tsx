import React, { ReactNode } from 'react';
import ExpansionCell from './ExpansionCell';

import HeadingCell from './HeadingCell';
import SelectionCell from './SelectionCell';
import { MesaStateProps, MesaColumn } from '../types';

interface HeadingRowProps<Row extends Record<PropertyKey, any>, Key = string>
  extends Pick<
    MesaStateProps<Row, Key>,
    'columns' | 'uiState' | 'eventHandlers' | 'options' | 'actions'
  > {
  filteredRows?: Row[];
  offsetLeft?: number;
}

type RenderHeadingFunction<Row extends Record<PropertyKey, any>, Key = string> =
  (
    column: MesaColumn<Row, Key>,
    columnIndex: number,
    components: any
  ) => ReactNode;

type HeadingRowColumn<Row extends Record<PropertyKey, any>, Key = string> =
  MesaColumn<Row, Key> & {
    renderHeading?:
      | boolean
      | RenderHeadingFunction<Row, Key>
      | Array<RenderHeadingFunction<Row, Key>>; // Multi-row headers: each array element becomes a separate header row
  };

class HeadingRow<
  Row extends Record<PropertyKey, any>,
  Key = string
> extends React.PureComponent<HeadingRowProps<Row, Key>> {
  render() {
    const {
      filteredRows: filteredRowsProp,
      options,
      columns,
      uiState,
      eventHandlers,
      offsetLeft,
    } = this.props;
    const filteredRows = filteredRowsProp ?? [];
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

    const headingRows = new Array(rowCount).fill({}).map((_blank, index) => {
      const isFirstRow = !index;
      const cols = columns.map((col): MesaColumn<Row, Key> => {
        const column = col as HeadingRowColumn<Row, Key>;

        if (Array.isArray(column.renderHeading)) {
          return {
            ...column,
            renderHeading:
              column.renderHeading.length > index
                ? column.renderHeading[index]
                : false,
          };
        }

        if (!isFirstRow) {
          return { ...column, renderHeading: false };
        }

        return column;
      });
      return { cols, isFirstRow };
    });

    return (
      <thead>
        {headingRows.map(({ cols, isFirstRow }, index) => {
          return (
            <tr className="Row HeadingRow" key={index}>
              {hasExpansionColumn && getRowId && (
                <ExpansionCell
                  inert={!isFirstRow}
                  heading={true}
                  key="_expansion"
                  rows={filteredRows}
                  row={filteredRows[0]}
                  getRowId={getRowId}
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
                  options={options}
                  eventHandlers={eventHandlers}
                  isRowSelected={isRowSelected}
                />
              )}
              {cols.map((column, columnIndex) => {
                let mergedColumn = column;
                if (typeof columnDefaults === 'object')
                  mergedColumn = { ...columnDefaults, ...column };
                return (
                  <HeadingCell
                    sort={sort}
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
