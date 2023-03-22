import React from 'react';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import CheckboxList from 'wdk-client/Components/InputControls/CheckboxList';

let ReporterCheckboxList = props => {
  let { title, onChange, fields, selectedFields } = props;
  if (fields.length == 0) {
    return ( <noscript/> );
  }
  let mappedFields = fields.map(val => ({ value: val.name, display: val.displayName }));
  return (
    <div>
      <h3>{title}</h3>
      <div style={{padding: '0 2em'}}>
        <CheckboxList onChange={onChange} items={mappedFields} value={selectedFields}/>
      </div>
    </div>
  );
};

export default wrappable(ReporterCheckboxList);
