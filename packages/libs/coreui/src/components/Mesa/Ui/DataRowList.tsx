import React from 'react';

import DataRow from './DataRow';
import { MesaStateProps } from '../types';

interface DataRowListProps<Row> extends MesaStateProps<Row> {}

class DataRowList<Row> extends React.Component<DataRowListProps<Row>> {
  constructor(props: DataRowListProps<Row>) {
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
