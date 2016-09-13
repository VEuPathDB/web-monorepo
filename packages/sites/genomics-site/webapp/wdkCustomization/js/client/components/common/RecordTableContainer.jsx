import { cloneElement, PropTypes } from 'react';
import { compose, get } from 'lodash';
import { withStore, withActions } from '../../util/component';
import { updateTableState } from '../../actioncreators/RecordViewActionCreators';

// always open the first row
const defaultExpandedRows = [ 0 ];

const updateExpandedRowsWith = ({ updateTableState, table, tableState }) => (expandedRows) =>
  updateTableState(table.name,
    Object.assign({}, tableState, { expandedRows }))

/**
 * Handle state changes to table
 */
function RecordTableContainer(props) {
  return cloneElement(props.children, {
    expandedRows: get(props, 'tableState.expandedRows', defaultExpandedRows),
    onExpandedRowsChange: updateExpandedRowsWith(props)
  });
}

RecordTableContainer.propTypes = {
  children: PropTypes.element.isRequired
}

const enhance = compose(
  withActions({ updateTableState }),
  withStore((state, props) => ({
    tableState: get(state, 'eupathdb.tables.' + props.table.name)
  }))
);

export default enhance(RecordTableContainer);
