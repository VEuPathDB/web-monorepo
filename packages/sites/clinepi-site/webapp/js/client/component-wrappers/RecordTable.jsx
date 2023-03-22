import React from 'react';
import TableAsTree from '../components/TableAsTree';

export default RecordTable => props => {
  return 'tableIsTree' in props.table.properties
    ? <TableAsTree {...props} />
    : <RecordTable {...props} />;
}
