import { cloneElement, Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { updateTableState } from '../../actioncreators/RecordViewActionCreators';

/**
 * Tables that are fully collapsed on load.
 *
 * Expanded rows should not be stored in local storage, and we should
 * not default to expandind the first row.
 */
export const fullyCollapsedOnLoad = new Set(['Cellxgene']);

// always open the first row
const defaultExpandedRows = [0];

const defaultSearchTerm = '';

const HEADER_OFFSET = 103;

/**
 * Handle state changes to table
 */
class RecordTableContainer extends Component {
  constructor(props) {
    super(props);
    this._table = null;

    this.updateSearchTerm = this.updateSearchTerm.bind(this);
    this.updateExpandedRows = this.updateExpandedRows.bind(this);
    this.tryToJumpToSelectedRow = this.tryToJumpToSelectedRow.bind(this);
  }

  componentDidMount() {
    this.tryToJumpToSelectedRow(this.props.tableState?.selectedRow);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.tableState?.selectedRow !== this.props.tableState?.selectedRow
    ) {
      this.tryToJumpToSelectedRow(this.props.tableState?.selectedRow);
    }
  }

  updateSearchTerm(searchTerm) {
    const { updateTableState, table, tableState } = this.props;
    updateTableState(table.name, Object.assign({}, tableState, { searchTerm }));
  }

  updateExpandedRows(expandedRows) {
    const { updateTableState, table, tableState } = this.props;
    updateTableState(
      table.name,
      Object.assign({}, tableState, { expandedRows })
    );
  }

  tryToJumpToSelectedRow(selectedRow) {
    const { index: selectedRowIndex, id: selectedRowId } = selectedRow ?? {};

    // If the table has been initialized and a row has been selected...
    if (this._table != null && selectedRowId != null) {
      // Find the table row in the DOM
      const tableRow = this._table
        .querySelector(`#${selectedRowId}`)
        ?.closest('tr');

      // If the table row was found...
      if (tableRow != null) {
        // Expand the selected row and clear the row selection
        this.props.updateTableState(this.props.table.name, {
          ...this.props.tableState,
          selectedRow: null,
          expandedRows: [
            ...new Set(this.props.tableState?.expandedRows).add(
              selectedRowIndex
            ),
          ],
          searchTerm: '',
        });

        // Scroll to the selected row
        // FIXME: Resolve the race condition necessitating this "setTimeout".
        // Without the "setTimeout", the scroll is not triggered if the
        // section has never been opened. Perhaps we need to wait for
        // some DataTables event to complete before triggering the scroll?
        setTimeout(() => {
          const position = tableRow.getBoundingClientRect();
          window.scrollTo(
            position.left,
            position.top + window.scrollY - HEADER_OFFSET
          );
        }, 0);
      }
    }
  }

  render() {
    return cloneElement(this.props.children, {
      onDraw: (table) => {
        this._table = table;
        this.tryToJumpToSelectedRow(this.props.tableState?.selectedRow);
      },
      expandedRows: get(
        this.props,
        'tableState.expandedRows',
        fullyCollapsedOnLoad.has(this.props.table.name)
          ? []
          : defaultExpandedRows
      ),
      searchTerm: get(this.props, 'tableState.searchTerm', defaultSearchTerm),
      onExpandedRowsChange: this.updateExpandedRows,
      onSearchTermChange: this.updateSearchTerm,
    });
  }
}

RecordTableContainer.propTypes = {
  children: PropTypes.element.isRequired,
  table: PropTypes.object.isRequired,
  tableState: PropTypes.object,
  updateTableState: PropTypes.func.isRequired,
};

const enhance = connect(
  ({ record: state }, props) => ({
    tableState: get(state, 'eupathdb.tables.' + props.table.name),
  }),
  { updateTableState }
);

export default enhance(RecordTableContainer);
