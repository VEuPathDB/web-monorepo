import React from 'react';

import DataRow from './DataRow';
import { MesaStateProps } from '../types';

interface DataRowListProps<Row, Key = string>
  extends MesaStateProps<Row, Key> {}

class DataRowList<Row, Key = string> extends React.Component<
  DataRowListProps<Row, Key>
> {
  constructor(props: DataRowListProps<Row, Key>) {
    super(props);
  }

  render() {
    const { props } = this;
    const { filteredRows } = props;

    return (
      <tbody className="DataRowList">
        {filteredRows &&
          filteredRows.map((row, rowIndex) => (
            <DataRow row={row} key={rowIndex} rowIndex={rowIndex} {...props} />
          ))}
      </tbody>
    );
  }
}

export default DataRowList;
