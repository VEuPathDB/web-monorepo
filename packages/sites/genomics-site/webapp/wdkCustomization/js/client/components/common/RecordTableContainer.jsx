import { cloneElement, Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { updateTableState } from '../../actioncreators/RecordViewActionCreators';

// always open the first row
const defaultExpandedRows = [ 0 ];

/**
 * Handle state changes to table
 */
class RecordTableContainer extends Component {

  constructor(props) {
    super(props);
    this.updateExpandedRows = this.updateExpandedRows.bind(this);
  }

  updateExpandedRows(expandedRows) {
    const { updateTableState, table, tableState } = this.props;
    updateTableState(table.name, Object.assign({}, tableState, { expandedRows }));
  }

  render() {
    return cloneElement(this.props.children, {
      expandedRows: get(this.props, 'tableState.expandedRows', defaultExpandedRows),
      onExpandedRowsChange: this.updateExpandedRows
    });
  }

}

RecordTableContainer.propTypes = {
  children: PropTypes.element.isRequired,
  table: PropTypes.object.isRequired,
  tableState: PropTypes.object,
  updateTableState: PropTypes.func.isRequired
};

const enhance = connect(
  ({ record: state }, props) => ({
    tableState: get(state, 'eupathdb.tables.' + props.table.name)
  }),
  { updateTableState }
);

export default enhance(RecordTableContainer);
