import React from 'react';
import PropTypes from 'prop-types';

import DataCell from './DataCell';
import SelectionCell from './SelectionCell';
import { makeClassifier } from '../Utils/Utils';

const dataRowClass = makeClassifier('DataRow');

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
    if (!options.inline) return;
    this.setState({ expanded: true });
  }

  collapseRow() {
    const { options } = this.props;
    if (!options.inline) return;
    this.setState({ expanded: false });
  }

  handleRowClick() {
    const { row, rowIndex, options } = this.props;
    const { inline, onRowClick } = options;
    if (!inline && !onRowClick) return;

    if (inline) this.setState({ expanded: !this.state.expanded });
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
    const { row, rowIndex, columns, options, eventHandlers } = this.props;
    const { expanded } = this.state;
    const { columnDefaults } = options ? options : {};
    const inline = options.inline ? !expanded : false;

    const hasSelectionColumn =
      typeof options.isRowSelected === 'function' &&
      typeof eventHandlers.onRowSelect === 'function' &&
      typeof eventHandlers.onRowDeselect === 'function';

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
      <tr
        className={className}
        tabIndex={this.props.options.onRowClick ? -1 : undefined}
        style={rowStyle}
        onClick={this.handleRowClick}
        onMouseOver={this.handleRowMouseOver}
        onMouseOut={this.handleRowMouseOut}
      >
        {!hasSelectionColumn ? null : (
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
