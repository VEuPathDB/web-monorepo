import React, { ReactNode } from 'react';

import Templates from '../Templates';
import { makeClassifier } from '../Utils/Utils';
import { MesaColumn, MesaStateProps } from '../types';

import { Tooltip } from '../../../components/info/Tooltip';

const dataCellClass = makeClassifier('DataCell');

interface DataCellProps<Row> {
  column: MesaColumn<Row>;
  row: Row;
  inline?: boolean;
  options?: MesaStateProps<Row>['options'];
  rowIndex: number;
  columnIndex: number | null;
  isChildRow?: boolean;
  childRowColSpan?: number;
}

class DataCell<Row> extends React.PureComponent<DataCellProps<Row>> {
  constructor(props: DataCellProps<Row>) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
  }

  renderContent(): ReactNode {
    const { row, column, rowIndex, columnIndex, inline, options, isChildRow } =
      this.props;
    const { key, getValue } = column;
    const value =
      typeof getValue === 'function'
        ? getValue({ row, index: rowIndex })
        : (row as any)[key];
    const cellProps = {
      key,
      value,
      row,
      column,
      rowIndex,
      columnIndex: columnIndex ?? 0,
    };
    const { childRow } = options || {};
    if (isChildRow && childRow != null) {
      return childRow({ rowIndex, rowData: row });
    }
    if ('renderCell' in column && column.renderCell) {
      return column.renderCell(cellProps);
    }

    if (!column.type) return Templates.textCell(cellProps);
    if (!cellProps.value) return Templates.textCell(cellProps);

    switch (column.type.toLowerCase()) {
      case 'wdklink':
        return Templates.wdkLinkCell(cellProps);
      case 'link':
        return Templates.linkCell(cellProps);
      case 'number':
        return Templates.numberCell(cellProps);
      case 'html': {
        const Component = Templates[inline ? 'textCell' : 'htmlCell'];
        return Component(cellProps);
      }
      case 'text':
      default:
        return Templates.textCell(cellProps);
    }
  }

  setTitle(el?: HTMLTableCellElement | null): void {
    if (el == null) return;
    el.title = el.scrollWidth <= el.clientWidth ? '' : el.innerText;
  }

  render() {
    let { column, inline, options, isChildRow, childRowColSpan, rowIndex } =
      this.props;
    let { style, width, className, key } = column;

    let whiteSpace = !inline
      ? {}
      : {
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          maxWidth:
            options && options.inlineMaxWidth ? options.inlineMaxWidth : '20vw',
          maxHeight:
            options && options.inlineMaxHeight
              ? options.inlineMaxHeight
              : '2em',
        };

    const widthValue = typeof width === 'number' ? width + 'px' : width;
    const widthStyle = widthValue
      ? { width: widthValue, maxWidth: widthValue, minWidth: widthValue }
      : {};
    const finalStyle = Object.assign({}, style, widthStyle, whiteSpace);
    const finalClassName = dataCellClass() + (className ? ' ' + className : '');

    const content = this.renderContent();

    const props = {
      style: finalStyle,
      children: content,
      className: finalClassName,
      ...(isChildRow ? { colSpan: childRowColSpan } : null),
    };

    return (column as any).hidden ? null : (
      <td
        onMouseEnter={(e) => this.setTitle(e.target as HTMLTableCellElement)}
        onMouseLeave={() => this.setTitle(null)}
        key={key + '_' + rowIndex}
        {...props}
      />
    );
  }
}

export default DataCell;
