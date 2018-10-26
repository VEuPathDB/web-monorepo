import React from 'react';

import DataRow from 'wdk-client/Components/Mesa/Ui/DataRow';
import { makeClassifier } from 'wdk-client/Components/Mesa/Utils/Utils';

class DataRowList extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { props } = this;
    const { rows, filteredRows } = props;

    return (
      <tbody className="DataRowList">
        {filteredRows.map((row, rowIndex) => (
          <DataRow
            row={row}
            key={rowIndex}
            rowIndex={rowIndex}
            {...props}
          />
        ))}
      </tbody>
    );
  }
};

export default DataRowList;
