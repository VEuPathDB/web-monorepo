import React from 'react';
import PropTypes from 'prop-types';

import Templates from '../Templates';
import { makeClassifier } from '../Utils/Utils';

const dataCellClass = makeClassifier('DataCell');

class DataCell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
  }

  renderContent() {
    const { row, column, rowIndex, columnIndex, inline, options, isChildRow } =
      this.props;
    const { key, getValue } = column;
    const value =
      typeof getValue === 'function' ? getValue({ row, key }) : row[key];
    const cellProps = { key, value, row, column, rowIndex, columnIndex };
    const { childRow } = options;
    if (isChildRow && childRow != null) {
      return childRow(rowIndex, row);
    }
    if ('renderCell' in column) {
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

  render() {
    let { column, inline, options, isChildRow, childRowColSpan } = this.props;
    let { style, width, className, key } = column;

    let whiteSpace = !inline
      ? {}
      : {
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          maxWidth: options.inlineMaxWidth ? options.inlineMaxWidth : '20vw',
          maxHeight: options.inlineMaxHeight ? options.inlineMaxHeight : '2em',
        };

    width = typeof width === 'number' ? width + 'px' : width;
    width = width ? { width, maxWidth: width, minWidth: width } : {};
    style = Object.assign({}, style, width, whiteSpace);
    className = dataCellClass() + (className ? ' ' + className : '');
    const children = this.renderContent();
    const props = {
      style,
      children,
      key,
      className,
      ...(isChildRow ? { colSpan: childRowColSpan } : null),
    };

    return column.hidden ? null : <td {...props} />;
  }
}

DataCell.propTypes = {
  column: PropTypes.object,
  row: PropTypes.object,
  inline: PropTypes.bool,
  options: PropTypes.object,
  rowIndex: PropTypes.number,
  columnIndex: PropTypes.number,
};

export default DataCell;
