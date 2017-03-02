import { cloneElement, Component, PropTypes } from 'react';
import { flowRight, get } from 'lodash';
import { withStore, withActions } from 'eupathdb/wdkCustomization/js/client/util/component';
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

const enhance = flowRight(
  withActions({ updateTableState }),
  withStore((state, props) => ({
    tableState: get(state, 'eupathdb.tables.' + props.table.name)
  }))
);

export default enhance(RecordTableContainer);
