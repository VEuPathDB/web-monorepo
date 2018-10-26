import React from 'react';

import Icon from 'wdk-client/Components/Icon/IconAlt';

import { isRange } from 'wdk-client/Components/AttributeFilter/AttributeFilterUtils';

export default function EmptyValue(props) {
  return (
    <div style={{ fontSize: '5rem', textAlign: 'center', margin: '5rem' }}>
      <Icon fa={isRange(props.activeField) ? 'bar-chart-o' : 'table'}/>
      <div style={{ fontSize: '1.5rem', margin: '1rem' }}>No data</div>
    </div>
  );
}
