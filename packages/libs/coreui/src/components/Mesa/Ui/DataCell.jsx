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
    const { row, column, rowIndex, columnIndex, inline } = this.props;
    const { key, getValue } = column;
    const value =
      typeof getValue === 'function' ? getValue({ row, key }) : row[key];
    const cellProps = { key, value, row, column, rowIndex, columnIndex };

    if ('renderCell' in column) {
      return column.renderCell(cellProps);
    }

    if (!column.type || !cellProps.value) return Templates.textCell(cellProps);

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

  getTooltipText() {
    const { row, column, rowIndex, columnIndex, inline } = this.props;
    const { key, getValue } = column;
    const value =
      typeof getValue === 'function' ? getValue({ row, key }) : row[key];
    const cellProps = { key, value, row, column, rowIndex, columnIndex };

    // ignores optional renderCell wrapper function

    if (!column.type || !cellProps.value) return Templates.textText(cellProps);

    switch (column.type.toLowerCase()) {
      case 'wdklink':
        return Templates.wdkLinkText(cellProps);
      case 'link':
        return Templates.linkText(cellProps);
      case 'number':
        return Templates.numberText(cellProps);
      case 'html': {
        return undefined; // no title attribute/tooltip for HTML cells
      }
      case 'text':
      default:
        return Templates.textText(cellProps);
    }
  }

  render() {
    let { column, inline, options } = this.props;
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

    // provide basic mouse-over support for inline tables where
    // text is likely to be truncated
    const title = inline ? this.getTooltipText() : undefined;

    const children = this.renderContent();
    const props = {
      style,
      children,
      key,
      className,
      title,
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
