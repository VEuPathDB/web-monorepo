import React from 'react';
import { RadioList } from '@veupathdb/wdk-client/lib/Components';
import CheckboxList from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxList';

let FeaturesList = (props) => {
  let { features, field, formState, getUpdateHandler } = props;
  return (
    <div>
      <div
        style={{
          marginLeft: '0.75em',
        }}
      >
        <RadioList
          name={field}
          value={formState[field]}
          onChange={getUpdateHandler(field)}
          items={features}
        />
      </div>
    </div>
  );
};

// RadioList -> multiple choice
let ComponentsList = (props) => {
  let { features, field, formState, getUpdateHandler } = props;
  return (
    <div>
      <div
        style={{
          marginLeft: '0.75em',
        }}
      >
        <CheckboxList
          name={field}
          value={formState[field]}
          onChange={getUpdateHandler(field)}
          items={features}
          linksPosition={null}
          disabledCheckboxTooltipContent="Required field"
        />
      </div>
    </div>
  );
};
export { FeaturesList, ComponentsList };
