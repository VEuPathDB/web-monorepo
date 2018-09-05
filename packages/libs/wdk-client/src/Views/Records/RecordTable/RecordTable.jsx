import { chunk } from 'lodash';
import { Component } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../../Components/DataTable/DataTable';
import { renderAttributeValue, pure, wrappable } from '../../../Utils/ComponentUtils';

// max columns for list mode
const maxColumns = 4;

const defaultSortId = '@@defaultSortIndex@@';
const defaultSortColumn = [{ name: defaultSortId, isDisplayable: false }];
const getSortIndex = (rowData) => rowData[defaultSortId];
const addDefaultSortId = (row, index) => Object.assign({}, row, { [defaultSortId]: index });

/**
 * Renders a record table
 */
class RecordTable extends Component {
  constructor(props) {
    super(props);
    this.setColumns(props);
    this.setData(props);
  }

  componentWillReceiveProps(nextProps) {
    // Only update columns and data if props change -- to prevent unneeded render

    if (nextProps.table.attributes !== this.props.table.attributes)
      this.setColumns(nextProps);

    if (nextProps.value !== this.props.value)
      this.setData(nextProps);
  }

  setColumns(props) {
    this.displayableAttributes = props.table.attributes.filter(attr => attr.isDisplayable);
    this.columns = defaultSortColumn.concat(this.displayableAttributes);
  }

  setData(props) {
    this.data = props.value.map(addDefaultSortId);
  }

  render() {
    let { value, childRow, expandedRows, onExpandedRowsChange, className } = this.props;

    if (value.length === 0 || this.columns.length === 0) {
      return (
        <p><em>No data available</em></p>
      );
    }

    if (this.displayableAttributes.length === 1) {
      let listColumnSize = Math.max(10, value.length / maxColumns);
      let attributeName = this.displayableAttributes[0].name;
      return (
        <div className={className}>
          {chunk(value, listColumnSize).map((tableChunk, index) =>
            <ul key={index} className="wdk-RecordTableList">
              {tableChunk.map((row, index) =>
                <li key={index}>{renderAttributeValue(row[attributeName])}</li>
              )}
            </ul>
          )}
        </div>
      );
    }

    return (
      <div className={className}>
        <DataTable
          getRowId={getSortIndex}
          expandedRows={expandedRows}
          onExpandedRowsChange={onExpandedRowsChange}
          columns={this.columns}
          data={this.data}
          childRow={childRow}
          searchable={value.length > 1}
        />
      </div>
    );
  }
}

RecordTable.propTypes = {
  value: PropTypes.array.isRequired,
  table: PropTypes.object.isRequired,
  childRow: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),
  expandedRows: PropTypes.arrayOf(PropTypes.number),
  onExpandedRowsChange: PropTypes.func,
  className: PropTypes.string
};

export default wrappable(pure(RecordTable));
