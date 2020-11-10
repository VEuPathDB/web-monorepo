import React from 'react';

let ExcelNote = props => (
  <span>
    * If you choose "Comma-delimited (.csv) file" as Download Type, you can only download a
    maximum 10MB of the results and the rest will be discarded.<br/>
    Opening a large Excel file may crash your system. If you need to get the
    complete results, please choose "Tab-delimited (.txt) file".
  </span>
);

export default ExcelNote;
