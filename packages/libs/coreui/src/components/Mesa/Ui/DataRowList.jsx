import React from 'react';

import DataRow from './DataRow';
import { makeClassifier } from '../Utils/Utils';

class DataRowList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { rows, filteredRows } = props;

    return (
      <tbody className="DataRowList">
        {filteredRows.map((row, rowIndex) => (
          <DataRow row={row} key={rowIndex} rowIndex={rowIndex} {...props} />
        ))}
      </tbody>
    );
  }
}

export default DataRowList;
