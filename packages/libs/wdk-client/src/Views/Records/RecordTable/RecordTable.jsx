import { chunk, property, orderBy, toLower } from 'lodash';
import React, { Component } from 'react';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';
import DataTable from '../../../Components/DataTable/DataTable';
import {
  renderAttributeValue,
  pure,
  wrappable,
} from '../../../Utils/ComponentUtils';

const mapAttributeType = (type) => {
  switch (type) {
    case 'number':
      return 'num';
    default:
      return undefined;
  }
};

// max columns for list mode
const maxColumns = 4;

const defaultSortId = '@@defaultSortIndex@@';
const defaultSortColumn = [{ name: defaultSortId, isDisplayable: false }];

const getSortIndex = (rowData) => rowData[defaultSortId];

const addDefaultSortId = (row, index) =>
  Object.assign({}, row, { [defaultSortId]: index });

const getColumns = (tableField) =>
  defaultSortColumn.concat(
    tableField.attributes.map((attr) => ({
      ...attr,
      sortType: mapAttributeType(attr.type),
    }))
  );

const getDisplayableAttributes = (tableField) =>
  tableField.attributes.filter((attr) => attr.isDisplayable);

const getOrderedData = (tableValue, tableField) =>
  orderBy(
    tableValue,
    tableField.clientSortSpec.map(property('itemName')),
    tableField.clientSortSpec.map(property('direction')).map(toLower)
  ).map(addDefaultSortId);

/**
 * Renders a record table
 */
class RecordTable extends Component {
  constructor(props) {
    super(props);
    this.getColumns = createSelector((props) => props.table, getColumns);
    this.getDisplayableAttributes = createSelector(
      (props) => props.table,
      getDisplayableAttributes
    );
    this.getOrderedData = createSelector(
      (props) => props.value,
      (props) => props.table,
      getOrderedData
    );
  }

  render() {
    const {
      value,
      childRow,
      expandedRows,
      onExpandedRowsChange,
      className,
      onDraw,
      searchTerm,
      onSearchTermChange,
    } = this.props;
    const displayableAttributes = this.getDisplayableAttributes(this.props);
    const columns = this.getColumns(this.props);
    const data = this.getOrderedData(this.props);

    if (value.length === 0 || columns.length === 0) {
      return (
        <p>
          <em>No data available</em>
        </p>
      );
    }

    if (displayableAttributes.length === 1) {
      let listColumnSize = Math.max(10, value.length / maxColumns);
      let attributeName = displayableAttributes[0].name;
      return (
        <div className={className}>
          {chunk(value, listColumnSize).map((tableChunk, index) => (
            <ul key={index} className="wdk-RecordTableList">
              {tableChunk.map((row, index) => (
                <li key={index}>{renderAttributeValue(row[attributeName])}</li>
              ))}
            </ul>
          ))}
        </div>
      );
    }

    return (
      <div className={className}>
        <DataTable
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          getRowId={getSortIndex}
          expandedRows={expandedRows}
          onExpandedRowsChange={onExpandedRowsChange}
          columns={columns}
          data={data}
          childRow={childRow}
          searchable={value.length > 1}
          onDraw={onDraw}
        />
      </div>
    );
  }
}

RecordTable.propTypes = {
  value: PropTypes.array.isRequired,
  table: PropTypes.object.isRequired,
  childRow: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  expandedRows: PropTypes.arrayOf(PropTypes.number),
  onExpandedRowsChange: PropTypes.func,
  className: PropTypes.string,
  onDraw: PropTypes.func,
  searchTerm: PropTypes.string,
  onSearchTermChange: PropTypes.func,
};

export default wrappable(pure(RecordTable));
